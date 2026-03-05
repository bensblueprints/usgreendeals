-- ============================================
-- CLIENT RELATIONS - SUBSCRIBERS, DEALS & IMPRESSIONS
-- ============================================

-- 1. Add client_id to subscribers table
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 2. Add client_id to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- 3. Add impressions and clicks tracking to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS last_impression_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS last_click_at TIMESTAMPTZ;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_client ON subscribers(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_impressions ON deals(impressions);

-- 5. Create function to increment deal impressions
CREATE OR REPLACE FUNCTION increment_deal_impressions(deal_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE deals
  SET impressions = impressions + 1,
      last_impression_at = NOW()
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to increment deal clicks
CREATE OR REPLACE FUNCTION increment_deal_clicks(deal_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE deals
  SET clicks = clicks + 1,
      last_click_at = NOW()
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Create view for client dashboard stats
CREATE OR REPLACE VIEW client_stats AS
SELECT
  c.id as client_id,
  c.name as client_name,
  c.slug as client_slug,
  c.is_default,
  c.active,
  (SELECT COUNT(*) FROM landing_pages WHERE client_id = c.id) as landing_page_count,
  (SELECT COUNT(*) FROM thank_you_pages WHERE client_id = c.id) as thank_you_page_count,
  (SELECT COUNT(*) FROM subscribers WHERE client_id = c.id) as subscriber_count,
  (SELECT COUNT(*) FROM deals WHERE client_id = c.id) as deal_count,
  (SELECT COALESCE(SUM(views), 0) FROM landing_pages WHERE client_id = c.id) as total_views,
  (SELECT COALESCE(SUM(conversions), 0) FROM landing_pages WHERE client_id = c.id) as total_conversions,
  (SELECT COALESCE(SUM(impressions), 0) FROM deals WHERE client_id = c.id) as total_deal_impressions,
  (SELECT COALESCE(SUM(clicks), 0) FROM deals WHERE client_id = c.id) as total_deal_clicks
FROM clients c
ORDER BY c.is_default DESC, c.name ASC;

-- 8. Create deal_impressions table for detailed analytics
CREATE TABLE IF NOT EXISTS deal_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  ip_hash TEXT, -- Hashed IP for privacy
  user_agent TEXT,
  referrer TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create deal_clicks table for detailed analytics
CREATE TABLE IF NOT EXISTS deal_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_deal_impressions_deal ON deal_impressions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_impressions_time ON deal_impressions(recorded_at);
CREATE INDEX IF NOT EXISTS idx_deal_clicks_deal ON deal_clicks(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_clicks_time ON deal_clicks(recorded_at);

-- 11. Enable RLS on new tables
ALTER TABLE deal_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_clicks ENABLE ROW LEVEL SECURITY;

-- 12. Create policies for service role
CREATE POLICY "Service role full access" ON deal_impressions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON deal_clicks FOR ALL USING (true);

-- 13. Grant permissions
GRANT ALL ON deal_impressions TO service_role;
GRANT ALL ON deal_clicks TO service_role;
