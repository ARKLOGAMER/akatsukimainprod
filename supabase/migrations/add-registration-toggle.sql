-- Add registration_enabled column to events table
-- This allows admins to turn RSVP form on/off

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS registration_enabled BOOLEAN DEFAULT true;

-- Update existing events to have registration enabled
UPDATE events SET registration_enabled = true WHERE registration_enabled IS NULL;

-- Verify
SELECT id, title, status, registration_enabled FROM events;
