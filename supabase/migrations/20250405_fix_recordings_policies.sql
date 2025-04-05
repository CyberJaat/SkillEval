
-- Drop existing policies for the recordings bucket to reset them
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own recordings" ON storage.objects;

-- Create new, more permissive policies for the recordings bucket

-- Anyone can read recordings (public)
CREATE POLICY "Public Access for Recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'recordings');

-- Authenticated users can upload recordings to the recordings bucket
CREATE POLICY "Authenticated Users Can Upload to Recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings');

-- Authenticated users can update recordings
CREATE POLICY "Authenticated Users Can Update Recordings"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'recordings');

-- Authenticated users can delete recordings
CREATE POLICY "Authenticated Users Can Delete Recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'recordings');
