-- Fix RSVP permissions for admin to view RSVPs
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_read_rsvps" ON rsvps;
DROP POLICY IF EXISTS "admin_read_rsvps" ON rsvps;

-- Allow authenticated users to read RSVPs
CREATE POLICY "authenticated_read_rsvps"
ON rsvps
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update RSVP status
CREATE POLICY "authenticated_update_rsvps"
ON rsvps
FOR UPDATE
TO authenticated
USING (true);

-- Verify
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'rsvps'
ORDER BY policyname;
