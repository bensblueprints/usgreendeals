-- ============================================
-- FACEBOOK ADS INTEGRATION - CLIENTS & AD CREATIVES
-- ============================================

-- 1. Add Facebook Ads fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fb_ad_account_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fb_access_token TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fb_page_id TEXT;

-- 2. Create ad_creatives table for storing ad assets
CREATE TABLE IF NOT EXISTS ad_creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  headline TEXT,
  primary_text TEXT,
  description TEXT,
  link_url TEXT,
  call_to_action TEXT DEFAULT 'LEARN_MORE',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  fb_ad_id TEXT,  -- Facebook Ad ID once published
  fb_campaign_id TEXT,  -- Facebook Campaign ID
  fb_adset_id TEXT,  -- Facebook Ad Set ID
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_creatives_client ON ad_creatives(client_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_fb_ad ON ad_creatives(fb_ad_id);

-- 4. Enable RLS on ad_creatives
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;

-- 5. Create policy for service role
CREATE POLICY "Service role full access" ON ad_creatives FOR ALL USING (true);

-- 6. Grant permissions
GRANT ALL ON ad_creatives TO service_role;

-- 7. Create function to update ad_creatives updated_at timestamp
CREATE OR REPLACE FUNCTION update_ad_creative_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at
DROP TRIGGER IF EXISTS ad_creatives_updated_at ON ad_creatives;
CREATE TRIGGER ad_creatives_updated_at
  BEFORE UPDATE ON ad_creatives
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_creative_timestamp();

-- 9. Create view for ad performance by client
CREATE OR REPLACE VIEW client_ad_stats AS
SELECT
  c.id as client_id,
  c.name as client_name,
  c.fb_ad_account_id,
  (SELECT COUNT(*) FROM ad_creatives WHERE client_id = c.id) as total_creatives,
  (SELECT COUNT(*) FROM ad_creatives WHERE client_id = c.id AND status = 'active') as active_creatives,
  (SELECT COUNT(*) FROM ad_creatives WHERE client_id = c.id AND status = 'draft') as draft_creatives,
  (SELECT COALESCE(SUM(impressions), 0) FROM ad_creatives WHERE client_id = c.id) as total_impressions,
  (SELECT COALESCE(SUM(clicks), 0) FROM ad_creatives WHERE client_id = c.id) as total_clicks,
  (SELECT COALESCE(SUM(spend), 0) FROM ad_creatives WHERE client_id = c.id) as total_spend
FROM clients c
WHERE c.active = true
ORDER BY c.name ASC;
