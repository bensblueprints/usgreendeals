-- Landing Pages table for A/B testing
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  background_image TEXT,
  background_color TEXT DEFAULT '#1a1a2e',
  headline TEXT DEFAULT 'Exclusive Green Lifestyle Deals',
  subheadline TEXT DEFAULT 'Join our exclusive list for premium wellness deals.',
  button_text TEXT DEFAULT 'Get Exclusive Deals',
  theme TEXT DEFAULT 'light', -- 'light' or 'dark'
  custom_css TEXT,
  active BOOLEAN DEFAULT true,
  traffic_weight INTEGER DEFAULT 50, -- percentage of traffic (0-100)
  views INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  collect_first_name BOOLEAN DEFAULT false, -- A/B test: ask for first name or not
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add landing_page_id and first_name to subscribers
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS landing_page_id UUID REFERENCES landing_pages(id);
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_landing_pages_active ON landing_pages(active);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_subscribers_landing_page ON subscribers(landing_page_id);

-- Insert default landing pages
INSERT INTO landing_pages (name, slug, theme, traffic_weight, headline, subheadline) VALUES
('Original Green', 'original', 'light', 50, 'Exclusive Green Lifestyle Deals', 'Join our exclusive list for premium wellness deals. Curated savings on natural products you''ll love.'),
('Psychedelic Gorilla', 'gorilla', 'dark', 50, 'Join the Movement', 'Premium deals for the elevated lifestyle. Be first to know.')
ON CONFLICT (slug) DO NOTHING;
