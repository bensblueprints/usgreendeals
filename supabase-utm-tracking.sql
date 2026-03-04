-- Add UTM tracking columns to subscribers table
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS utm_source TEXT DEFAULT NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS utm_medium TEXT DEFAULT NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS utm_campaign TEXT DEFAULT NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS utm_term TEXT DEFAULT NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS utm_content TEXT DEFAULT NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS referrer TEXT DEFAULT NULL;

-- Create index for UTM source lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_source ON subscribers(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscribers_utm_campaign ON subscribers(utm_campaign) WHERE utm_campaign IS NOT NULL;
