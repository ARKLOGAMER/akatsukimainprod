-- Add slug column to events table (optional for backward compatibility)
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update existing events with unique slugs (convert title to slug + add ID suffix for uniqueness)
UPDATE events 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), 
    '\s+', '-', 'g'
  ) || '-' || SUBSTRING(id::text, 1, 8)
)
WHERE slug IS NULL OR slug = '';

-- Create unique index for slug (allows NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug) WHERE slug IS NOT NULL;

-- Note: slug is optional to maintain backward compatibility
-- New events should include a slug for better URLs
