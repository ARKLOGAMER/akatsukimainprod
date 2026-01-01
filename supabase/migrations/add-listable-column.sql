-- Add is_listable column to events table
-- This controls whether an event appears on the public homepage

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_listable BOOLEAN DEFAULT true;

-- Set all existing events to be listable by default
UPDATE events SET is_listable = true WHERE is_listable IS NULL;

COMMENT ON COLUMN events.is_listable IS 'Controls whether event appears on public homepage';
