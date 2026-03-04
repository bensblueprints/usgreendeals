import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, syncToGHL, incrementConversionsDirectly, getLandingPageById, getClientById, syncToClientKlaviyo } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, zipCode, firstName, landingPageId } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add subscriber with zip code and optional first name
    const subscriber = await addSubscriber(email, 'landing', zipCode, firstName || '');

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Track landing page conversion if provided
    if (landingPageId) {
      // Update subscriber with landing page reference
      await supabaseAdmin
        .from('subscribers')
        .update({ landing_page_id: landingPageId })
        .eq('id', subscriber.id);

      // Increment conversion count
      await incrementConversionsDirectly(landingPageId);
    }

    // Sync to Klaviyo using landing page's list (via client's API key)
    if (landingPageId) {
      const landingPage = await getLandingPageById(landingPageId);
      if (landingPage?.client_id) {
        const client = await getClientById(landingPage.client_id);
        // Use landing page's list_id, or fall back to client's default list
        const targetListId = landingPage.klaviyo_list_id || client?.klaviyo_list_id;

        if (client?.klaviyo_api_key && targetListId) {
          try {
            const klaviyoResult = await syncToClientKlaviyo(subscriber, client, targetListId);
            console.log('Klaviyo sync result:', klaviyoResult, 'to list:', targetListId);
          } catch (err) {
            console.error('Klaviyo sync error:', err);
          }
        } else {
          console.log('Client has no Klaviyo API key or no list configured:', landingPage.client_id);
        }
      } else {
        console.log('Landing page has no client assigned:', landingPageId);
      }
    }

    // Always sync to GHL
    syncToGHL(subscriber).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
