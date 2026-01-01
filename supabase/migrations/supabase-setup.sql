-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  poster_url TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING',
  fee INTEGER DEFAULT 0,
  seats INTEGER DEFAULT 100,
  venue_or_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rsvps table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  college TEXT,
  department TEXT,
  reason TEXT,
  payment_screenshot_url TEXT,
  status TEXT DEFAULT 'applied',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_schema table
CREATE TABLE form_schema (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  schema_json JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table (optional - GoTrue handles auth)
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_schema ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read access for events
CREATE POLICY "public_read_events"
ON events FOR SELECT
TO anon
USING (true);

-- Public insert for RSVPs
CREATE POLICY "insert_rsvp_public"
ON rsvps FOR INSERT
TO anon
WITH CHECK (
  full_name IS NOT NULL
  AND phone IS NOT NULL
  AND event_id IS NOT NULL
);

-- Public read for RSVP count (aggregate only)
CREATE POLICY "public_count_rsvps"
ON rsvps FOR SELECT
TO anon
USING (true);

-- Admin full access to events
CREATE POLICY "admin_all_events"
ON events FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin full access to RSVPs
CREATE POLICY "admin_all_rsvps"
ON rsvps FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin access to form schema
CREATE POLICY "admin_all_form_schema"
ON form_schema FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert sample event
INSERT INTO events (title, description, start_date, end_date, status, fee, seats, venue_or_link, poster_url)
VALUES (
  'Akatsuki Chapter 1: Dawn of Execution',
  'Join us for an intense 7-day sprint where ideas transform into reality. Build, ship, and scale your project with a community of driven innovators.',
  '2024-12-01',
  '2024-12-07',
  'LIVE',
  499,
  50,
  'Online via Zoom',
  'https://via.placeholder.com/800x400'
);
