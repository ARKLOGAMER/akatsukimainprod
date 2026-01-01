-- ============================================
-- FIX: Allow admins to read ALL events
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Public can read events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Admins can read all events" ON events;

-- 1. Allow public to read ONLY listable events
CREATE POLICY "Public can read listable events"
ON events FOR SELECT
TO anon, authenticated
USING (is_listable = true);

-- 2. Allow admins to read ALL events (including non-listable)
CREATE POLICY "Admins can read all events"
ON events FOR SELECT
TO authenticated
USING (
  auth.jwt()->>'email' IN (SELECT email FROM admins)
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'events'
ORDER BY policyname;
