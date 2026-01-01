-- Add certificate_data column to issued_certificates table
ALTER TABLE issued_certificates 
ADD COLUMN IF NOT EXISTS certificate_data JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_issued_certificates_data ON issued_certificates USING gin(certificate_data);
