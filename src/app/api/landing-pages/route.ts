import { NextRequest, NextResponse } from 'next/server';
import {
  getLandingPages,
  getLandingPagesByClient,
  getLandingPageBySlug,
  saveLandingPage,
  deleteLandingPage,
  selectRandomLandingPage,
  incrementViewsDirectly,
  getLandingPageStats,
  setHomepage,
  getHomepage
} from '@/lib/storage';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const clientId = searchParams.get('client_id');

  try {
    if (action === 'random') {
      // Get a random page for A/B testing (optionally for a specific client)
      const page = await selectRandomLandingPage(clientId || undefined);
      if (page) {
        // Increment views
        await incrementViewsDirectly(page.id);
      }
      return NextResponse.json({ page });
    }

    if (action === 'homepage') {
      // Get the current homepage (optionally for a specific client)
      const page = await getHomepage(clientId || undefined);
      return NextResponse.json({ page });
    }

    if (action === 'by-slug') {
      // Get a specific landing page by slug
      const slug = searchParams.get('slug');
      if (!slug) {
        return NextResponse.json({ error: 'Slug required' }, { status: 400 });
      }
      const page = await getLandingPageBySlug(slug);
      return NextResponse.json({ page });
    }

    if (action === 'stats') {
      const stats = await getLandingPageStats();
      return NextResponse.json(stats);
    }

    // Get landing pages - filter by client if specified
    if (clientId) {
      const pages = await getLandingPagesByClient(clientId);
      return NextResponse.json({ pages });
    }

    // Default: get all landing pages
    const pages = await getLandingPages();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error in landing pages GET:', error);
    return NextResponse.json({ error: 'Failed to fetch landing pages' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'set-homepage' && id) {
      await setHomepage(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in landing pages PUT:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Increment views action (no auth required for public pages)
    if (action === 'increment-views') {
      const id = searchParams.get('id');
      if (id) {
        await incrementViewsDirectly(id);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Save landing page (requires body)
    const body = await request.json();
    const page = await saveLandingPage(body);

    if (!page) {
      return NextResponse.json({ error: 'Failed to save landing page' }, { status: 500 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error in landing pages POST:', error);
    return NextResponse.json({ error: 'Failed to save landing page' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 });
    }

    await deleteLandingPage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in landing pages DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete landing page' }, { status: 500 });
  }
}
