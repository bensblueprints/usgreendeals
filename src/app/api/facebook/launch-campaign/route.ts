import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'greendeals2024';

interface AdCreative {
  id: string;
  client_id: string;
  name: string;
  image_url: string;
  headline: string;
  primary_text: string;
  description: string;
  link_url: string;
  call_to_action: string;
  budget_type: 'daily' | 'lifetime';
  daily_budget: number;
  lifetime_budget: number;
  start_date: string;
  end_date: string;
  age_min: number;
  age_max: number;
  genders: string[];
  locations: string[];
  interests: string[];
  optimization_goal: string;
}

interface Client {
  id: string;
  name: string;
  fb_ad_account_id: string;
  fb_access_token: string;
  fb_page_id: string;
  fb_pixel_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { creative, client }: { creative: AdCreative; client: Client } = await request.json();

    if (!client.fb_ad_account_id || !client.fb_access_token) {
      return NextResponse.json({ error: 'Missing Facebook credentials' }, { status: 400 });
    }

    const adAccountId = client.fb_ad_account_id.startsWith('act_')
      ? client.fb_ad_account_id
      : `act_${client.fb_ad_account_id}`;

    // Step 1: Create Campaign
    const campaignResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: client.fb_access_token,
          name: creative.name || 'Campaign',
          objective: getObjective(creative.optimization_goal),
          status: 'PAUSED', // Start paused for review
          special_ad_categories: [], // Empty for non-special ads
        }),
      }
    );

    const campaignData = await campaignResponse.json();
    if (campaignData.error) {
      console.error('Campaign creation error:', campaignData.error);
      return NextResponse.json({
        error: `Campaign creation failed: ${campaignData.error.message}`
      }, { status: 400 });
    }

    const campaignId = campaignData.id;

    // Step 2: Create Ad Set
    const adSetPayload: Record<string, unknown> = {
      access_token: client.fb_access_token,
      name: `${creative.name} - Ad Set`,
      campaign_id: campaignId,
      billing_event: 'IMPRESSIONS',
      optimization_goal: creative.optimization_goal || 'LINK_CLICKS',
      targeting: {
        age_min: creative.age_min || 25,
        age_max: creative.age_max || 55,
        genders: getGenderTargeting(creative.genders),
        geo_locations: {
          countries: creative.locations || ['US'],
        },
        ...(creative.interests?.length > 0 && {
          flexible_spec: [{
            interests: creative.interests.map(interest => ({
              name: interest,
            })),
          }],
        }),
      },
      status: 'PAUSED',
    };

    // Add budget
    if (creative.budget_type === 'lifetime') {
      adSetPayload.lifetime_budget = Math.round((creative.lifetime_budget || 500) * 100); // Convert to cents
      adSetPayload.end_time = new Date(creative.end_date).toISOString();
    } else {
      adSetPayload.daily_budget = Math.round((creative.daily_budget || 20) * 100); // Convert to cents
    }

    // Add start time
    if (creative.start_date) {
      const startDate = new Date(creative.start_date);
      if (startDate > new Date()) {
        adSetPayload.start_time = startDate.toISOString();
      }
    }

    // Add pixel for conversion tracking
    if (client.fb_pixel_id && creative.optimization_goal === 'CONVERSIONS') {
      adSetPayload.promoted_object = {
        pixel_id: client.fb_pixel_id,
        custom_event_type: 'LEAD',
      };
    }

    const adSetResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/adsets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adSetPayload),
      }
    );

    const adSetData = await adSetResponse.json();
    if (adSetData.error) {
      console.error('Ad Set creation error:', adSetData.error);
      // Clean up: delete the campaign
      await fetch(`https://graph.facebook.com/v19.0/${campaignId}?access_token=${client.fb_access_token}`, {
        method: 'DELETE',
      });
      return NextResponse.json({
        error: `Ad Set creation failed: ${adSetData.error.message}`
      }, { status: 400 });
    }

    const adSetId = adSetData.id;

    // Step 3: Create Ad Creative
    const adCreativePayload = {
      access_token: client.fb_access_token,
      name: `${creative.name} - Creative`,
      object_story_spec: {
        page_id: client.fb_page_id,
        link_data: {
          image_url: creative.image_url,
          link: creative.link_url,
          message: creative.primary_text || '',
          name: creative.headline || '',
          description: creative.description || '',
          call_to_action: {
            type: creative.call_to_action || 'LEARN_MORE',
            value: {
              link: creative.link_url,
            },
          },
        },
      },
    };

    const adCreativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/adcreatives`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adCreativePayload),
      }
    );

    const adCreativeData = await adCreativeResponse.json();
    if (adCreativeData.error) {
      console.error('Ad Creative creation error:', adCreativeData.error);
      // Clean up
      await fetch(`https://graph.facebook.com/v19.0/${adSetId}?access_token=${client.fb_access_token}`, {
        method: 'DELETE',
      });
      await fetch(`https://graph.facebook.com/v19.0/${campaignId}?access_token=${client.fb_access_token}`, {
        method: 'DELETE',
      });
      return NextResponse.json({
        error: `Ad Creative creation failed: ${adCreativeData.error.message}`
      }, { status: 400 });
    }

    const creativeId = adCreativeData.id;

    // Step 4: Create Ad
    const adPayload = {
      access_token: client.fb_access_token,
      name: creative.name || 'Ad',
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED',
    };

    const adResponse = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/ads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adPayload),
      }
    );

    const adData = await adResponse.json();
    if (adData.error) {
      console.error('Ad creation error:', adData.error);
      return NextResponse.json({
        error: `Ad creation failed: ${adData.error.message}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      adset_id: adSetId,
      ad_id: adData.id,
      creative_id: creativeId,
      message: 'Campaign created successfully! It is currently PAUSED. Review and activate in Facebook Ads Manager.',
    });

  } catch (error) {
    console.error('Facebook campaign launch error:', error);
    return NextResponse.json(
      { error: 'Failed to launch campaign' },
      { status: 500 }
    );
  }
}

function getObjective(optimizationGoal: string): string {
  switch (optimizationGoal) {
    case 'CONVERSIONS':
      return 'OUTCOME_LEADS';
    case 'LINK_CLICKS':
      return 'OUTCOME_TRAFFIC';
    case 'LANDING_PAGE_VIEWS':
      return 'OUTCOME_TRAFFIC';
    case 'REACH':
      return 'OUTCOME_AWARENESS';
    case 'IMPRESSIONS':
      return 'OUTCOME_AWARENESS';
    default:
      return 'OUTCOME_TRAFFIC';
  }
}

function getGenderTargeting(genders: string[]): number[] {
  if (!genders || genders.length === 0 || genders.includes('all')) {
    return [1, 2]; // All genders
  }
  const result: number[] = [];
  if (genders.includes('male')) result.push(1);
  if (genders.includes('female')) result.push(2);
  return result.length > 0 ? result : [1, 2];
}
