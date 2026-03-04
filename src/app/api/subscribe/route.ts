import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, syncToGHL, incrementConversionsDirectly, getLandingPageById, getClientById, syncToClientKlaviyo } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      zipCode,
      firstName,
      landingPageId,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      referrer
    } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add subscriber with zip code, first name, and UTM params
    const utmParams = {
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_term: utm_term || undefined,
      utm_content: utm_content || undefined,
      referrer: referrer || undefined,
    };

    const subscriber = await addSubscriber(email, 'landing', zipCode, firstName || '', utmParams);

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
    console.log('=== KLAVIYO SYNC DEBUG ===');
    console.log('Landing page ID:', landingPageId);
    console.log('Subscriber:', { email: subscriber.email, first_name: subscriber.first_name, id: subscriber.id });

    if (landingPageId) {
      const landingPage = await getLandingPageById(landingPageId);
      console.log('Landing page found:', landingPage ? {
        id: landingPage.id,
        name: landingPage.name,
        client_id: landingPage.client_id,
        klaviyo_list_id: landingPage.klaviyo_list_id
      } : 'NULL');

      if (landingPage?.client_id) {
        const client = await getClientById(landingPage.client_id);
        console.log('Client found:', client ? {
          id: client.id,
          name: client.name,
          has_api_key: !!client.klaviyo_api_key,
          klaviyo_list_id: client.klaviyo_list_id
        } : 'NULL');

        // Use landing page's list_id, or fall back to client's default list
        const targetListId = landingPage.klaviyo_list_id || client?.klaviyo_list_id;
        console.log('Target list ID:', targetListId);

        if (client?.klaviyo_api_key && targetListId) {
          try {
            console.log('Calling syncToClientKlaviyo...');
            const klaviyoResult = await syncToClientKlaviyo(subscriber, client, targetListId);
            console.log('Klaviyo sync result:', klaviyoResult, 'to list:', targetListId);
          } catch (err) {
            console.error('Klaviyo sync error:', err);
          }
        } else {
          console.log('MISSING: Client API key:', !!client?.klaviyo_api_key, 'List ID:', targetListId);
        }
      } else {
        console.log('Landing page has no client_id assigned');
      }
    } else {
      console.log('No landing page ID provided');
    }
    console.log('=== END KLAVIYO DEBUG ===');

    // Always sync to GHL
    syncToGHL(subscriber).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
      subscriberId: subscriber.id,
      landingPageId: landingPageId || null,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
