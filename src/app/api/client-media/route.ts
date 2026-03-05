import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all media for a client
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const folder = searchParams.get('folder'); // 'landing', 'thankyou', 'logo', 'general', or null for all
    const fileType = searchParams.get('type'); // 'image', 'video', 'gif', or null for all

    if (!clientId) {
      return NextResponse.json({ error: 'client_id required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('client_media')
      .select('*')
      .eq('client_id', clientId)
      .order('uploaded_at', { ascending: false });

    if (folder) {
      query = query.eq('folder', folder);
    }

    if (fileType) {
      if (fileType === 'video') {
        query = query.in('file_type', ['video', 'gif']);
      } else {
        query = query.eq('file_type', fileType);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching client media:', error);
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }

    return NextResponse.json({ media: data || [] });
  } catch (error) {
    console.error('Get client media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST - Upload media for a client
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('client_id') as string;
    const clientSlug = formData.get('client_slug') as string;
    const folder = (formData.get('folder') as string) || 'general';
    const altText = formData.get('alt_text') as string;

    if (!file || !clientId || !clientSlug) {
      return NextResponse.json({ error: 'file, client_id, and client_slug required' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // Determine file type
    const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
    const videoTypes = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    const gifTypes = ['gif'];

    let fileType: 'image' | 'video' | 'gif';

    if (imageTypes.includes(fileExt || '')) {
      fileType = 'image';
    } else if (videoTypes.includes(fileExt || '')) {
      fileType = 'video';
    } else if (gifTypes.includes(fileExt || '')) {
      fileType = 'gif';
    } else {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: jpg, jpeg, png, webp, svg, gif, mp4, webm, mov'
      }, { status: 400 });
    }

    // Size limits: 100MB for video, 10MB for images/gifs
    const maxSize = fileType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json({ error: `File too large. Max: ${maxMB}MB` }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${safeName}`;

    // Determine bucket based on file type
    const bucket = fileType === 'video' || fileType === 'gif' ? 'Videos' : 'images';
    const storagePath = `clients/${clientSlug}/${folder}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;

    // Save to client_media table
    const { data: mediaRecord, error: dbError } = await supabaseAdmin
      .from('client_media')
      .insert({
        client_id: clientId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type,
        folder: folder,
        alt_text: altText || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to delete the uploaded file if db insert fails
      await supabaseAdmin.storage.from(bucket).remove([storagePath]);
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      media: mediaRecord,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}

// DELETE - Remove media
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media id required' }, { status: 400 });
    }

    // Get the media record first
    const { data: media, error: fetchError } = await supabaseAdmin
      .from('client_media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Extract storage path from URL
    const urlParts = media.file_url.split('/storage/v1/object/public/');
    if (urlParts.length === 2) {
      const [bucket, ...pathParts] = urlParts[1].split('/');
      const storagePath = pathParts.join('/');

      // Delete from storage
      await supabaseAdmin.storage.from(bucket).remove([storagePath]);
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('client_media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
