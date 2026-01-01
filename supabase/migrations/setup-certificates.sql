-- Certificate Templates Table
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_url TEXT NOT NULL,
  mappings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Issued Certificates Table
CREATE TABLE IF NOT EXISTS issued_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rsvp_id UUID REFERENCES rsvps(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  certificate_url TEXT NOT NULL,
  certificate_data JSONB DEFAULT '{}'::jsonb,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rsvp_id)
);

-- Enable RLS
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_certificates ENABLE ROW LEVEL SECURITY;

-- Policies for certificate_templates
CREATE POLICY "Admins can manage certificate templates"
  ON certificate_templates
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view certificate templates"
  ON certificate_templates
  FOR SELECT
  USING (true);

-- Policies for issued_certificates
CREATE POLICY "Admins can manage issued certificates"
  ON issued_certificates
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Students can view their own certificates"
  ON issued_certificates
  FOR SELECT
  USING (student_email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificate_templates_event ON certificate_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_event ON issued_certificates(event_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_rsvp ON issued_certificates(rsvp_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_email ON issued_certificates(student_email);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_email_sent ON issued_certificates(email_sent);
