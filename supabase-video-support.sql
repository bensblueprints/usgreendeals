-- Add video support to landing pages
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- Create videos storage bucket if it doesn't exist
-- Run this in the Supabase dashboard SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING;

-- Set up storage policy for videos bucket (run in Supabase dashboard)
-- CREATE POLICY "Public video access" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
-- CREATE POLICY "Admin video upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos');
-- CREATE POLICY "Admin video delete" ON storage.objects FOR DELETE USING (bucket_id = 'videos');
