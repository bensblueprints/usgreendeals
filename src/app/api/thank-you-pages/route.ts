import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all thank you pages or get one by id/slug
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const clientId = searchParams.get('client_id');

    // Public access for slug lookups (for frontend)
    if (slug) {
      const { data, error } = await supabaseAdmin
        .from('thank_you_pages')
        .select('*, clients(name, logo_url, slug, fb_pixel_id)')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Thank you page not found' }, { status: 404 });
      }

      return NextResponse.json(data);
    }

    // Admin access required for listing
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get single page by ID
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('thank_you_pages')
        .select('*, clients(name, logo_url, slug, fb_pixel_id)')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Thank you page not found' }, { status: 404 });
      }

      return NextResponse.json(data);
    }

    // List all pages (optionally filtered by client)
    let query = supabaseAdmin
      .from('thank_you_pages')
      .select('*, clients(name, logo_url, slug, fb_pixel_id)')
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching thank you pages:', error);
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }

    return NextResponse.json({ pages: data || [] });
  } catch (error) {
    console.error('Get thank you pages error:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// POST - Create or update a thank you page
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await request.json();

    if (page.id) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('thank_you_pages')
        .update({
          name: page.name,
          slug: page.slug,
          client_id: page.client_id || null,
          headline: page.headline,
          subheadline: page.subheadline,
          body_text: page.body_text || null,
          background_image: page.background_image || null,
          background_color: page.background_color || '#1a1a2e',
          video_url: page.video_url || null,
          theme: page.theme || 'dark',
          custom_css: page.custom_css || null,
          show_logo: page.show_logo ?? true,
          cta_text: page.cta_text || null,
          cta_url: page.cta_url || null,
          cta_style: page.cta_style || 'primary',
          active: page.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', page.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating thank you page:', error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // Create new
    const { data, error } = await supabaseAdmin
      .from('thank_you_pages')
      .insert({
        name: page.name,
        slug: page.slug,
        client_id: page.client_id || null,
        headline: page.headline || 'Thank You!',
        subheadline: page.subheadline || 'Your submission has been received.',
        body_text: page.body_text || null,
        background_image: page.background_image || null,
        background_color: page.background_color || '#1a1a2e',
        video_url: page.video_url || null,
        theme: page.theme || 'dark',
        custom_css: page.custom_css || null,
        show_logo: page.show_logo ?? true,
        cta_text: page.cta_text || null,
        cta_url: page.cta_url || null,
        cta_style: page.cta_style || 'primary',
        active: page.active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating thank you page:', error);
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Save thank you page error:', error);
    return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
  }
}

// DELETE - Remove a thank you page
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Page id required' }, { status: 400 });
    }

    // First, unlink any landing pages that reference this thank you page
    await supabaseAdmin
      .from('landing_pages')
      .update({ thank_you_page_id: null })
      .eq('thank_you_page_id', id);

    // Then delete the page
    const { error } = await supabaseAdmin
      .from('thank_you_pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting thank you page:', error);
      return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete thank you page error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
