-- Clients table for managing different Klaviyo lists
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  klaviyo_api_key TEXT,
  klaviyo_list_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add client_id and is_homepage to landing_pages
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS is_homepage BOOLEAN DEFAULT false;

-- Create index for homepage lookup
CREATE INDEX IF NOT EXISTS idx_landing_pages_homepage ON landing_pages(is_homepage) WHERE is_homepage = true;
CREATE INDEX IF NOT EXISTS idx_landing_pages_client ON landing_pages(client_id);

-- Insert default client
INSERT INTO clients (name, slug) VALUES
('Default', 'default')
ON CONFLICT (slug) DO NOTHING;

-- Create storage bucket for images if it doesn't exist
-- Run this in Supabase dashboard: Storage > New Bucket > Name: images, Public: true
