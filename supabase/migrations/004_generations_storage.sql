-- ============================================
-- Generations Storage Bucket - For generated images
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the generations bucket for storing generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generations', 'generations', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for generations bucket
-- ============================================

-- Users can upload to their own folder (folder name = user ID)
CREATE POLICY "Users can upload to generations folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view generated images (public bucket)
CREATE POLICY "Public can view generations" ON storage.objects
  FOR SELECT USING (bucket_id = 'generations');

-- Users can delete their own generated images
CREATE POLICY "Users can delete own generations" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'generations' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
