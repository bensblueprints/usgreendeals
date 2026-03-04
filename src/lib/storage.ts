import { supabaseAdmin } from './supabase';

// Types
export interface Subscriber {
  id: string;
  email: string;
  zip_code: string;
  created_at: string;
  source: string;
  synced_klaviyo: boolean;
  synced_ghl: boolean;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  discount: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Settings {
  klaviyo_api_key: string;
  klaviyo_list_id: string;
  ghl_api_key: string;
  ghl_location_id: string;
  site_title: string;
  site_description: string;
}

// Subscribers
export async function getSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }

  return data || [];
}

export async function addSubscriber(email: string, source: string = 'landing', zipCode: string = ''): Promise<Subscriber | null> {
  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    // Update zip code if not set
    if (!existing.zip_code && zipCode) {
      await supabaseAdmin
        .from('subscribers')
        .update({ zip_code: zipCode })
        .eq('id', existing.id);
      existing.zip_code = zipCode;
    }
    return existing;
  }

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .insert({
      email: email.toLowerCase(),
      zip_code: zipCode,
      source,
      synced_klaviyo: false,
      synced_ghl: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding subscriber:', error);
    return null;
  }

  return data;
}

export async function updateSubscriberSync(
  id: string,
  platform: 'klaviyo' | 'ghl',
  synced: boolean
): Promise<void> {
  const field = platform === 'klaviyo' ? 'synced_klaviyo' : 'synced_ghl';

  await supabaseAdmin
    .from('subscribers')
    .update({ [field]: synced })
    .eq('id', id);
}

// Deals
export async function getDeals(): Promise<Deal[]> {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching deals:', error);
    return [];
  }

  return data || [];
}

export async function getActiveDeals(): Promise<Deal[]> {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching active deals:', error);
    return [];
  }

  return data || [];
}

export async function saveDeal(deal: Partial<Deal> & { id?: string }): Promise<Deal | null> {
  if (deal.id) {
    // Update existing
    const { data, error } = await supabaseAdmin
      .from('deals')
      .update({
        title: deal.title,
        description: deal.description,
        image_url: deal.image_url,
        link: deal.link,
        discount: deal.discount,
        active: deal.active,
        sort_order: deal.sort_order,
      })
      .eq('id', deal.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      return null;
    }

    return data;
  }

  // Create new
  const { data, error } = await supabaseAdmin
    .from('deals')
    .insert({
      title: deal.title,
      description: deal.description,
      image_url: deal.image_url,
      link: deal.link,
      discount: deal.discount,
      active: deal.active ?? true,
      sort_order: deal.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating deal:', error);
    return null;
  }

  return data;
}

export async function deleteDeal(id: string): Promise<void> {
  await supabaseAdmin
    .from('deals')
    .delete()
    .eq('id', id);
}

// Settings
const DEFAULT_SETTINGS: Settings = {
  klaviyo_api_key: '',
  klaviyo_list_id: '',
  ghl_api_key: process.env.GHL_API_KEY || '',
  ghl_location_id: process.env.GHL_LOCATION_ID || '',
  site_title: 'US Green Deals',
  site_description: 'Exclusive wellness deals delivered to your inbox',
};

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('key, value');

  if (error || !data || data.length === 0) {
    return DEFAULT_SETTINGS;
  }

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of data) {
    if (row.key in settings) {
      (settings as Record<string, string>)[row.key] = row.value || '';
    }
  }

  return settings;
}

export async function saveSettings(newSettings: Partial<Settings>): Promise<Settings> {
  for (const [key, value] of Object.entries(newSettings)) {
    await supabaseAdmin
      .from('settings')
      .upsert({ key, value: value || '', updated_at: new Date().toISOString() });
  }

  return getSettings();
}

// Sync functions for Klaviyo and GHL
export async function syncToKlaviyo(subscriber: Subscriber): Promise<boolean> {
  const settings = await getSettings();
  if (!settings.klaviyo_api_key || !settings.klaviyo_list_id) {
    console.log('Klaviyo not configured');
    return false;
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${settings.klaviyo_api_key}`,
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
                    email: subscriber.email,
                    location: {
                      zip: subscriber.zip_code,
                    },
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
            historical_import: false,
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: settings.klaviyo_list_id,
              },
            },
          },
        },
      }),
    });

    if (response.ok || response.status === 202) {
      await updateSubscriberSync(subscriber.id, 'klaviyo', true);
      return true;
    }
    console.error('Klaviyo sync failed:', await response.text());
    return false;
  } catch (error) {
    console.error('Klaviyo sync error:', error);
    return false;
  }
}

export async function syncToGHL(subscriber: Subscriber): Promise<boolean> {
  const settings = await getSettings();
  if (!settings.ghl_api_key || !settings.ghl_location_id) {
    console.log('GHL not configured');
    return false;
  }

  try {
    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.ghl_api_key}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify({
        email: subscriber.email,
        postalCode: subscriber.zip_code,
        locationId: settings.ghl_location_id,
        source: 'USGreenDeals Landing Page',
        tags: ['420-deals', 'landing-page'],
      }),
    });

    if (response.ok || response.status === 201) {
      await updateSubscriberSync(subscriber.id, 'ghl', true);
      return true;
    }
    console.error('GHL sync failed:', await response.text());
    return false;
  } catch (error) {
    console.error('GHL sync error:', error);
    return false;
  }
}
