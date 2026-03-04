import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types for database tables
export interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  zip_code: string | null;
  created_at: string;
  source: string;
  synced_klaviyo: boolean;
  synced_ghl: boolean;
  landing_page_id?: string;
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
  id: string;
  key: string;
  value: string;
  updated_at: string;
}
