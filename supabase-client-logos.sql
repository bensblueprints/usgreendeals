-- Add logo_url column to clients table for storing client logos (gif, video, or image)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for client logos if not exists
-- Run this in Supabase dashboard: Storage > New Bucket > Name: client-logos, Public: true
