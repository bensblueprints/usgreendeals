-- ============================================
-- FIX SUBSCRIBER CLIENT ASSOCIATIONS
-- Run this SQL to ensure subscribers are linked to their clients
-- ============================================

-- 1. Make sure client_id column exists on subscribers
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS klaviyo_list_id TEXT;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_client ON subscribers(client_id);

-- 3. BACKFILL: Update subscribers with client_id from their landing page
-- This finds subscribers that have a landing_page_id but no client_id,
-- and sets the client_id based on the landing page's client
UPDATE subscribers s
SET client_id = lp.client_id
FROM landing_pages lp
WHERE s.landing_page_id = lp.id
  AND s.client_id IS NULL
  AND lp.client_id IS NOT NULL;

-- 4. Also update klaviyo_list_id if missing
UPDATE subscribers s
SET klaviyo_list_id = COALESCE(lp.klaviyo_list_id, c.klaviyo_list_id)
FROM landing_pages lp
LEFT JOIN clients c ON lp.client_id = c.id
WHERE s.landing_page_id = lp.id
  AND s.klaviyo_list_id IS NULL
  AND (lp.klaviyo_list_id IS NOT NULL OR c.klaviyo_list_id IS NOT NULL);

-- 5. Check results
SELECT
  'Total subscribers' as metric,
  COUNT(*) as count
FROM subscribers
UNION ALL
SELECT
  'Subscribers with client_id',
  COUNT(*)
FROM subscribers WHERE client_id IS NOT NULL
UNION ALL
SELECT
  'Subscribers without client_id',
  COUNT(*)
FROM subscribers WHERE client_id IS NULL;

-- 6. Show subscriber counts by client
SELECT
  c.name as client_name,
  COUNT(s.id) as subscriber_count
FROM clients c
LEFT JOIN subscribers s ON s.client_id = c.id
GROUP BY c.id, c.name
ORDER BY subscriber_count DESC;
