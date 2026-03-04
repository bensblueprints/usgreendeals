import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    // Fetch lists from Klaviyo
    const response = await fetch('https://a.klaviyo.com/api/lists', {
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'revision': '2024-02-15',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Klaviyo API error:', error);
      return NextResponse.json({ error: 'Invalid API key or Klaviyo error' }, { status: 400 });
    }

    const data = await response.json();
    const lists = data.data?.map((list: { id: string; attributes: { name: string } }) => ({
      id: list.id,
      name: list.attributes.name,
    })) || [];

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Klaviyo lists error:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

// Manual sync endpoint
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, first_name, api_key, list_id } = await request.json();

    if (!email || !api_key || !list_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sync to Klaviyo
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${api_key}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email,
                    ...(first_name?.trim() && { first_name: first_name.trim() }),
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
                id: list_id,
              },
            },
          },
        },
      }),
    });

    if (response.ok || response.status === 202) {
      return NextResponse.json({ success: true });
    }

    const error = await response.text();
    console.error('Klaviyo sync error:', error);
    return NextResponse.json({ error: 'Sync failed', details: error }, { status: 400 });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
