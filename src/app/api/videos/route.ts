import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('videos')
      .list('landing-pages', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing videos:', error);
      return NextResponse.json({ error: 'Failed to list videos' }, { status: 500 });
    }

    const videos = (data || [])
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file => ({
        name: file.name,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/landing-pages/${file.name}`,
        created_at: file.created_at,
      }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['mp4', 'webm', 'mov', 'avi', 'mkv'];

    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: mp4, webm, mov, avi, mkv' }, { status: 400 });
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max size: 100MB' }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabaseAdmin.storage
      .from('videos')
      .upload(`landing-pages/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/landing-pages/${fileName}`;

    return NextResponse.json({ success: true, url, name: fileName });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Video name required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage
      .from('videos')
      .remove([`landing-pages/${name}`]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
