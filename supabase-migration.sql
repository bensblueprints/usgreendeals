-- USGreenDeals Database Schema
-- Run this in your Supabase SQL Editor

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'landing',
  synced_klaviyo BOOLEAN DEFAULT false,
  synced_ghl BOOLEAN DEFAULT false
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT NOT NULL,
  discount TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active deals
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(active, sort_order);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('klaviyo_api_key', ''),
  ('klaviyo_list_id', ''),
  ('ghl_api_key', 'pit-d6b661eb-5662-4b97-acb9-dd7360bb1c0f'),
  ('ghl_location_id', 'fl5rL3eZQWBq2GYlDPkl'),
  ('site_title', 'US Green Deals'),
  ('site_description', 'Exclusive wellness deals delivered to your inbox')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS) - but allow service role full access
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (allows all operations with service key)
CREATE POLICY "Service role full access" ON subscribers FOR ALL USING (true);
CREATE POLICY "Service role full access" ON deals FOR ALL USING (true);
CREATE POLICY "Service role full access" ON settings FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON subscribers TO service_role;
GRANT ALL ON deals TO service_role;
GRANT ALL ON settings TO service_role;
