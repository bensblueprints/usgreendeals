-- ============================================
-- ENTERPRISE PAGE MANAGEMENT SYSTEM
-- ============================================

-- 1. Add show_logo and thank_you_page_id to landing_pages
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT false;
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS thank_you_page_id UUID;

-- 2. Create thank_you_pages table (mirrors landing_pages structure)
CREATE TABLE IF NOT EXISTS thank_you_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),

  -- Content
  headline TEXT DEFAULT 'Thank You!',
  subheadline TEXT DEFAULT 'Your submission has been received.',
  body_text TEXT,

  -- Media
  background_image TEXT,
  background_color TEXT DEFAULT '#1a1a2e',
  video_url TEXT,

  -- Styling
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  custom_css TEXT,
  show_logo BOOLEAN DEFAULT true,

  -- CTA Button (optional - for redirects, offers, etc.)
  cta_text TEXT,
  cta_url TEXT,
  cta_style TEXT DEFAULT 'primary',

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add foreign key for landing_pages -> thank_you_pages
ALTER TABLE landing_pages
ADD CONSTRAINT fk_thank_you_page
FOREIGN KEY (thank_you_page_id)
REFERENCES thank_you_pages(id)
ON DELETE SET NULL;

-- 4. Create client_media table to track all client uploads
CREATE TABLE IF NOT EXISTS client_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'gif')),
  file_size INTEGER,
  mime_type TEXT,

  -- Organization
  folder TEXT DEFAULT 'general', -- 'landing', 'thankyou', 'logo', 'general'

  -- Metadata
  alt_text TEXT,
  description TEXT,

  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_thank_you_pages_client ON thank_you_pages(client_id);
CREATE INDEX IF NOT EXISTS idx_thank_you_pages_slug ON thank_you_pages(slug);
CREATE INDEX IF NOT EXISTS idx_client_media_client ON client_media(client_id);
CREATE INDEX IF NOT EXISTS idx_client_media_type ON client_media(file_type);
CREATE INDEX IF NOT EXISTS idx_client_media_folder ON client_media(folder);
CREATE INDEX IF NOT EXISTS idx_landing_pages_thank_you ON landing_pages(thank_you_page_id);

-- 6. Create view for page connections dashboard
CREATE OR REPLACE VIEW page_connections AS
SELECT
  lp.id as landing_page_id,
  lp.name as landing_page_name,
  lp.slug as landing_page_slug,
  lp.active as landing_page_active,
  lp.views,
  lp.conversions,
  CASE WHEN lp.views > 0 THEN ROUND((lp.conversions::numeric / lp.views::numeric) * 100, 2) ELSE 0 END as conversion_rate,
  tp.id as thank_you_page_id,
  tp.name as thank_you_page_name,
  tp.slug as thank_you_page_slug,
  tp.active as thank_you_page_active,
  c.id as client_id,
  c.name as client_name,
  c.logo_url as client_logo
FROM landing_pages lp
LEFT JOIN thank_you_pages tp ON lp.thank_you_page_id = tp.id
LEFT JOIN clients c ON lp.client_id = c.id
ORDER BY lp.created_at DESC;

-- 7. Function to get client media stats
CREATE OR REPLACE FUNCTION get_client_media_stats(p_client_id UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_images BIGINT,
  total_videos BIGINT,
  total_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_files,
    COUNT(*) FILTER (WHERE file_type = 'image')::BIGINT as total_images,
    COUNT(*) FILTER (WHERE file_type IN ('video', 'gif'))::BIGINT as total_videos,
    COALESCE(SUM(file_size), 0)::BIGINT as total_size
  FROM client_media
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql;
