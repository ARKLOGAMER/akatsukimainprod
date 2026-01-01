-- Fix Admin Permissions for Events Table
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_insert_events" ON events;
DROP POLICY IF EXISTS "admin_update_events" ON events;
DROP POLICY IF EXISTS "admin_delete_events" ON events;

-- 2. Create policy to allow admins to insert events
CREATE POLICY "admin_insert_events"
ON events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admins
  )
);

-- 3. Create policy to allow admins to update events
CREATE POLICY "admin_update_events"
ON events
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM admins
  )
);

-- 4. Create policy to allow admins to delete events
CREATE POLICY "admin_delete_events"
ON events
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM admins
  )
);

-- 5. Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'events';
