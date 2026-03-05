import { supabaseAdmin } from './supabase';

// Types
export interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  zip_code: string;
  created_at: string;
  source: string;
  synced_klaviyo: boolean;
  synced_ghl: boolean;
  landing_page_id?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

export interface LandingPage {
  id: string;
  name: string;
  slug: string;
  background_image: string | null;
  background_color: string;
  video_url: string | null;
  headline: string;
  subheadline: string;
  button_text: string;
  theme: 'light' | 'dark';
  custom_css: string | null;
  active: boolean;
  traffic_weight: number;
  views: number;
  conversions: number;
  collect_first_name: boolean;
  is_homepage: boolean;
  client_id: string | null;
  klaviyo_list_id: string | null;
  show_logo: boolean;
  thank_you_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThankYouPage {
  id: string;
  name: string;
  slug: string;
  client_id: string | null;
  headline: string;
  subheadline: string;
  body_text: string | null;
  background_image: string | null;
  background_color: string;
  video_url: string | null;
  theme: 'light' | 'dark';
  custom_css: string | null;
  show_logo: boolean;
  cta_text: string | null;
  cta_url: string | null;
  cta_style: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientMedia {
  id: string;
  client_id: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'gif';
  file_size: number | null;
  mime_type: string | null;
  folder: string;
  alt_text: string | null;
  description: string | null;
  uploaded_at: string;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  klaviyo_api_key: string | null;
  klaviyo_list_id: string | null;
  logo_url: string | null;
  active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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

export async function addSubscriber(
  email: string,
  source: string = 'landing',
  zipCode: string = '',
  firstName: string = '',
  utmParams?: UTMParams
): Promise<Subscriber | null> {
  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from('subscribers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    // Update zip code, first name, and UTM if not set
    const updates: Record<string, string | null> = {};
    if (!existing.zip_code && zipCode) updates.zip_code = zipCode;
    if (!existing.first_name && firstName) updates.first_name = firstName;
    // Update UTM params if not already set
    if (utmParams) {
      if (!existing.utm_source && utmParams.utm_source) updates.utm_source = utmParams.utm_source;
      if (!existing.utm_medium && utmParams.utm_medium) updates.utm_medium = utmParams.utm_medium;
      if (!existing.utm_campaign && utmParams.utm_campaign) updates.utm_campaign = utmParams.utm_campaign;
      if (!existing.utm_term && utmParams.utm_term) updates.utm_term = utmParams.utm_term;
      if (!existing.utm_content && utmParams.utm_content) updates.utm_content = utmParams.utm_content;
      if (!existing.referrer && utmParams.referrer) updates.referrer = utmParams.referrer;
    }

    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from('subscribers')
        .update(updates)
        .eq('id', existing.id);
      Object.assign(existing, updates);
    }
    return existing;
  }

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .insert({
      email: email.toLowerCase(),
      first_name: firstName || null,
      zip_code: zipCode,
      source,
      synced_klaviyo: false,
      synced_ghl: false,
      utm_source: utmParams?.utm_source || null,
      utm_medium: utmParams?.utm_medium || null,
      utm_campaign: utmParams?.utm_campaign || null,
      utm_term: utmParams?.utm_term || null,
      utm_content: utmParams?.utm_content || null,
      referrer: utmParams?.referrer || null,
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

export async function deleteSubscriber(id: string): Promise<void> {
  await supabaseAdmin
    .from('subscribers')
    .delete()
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

  console.log('Syncing to Klaviyo:', { email: subscriber.email, first_name: subscriber.first_name || 'none' });

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
                    ...(subscriber.first_name?.trim() && { first_name: subscriber.first_name.trim() }),
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

// Landing Pages for A/B Testing
export async function getLandingPages(): Promise<LandingPage[]> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching landing pages:', error);
    return [];
  }

  return data || [];
}

export async function getActiveLandingPages(): Promise<LandingPage[]> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching active landing pages:', error);
    return [];
  }

  return data || [];
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching landing page:', error);
    return null;
  }

  return data;
}

// Extended landing page with related data for frontend
export interface LandingPageWithRelations extends LandingPage {
  client?: Client | null;
  thank_you_page?: ThankYouPage | null;
}

export async function getLandingPageBySlugWithRelations(slug: string): Promise<LandingPageWithRelations | null> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select(`
      *,
      clients:client_id (*),
      thank_you_pages:thank_you_page_id (*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching landing page with relations:', error);
    return null;
  }

  if (!data) return null;

  // Transform to match our interface
  return {
    ...data,
    client: data.clients || null,
    thank_you_page: data.thank_you_pages || null,
  };
}

export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching landing page:', error);
    return null;
  }

  return data;
}

export async function saveLandingPage(page: Partial<LandingPage> & { id?: string }): Promise<LandingPage | null> {
  if (page.id) {
    // Update existing
    const { data, error } = await supabaseAdmin
      .from('landing_pages')
      .update({
        name: page.name,
        slug: page.slug,
        background_image: page.background_image,
        background_color: page.background_color,
        headline: page.headline,
        subheadline: page.subheadline,
        button_text: page.button_text,
        theme: page.theme,
        custom_css: page.custom_css,
        active: page.active,
        traffic_weight: page.traffic_weight,
        collect_first_name: page.collect_first_name ?? false,
        client_id: page.client_id || null,
        klaviyo_list_id: page.klaviyo_list_id || null,
        show_logo: page.show_logo ?? false,
        thank_you_page_id: page.thank_you_page_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating landing page:', error);
      return null;
    }

    return data;
  }

  // Create new
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .insert({
      name: page.name,
      slug: page.slug,
      background_image: page.background_image || null,
      background_color: page.background_color || '#1a1a2e',
      headline: page.headline || 'Exclusive Green Lifestyle Deals',
      subheadline: page.subheadline || 'Join our exclusive list for premium wellness deals.',
      button_text: page.button_text || 'Get Exclusive Deals',
      theme: page.theme || 'light',
      custom_css: page.custom_css || null,
      active: page.active ?? true,
      traffic_weight: page.traffic_weight ?? 50,
      collect_first_name: page.collect_first_name ?? false,
      is_homepage: page.is_homepage ?? false,
      client_id: page.client_id || null,
      klaviyo_list_id: page.klaviyo_list_id || null,
      show_logo: page.show_logo ?? false,
      thank_you_page_id: page.thank_you_page_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating landing page:', error);
    return null;
  }

  return data;
}

export async function deleteLandingPage(id: string): Promise<void> {
  await supabaseAdmin
    .from('landing_pages')
    .delete()
    .eq('id', id);
}

export async function resetLandingPageStats(id: string): Promise<void> {
  await supabaseAdmin
    .from('landing_pages')
    .update({ views: 0, conversions: 0 })
    .eq('id', id);
}

export async function incrementLandingPageViews(id: string): Promise<void> {
  await supabaseAdmin.rpc('increment_landing_page_views', { page_id: id });
}

export async function incrementLandingPageConversions(id: string): Promise<void> {
  await supabaseAdmin.rpc('increment_landing_page_conversions', { page_id: id });
}

// Fallback increment functions if RPC doesn't exist
export async function incrementViewsDirectly(id: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from('landing_pages')
    .select('views')
    .eq('id', id)
    .single();

  if (data) {
    await supabaseAdmin
      .from('landing_pages')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id);
  }
}

export async function incrementConversionsDirectly(id: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from('landing_pages')
    .select('conversions')
    .eq('id', id)
    .single();

  if (data) {
    await supabaseAdmin
      .from('landing_pages')
      .update({ conversions: (data.conversions || 0) + 1 })
      .eq('id', id);
  }
}

// Get landing pages for a specific client
export async function getLandingPagesByClient(clientId: string): Promise<LandingPage[]> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching client landing pages:', error);
    return [];
  }

  return data || [];
}

// Get active landing pages for a specific client
export async function getActiveLandingPagesByClient(clientId: string): Promise<LandingPage[]> {
  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching active client landing pages:', error);
    return [];
  }

  return data || [];
}

// Select a random landing page based on traffic weights (for a specific client)
export async function selectRandomLandingPage(clientId?: string): Promise<LandingPage | null> {
  let pages: LandingPage[];

  if (clientId) {
    pages = await getActiveLandingPagesByClient(clientId);
  } else {
    // If no client specified, get pages from the default client
    const defaultClient = await getDefaultClient();
    if (defaultClient) {
      pages = await getActiveLandingPagesByClient(defaultClient.id);
    } else {
      // Fallback to all active pages if no default client
      pages = await getActiveLandingPages();
    }
  }

  if (pages.length === 0) return null;
  if (pages.length === 1) return pages[0];

  // Calculate total weight
  const totalWeight = pages.reduce((sum, page) => sum + (page.traffic_weight || 0), 0);
  if (totalWeight === 0) return pages[0];

  // Random selection based on weight
  let random = Math.random() * totalWeight;
  for (const page of pages) {
    random -= page.traffic_weight || 0;
    if (random <= 0) return page;
  }

  return pages[0];
}

// Get landing page stats
export async function getLandingPageStats(): Promise<{ total_views: number; total_conversions: number; pages: LandingPage[] }> {
  const pages = await getLandingPages();
  const total_views = pages.reduce((sum, p) => sum + (p.views || 0), 0);
  const total_conversions = pages.reduce((sum, p) => sum + (p.conversions || 0), 0);

  return { total_views, total_conversions, pages };
}

// Set a landing page as homepage within its client (unset others for that client)
export async function setHomepage(id: string): Promise<void> {
  // First get the page to know its client
  const page = await getLandingPageById(id);
  if (!page) return;

  // Unset homepage for all pages belonging to this client
  if (page.client_id) {
    await supabaseAdmin
      .from('landing_pages')
      .update({ is_homepage: false })
      .eq('client_id', page.client_id)
      .eq('is_homepage', true);
  }

  // Set the new homepage
  await supabaseAdmin
    .from('landing_pages')
    .update({ is_homepage: true })
    .eq('id', id);
}

// Get the homepage landing page (from default client or specified client)
export async function getHomepage(clientId?: string): Promise<LandingPage | null> {
  let targetClientId = clientId;

  // If no client specified, use the default client
  if (!targetClientId) {
    const defaultClient = await getDefaultClient();
    if (defaultClient) {
      targetClientId = defaultClient.id;
    }
  }

  if (!targetClientId) {
    // Fallback: get any homepage
    const { data } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .eq('is_homepage', true)
      .single();
    return data || null;
  }

  const { data, error } = await supabaseAdmin
    .from('landing_pages')
    .select('*')
    .eq('client_id', targetClientId)
    .eq('is_homepage', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Get the default client
export async function getDefaultClient(): Promise<Client | null> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('is_default', true)
    .eq('active', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Set a client as the default (unset others)
export async function setDefaultClient(id: string): Promise<void> {
  // First, unset all default clients
  await supabaseAdmin
    .from('clients')
    .update({ is_default: false })
    .eq('is_default', true);

  // Set the new default
  await supabaseAdmin
    .from('clients')
    .update({ is_default: true })
    .eq('id', id);
}

// Clients CRUD
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data || [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data;
}

export async function saveClient(client: Partial<Client> & { id?: string }): Promise<Client | null> {
  if (client.id) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({
        name: client.name,
        slug: client.slug,
        klaviyo_api_key: client.klaviyo_api_key,
        klaviyo_list_id: client.klaviyo_list_id,
        logo_url: client.logo_url,
        active: client.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    return data;
  }

  // For new clients, check if this is the first client (make it default)
  const existingClients = await getClients();
  const isFirstClient = existingClients.length === 0;

  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({
      name: client.name,
      slug: client.slug,
      klaviyo_api_key: client.klaviyo_api_key || null,
      klaviyo_list_id: client.klaviyo_list_id || null,
      logo_url: client.logo_url || null,
      active: client.active ?? true,
      is_default: isFirstClient,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    return null;
  }

  return data;
}

export async function deleteClient(id: string): Promise<void> {
  await supabaseAdmin
    .from('clients')
    .delete()
    .eq('id', id);
}

// Sync to client-specific Klaviyo with a specific list
export async function syncToClientKlaviyo(subscriber: Subscriber, client: Client, listId?: string): Promise<boolean> {
  const targetListId = listId || client.klaviyo_list_id;

  if (!client.klaviyo_api_key || !targetListId) {
    console.log('Client Klaviyo not configured or no list specified');
    return false;
  }

  console.log('=== KLAVIYO API CALL ===');
  console.log('Subscriber data:', {
    email: subscriber.email,
    first_name: subscriber.first_name,
    zip_code: subscriber.zip_code,
  });
  console.log('Target list:', targetListId);

  try {
    // Step 1: Create/update the profile with full data using Profiles API
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

    console.log('Creating/updating profile...');
    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${client.klaviyo_api_key}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify(profilePayload),
    });

    let profileId: string | null = null;
    const profileText = await profileResponse.text();
    console.log('Profile response status:', profileResponse.status);

    if (profileResponse.status === 201) {
      // Profile created
      const profileData = JSON.parse(profileText);
      profileId = profileData.data?.id;
      console.log('Profile created with ID:', profileId);
    } else if (profileResponse.status === 409) {
      // Profile exists - get the ID from the error
      const conflictData = JSON.parse(profileText);
      profileId = conflictData.errors?.[0]?.meta?.duplicate_profile_id;
      console.log('Profile exists with ID:', profileId);

      // Update the existing profile with name/zip if we have them
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

        console.log('Updating existing profile...');
        await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Klaviyo-API-Key ${client.klaviyo_api_key}`,
            'Content-Type': 'application/json',
            'revision': '2024-02-15',
          },
          body: JSON.stringify(updatePayload),
        });
      }
    } else {
      console.error('Profile creation failed:', profileText);
    }

    // Step 2: Subscribe the profile to the list
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

    console.log('Subscribing to list...');
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
      console.log('=== KLAVIYO SYNC SUCCESS ===');
      return true;
    }
    console.error('Client Klaviyo sync failed:', subscribeText);
    return false;
  } catch (error) {
    console.error('Client Klaviyo sync error:', error);
    return false;
  }
}
