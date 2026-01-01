-- ============================================
-- SETUP SUPABASE STORAGE FOR EVENT POSTERS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create a storage bucket for event posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to event-posters" ON storage.objects;
DROP POLICY IF EXISTS "Public can update event-posters" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete from event-posters" ON storage.objects;

-- Step 3: Create new policies for event-posters bucket
CREATE POLICY "event_posters_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-posters');

CREATE POLICY "event_posters_public_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-posters');

CREATE POLICY "event_posters_public_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'event-posters');

CREATE POLICY "event_posters_public_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'event-posters');

-- Step 4: Verify the bucket and policies were created
SELECT * FROM storage.buckets WHERE id = 'event-posters';

SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE 'event_posters%';
