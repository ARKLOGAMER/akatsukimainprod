-- Add Razorpay payment tracking

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID REFERENCES rsvps(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending', -- pending, success, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for simplicity
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_payments_rsvp ON payments(rsvp_id);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Add payment_status to rsvps table if not exists
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

COMMENT ON TABLE payments IS 'Razorpay payment transactions';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, success, failed';

-- Verify
SELECT 'payments table created' as status, COUNT(*) as count FROM payments;
