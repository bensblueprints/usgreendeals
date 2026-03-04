import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getLandingPageById, getClientById, syncToClientKlaviyo } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { subscriberId, landingPageId } = await request.json();

    console.log('=== KLAVIYO DELAYED SYNC ===');
    console.log('Subscriber ID:', subscriberId);
    console.log('Landing Page ID:', landingPageId);

    if (!subscriberId) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    // Get subscriber from database
    const { data: subscriber, error: subError } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('id', subscriberId)
      .single();

    if (subError || !subscriber) {
      console.error('Subscriber not found:', subError);
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    console.log('Subscriber found:', {
      email: subscriber.email,
      first_name: subscriber.first_name,
      landing_page_id: subscriber.landing_page_id
    });

    // Use the landing page ID from request or from subscriber record
    const pageId = landingPageId || subscriber.landing_page_id;

    if (!pageId) {
      console.log('No landing page ID associated with subscriber');
      return NextResponse.json(
        { error: 'No landing page associated' },
        { status: 400 }
      );
    }

    // Get landing page
    const landingPage = await getLandingPageById(pageId);
    console.log('Landing page:', landingPage ? {
      id: landingPage.id,
      name: landingPage.name,
      client_id: landingPage.client_id,
      klaviyo_list_id: landingPage.klaviyo_list_id
    } : 'NOT FOUND');

    if (!landingPage?.client_id) {
      console.log('Landing page has no client assigned');
      return NextResponse.json(
        { error: 'Landing page has no client' },
        { status: 400 }
      );
    }

    // Get client
    const client = await getClientById(landingPage.client_id);
    console.log('Client:', client ? {
      id: client.id,
      name: client.name,
      has_api_key: !!client.klaviyo_api_key,
      klaviyo_list_id: client.klaviyo_list_id
    } : 'NOT FOUND');

    if (!client?.klaviyo_api_key) {
      console.log('Client has no Klaviyo API key');
      return NextResponse.json(
        { error: 'Client has no Klaviyo API key' },
        { status: 400 }
      );
    }

    // Determine target list (landing page list or client default)
    const targetListId = landingPage.klaviyo_list_id || client.klaviyo_list_id;
    console.log('Target Klaviyo List ID:', targetListId);

    if (!targetListId) {
      console.log('No Klaviyo list configured');
      return NextResponse.json(
        { error: 'No Klaviyo list configured' },
        { status: 400 }
      );
    }

    // Sync to Klaviyo
    console.log('Syncing to Klaviyo...');
    const result = await syncToClientKlaviyo(subscriber, client, targetListId);
    console.log('Sync result:', result);

    if (result) {
      // Update subscriber record to mark as synced
      await supabaseAdmin
        .from('subscribers')
        .update({ synced_klaviyo: true })
        .eq('id', subscriberId);

      console.log('=== KLAVIYO SYNC SUCCESS ===');
      return NextResponse.json({
        success: true,
        message: 'Synced to Klaviyo',
        listId: targetListId
      });
    } else {
      console.log('=== KLAVIYO SYNC FAILED ===');
      return NextResponse.json(
        { error: 'Klaviyo sync failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Klaviyo sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to Klaviyo' },
      { status: 500 }
    );
  }
}
