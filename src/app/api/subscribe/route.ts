import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, syncToKlaviyo, syncToGHL, incrementConversionsDirectly, getLandingPageById, getClientById, syncToClientKlaviyo } from '@/lib/storage';
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

    // Attempt to sync to Klaviyo and GHL (non-blocking)
    // Check if landing page has a client with custom Klaviyo settings
    let useClientKlaviyo = false;
    if (landingPageId) {
      const landingPage = await getLandingPageById(landingPageId);
      if (landingPage?.client_id) {
        const client = await getClientById(landingPage.client_id);
        if (client?.klaviyo_api_key && client?.klaviyo_list_id) {
          useClientKlaviyo = true;
          syncToClientKlaviyo(subscriber, client).catch(console.error);
        }
      }
    }

    // If no client Klaviyo, use default settings
    if (!useClientKlaviyo) {
      try {
        const klaviyoResult = await syncToKlaviyo(subscriber);
        console.log('Klaviyo sync result:', klaviyoResult);
      } catch (err) {
        console.error('Klaviyo sync error:', err);
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
