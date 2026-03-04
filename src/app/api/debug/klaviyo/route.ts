import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getLandingPageById, getClientById, syncToClientKlaviyo } from '@/lib/storage';

// Debug endpoint to test Klaviyo sync
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const landingPageId = searchParams.get('landing_page_id');
  const subscriberId = searchParams.get('subscriber_id');

  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  try {
    // If landing page ID provided, check its config
    if (landingPageId) {
      const landingPage = await getLandingPageById(landingPageId);
      debug.landingPage = landingPage ? {
        id: landingPage.id,
        name: landingPage.name,
        slug: landingPage.slug,
        client_id: landingPage.client_id,
        klaviyo_list_id: landingPage.klaviyo_list_id,
        collect_first_name: landingPage.collect_first_name,
        active: landingPage.active,
      } : 'NOT FOUND';

      if (landingPage?.client_id) {
        const client = await getClientById(landingPage.client_id);
        debug.client = client ? {
          id: client.id,
          name: client.name,
          has_klaviyo_api_key: !!client.klaviyo_api_key,
          api_key_preview: client.klaviyo_api_key ? `${client.klaviyo_api_key.substring(0, 10)}...` : null,
          klaviyo_list_id: client.klaviyo_list_id,
        } : 'NOT FOUND';

        debug.effectiveListId = landingPage.klaviyo_list_id || client?.klaviyo_list_id || 'NONE';
        debug.syncWillWork = !!(client?.klaviyo_api_key && (landingPage.klaviyo_list_id || client?.klaviyo_list_id));
      }
    }

    // If subscriber ID provided, get their info
    if (subscriberId) {
      const { data: subscriber } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .eq('id', subscriberId)
        .single();

      debug.subscriber = subscriber ? {
        id: subscriber.id,
        email: subscriber.email,
        first_name: subscriber.first_name,
        zip_code: subscriber.zip_code,
        landing_page_id: subscriber.landing_page_id,
        synced_klaviyo: subscriber.synced_klaviyo,
        synced_ghl: subscriber.synced_ghl,
        created_at: subscriber.created_at,
      } : 'NOT FOUND';
    }

    // Get recent subscribers for overview
    const { data: recentSubs } = await supabaseAdmin
      .from('subscribers')
      .select('id, email, first_name, landing_page_id, synced_klaviyo, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    debug.recentSubscribers = recentSubs;

    // Get all landing pages with their list configs
    const { data: pages } = await supabaseAdmin
      .from('landing_pages')
      .select('id, name, slug, client_id, klaviyo_list_id, active')
      .order('created_at', { ascending: false });

    debug.landingPages = pages;

    // Get all clients
    const { data: clients } = await supabaseAdmin
      .from('clients')
      .select('id, name, klaviyo_api_key, klaviyo_list_id, is_default')
      .order('created_at', { ascending: false });

    debug.clients = clients?.map(c => ({
      ...c,
      klaviyo_api_key: c.klaviyo_api_key ? `${c.klaviyo_api_key.substring(0, 10)}...` : null,
    }));

    return NextResponse.json(debug, { status: 200 });
  } catch (error) {
    debug.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(debug, { status: 500 });
  }
}

// Manual sync endpoint
export async function POST(request: NextRequest) {
  try {
    const { subscriberId } = await request.json();

    if (!subscriberId) {
      return NextResponse.json({ error: 'subscriberId required' }, { status: 400 });
    }

    // Get subscriber
    const { data: subscriber, error: subError } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('id', subscriberId)
      .single();

    if (subError || !subscriber) {
      return NextResponse.json({ error: 'Subscriber not found', details: subError }, { status: 404 });
    }

    console.log('=== MANUAL SYNC START ===');
    console.log('Subscriber:', {
      id: subscriber.id,
      email: subscriber.email,
      first_name: subscriber.first_name,
      zip_code: subscriber.zip_code,
      landing_page_id: subscriber.landing_page_id,
    });

    if (!subscriber.landing_page_id) {
      return NextResponse.json({
        error: 'No landing page associated',
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          landing_page_id: subscriber.landing_page_id,
        }
      }, { status: 400 });
    }

    // Get landing page
    const landingPage = await getLandingPageById(subscriber.landing_page_id);
    console.log('Landing page:', landingPage ? {
      id: landingPage.id,
      name: landingPage.name,
      client_id: landingPage.client_id,
      klaviyo_list_id: landingPage.klaviyo_list_id,
    } : 'NOT FOUND');

    if (!landingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    if (!landingPage.client_id) {
      return NextResponse.json({
        error: 'Landing page has no client assigned',
        landingPage: {
          id: landingPage.id,
          name: landingPage.name,
          client_id: landingPage.client_id,
        }
      }, { status: 400 });
    }

    // Get client
    const client = await getClientById(landingPage.client_id);
    console.log('Client:', client ? {
      id: client.id,
      name: client.name,
      has_api_key: !!client.klaviyo_api_key,
      klaviyo_list_id: client.klaviyo_list_id,
    } : 'NOT FOUND');

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.klaviyo_api_key) {
      return NextResponse.json({
        error: 'Client has no Klaviyo API key',
        client: {
          id: client.id,
          name: client.name,
        }
      }, { status: 400 });
    }

    const targetListId = landingPage.klaviyo_list_id || client.klaviyo_list_id;
    console.log('Target list ID:', targetListId);

    if (!targetListId) {
      return NextResponse.json({
        error: 'No Klaviyo list configured',
        landingPage: { klaviyo_list_id: landingPage.klaviyo_list_id },
        client: { klaviyo_list_id: client.klaviyo_list_id },
      }, { status: 400 });
    }

    // Perform sync using the corrected 2-step approach
    console.log('Calling Klaviyo API (2-step process)...');
    console.log('API Key preview:', client.klaviyo_api_key?.substring(0, 15) + '...');

    try {
      // Step 1: Create/update profile with full data
      const profilePayload = {
        data: {
          type: 'profile',
          attributes: {
            email: subscriber.email,
            ...(subscriber.first_name?.trim() && { first_name: subscriber.first_name.trim() }),
            ...(subscriber.zip_code && {
              location: {
                zip: subscriber.zip_code,
              }
            }),
          },
        },
      };

      console.log('Step 1: Creating/updating profile...');
      const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${client.klaviyo_api_key}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify(profilePayload),
      });

      const profileText = await profileResponse.text();
      console.log('Profile response status:', profileResponse.status);
      console.log('Profile response:', profileText);

      let profileId: string | null = null;
      let profileStatus = '';

      if (profileResponse.status === 201) {
        const profileData = JSON.parse(profileText);
        profileId = profileData.data?.id;
        profileStatus = 'created';
      } else if (profileResponse.status === 409) {
        const conflictData = JSON.parse(profileText);
        profileId = conflictData.errors?.[0]?.meta?.duplicate_profile_id;
        profileStatus = 'exists';

        // Update existing profile
        if (profileId && (subscriber.first_name?.trim() || subscriber.zip_code)) {
          const updatePayload = {
            data: {
              type: 'profile',
              id: profileId,
              attributes: {
                ...(subscriber.first_name?.trim() && { first_name: subscriber.first_name.trim() }),
                ...(subscriber.zip_code && {
                  location: {
                    zip: subscriber.zip_code,
                  }
                }),
              },
            },
          };

          const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Klaviyo-API-Key ${client.klaviyo_api_key}`,
              'Content-Type': 'application/json',
              'revision': '2024-02-15',
            },
            body: JSON.stringify(updatePayload),
          });
          console.log('Profile update status:', updateResponse.status);
          profileStatus = 'updated';
        }
      } else {
        profileStatus = 'failed';
      }

      // Step 2: Subscribe to list
      const subscribePayload = {
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: subscriber.email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: 'SUBSCRIBED',
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: targetListId,
              },
            },
          },
        },
      };

      console.log('Step 2: Subscribing to list...');
      const subscribeResponse = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${client.klaviyo_api_key}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify(subscribePayload),
      });

      const subscribeText = await subscribeResponse.text();
      console.log('Subscribe response status:', subscribeResponse.status);
      console.log('Subscribe response:', subscribeText);

      if (subscribeResponse.ok || subscribeResponse.status === 202) {
        // Mark as synced
        await supabaseAdmin
          .from('subscribers')
          .update({ synced_klaviyo: true })
          .eq('id', subscriberId);

        console.log('=== MANUAL SYNC SUCCESS ===');
        return NextResponse.json({
          success: true,
          message: 'Synced to Klaviyo',
          details: {
            subscriber: subscriber.email,
            firstName: subscriber.first_name,
            listId: targetListId,
            clientName: client.name,
            profileId: profileId,
            profileStatus: profileStatus,
            subscribeStatus: subscribeResponse.status,
          }
        });
      } else {
        console.log('=== MANUAL SYNC FAILED ===');
        let errorDetails;
        try {
          errorDetails = JSON.parse(subscribeText);
        } catch {
          errorDetails = subscribeText;
        }
        return NextResponse.json({
          error: 'Klaviyo subscription failed',
          klaviyoStatus: subscribeResponse.status,
          klaviyoError: errorDetails,
          profileStatus: profileStatus,
          sentPayload: {
            email: subscriber.email,
            first_name: subscriber.first_name,
            listId: targetListId,
          }
        }, { status: 500 });
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({
        error: 'Failed to call Klaviyo API',
        fetchError: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
