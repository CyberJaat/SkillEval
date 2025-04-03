
-- Create a bucket for storing recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true);

-- Set up policies for the recordings bucket

-- Anyone can read recordings (public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'recordings');

-- Only authenticated users can upload recordings
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
);

-- Users can update their own recordings
CREATE POLICY "Users can update their own recordings"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (auth.uid())::text = (SPLIT_PART(name, '_', 2))
);

-- Users can delete their own recordings
CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings' AND
  (auth.uid())::text = (SPLIT_PART(name, '_', 2))
);
