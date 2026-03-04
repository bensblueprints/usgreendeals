-- Add is_default column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add klaviyo_list_id column to landing_pages table
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS klaviyo_list_id TEXT DEFAULT NULL;

-- Set the first client as default if none exists
UPDATE clients SET is_default = true
WHERE id = (SELECT id FROM clients ORDER BY created_at ASC LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM clients WHERE is_default = true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_is_default ON clients(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_landing_pages_client_id ON landing_pages(client_id);
