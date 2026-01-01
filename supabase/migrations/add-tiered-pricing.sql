-- ============================================
-- ADD TIERED PRICING TO EVENTS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add pricing tier columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS pre_early_bird_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pre_early_bird_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS early_bird_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_fee INTEGER DEFAULT 0;

-- 2. Rename existing 'fee' column to 'final_fee' (if not already done)
-- First, copy data from 'fee' to 'final_fee' if final_fee is empty
UPDATE events 
SET final_fee = fee 
WHERE final_fee = 0 OR final_fee IS NULL;

-- 3. Add a computed column to show current active price
-- This will be handled in the application logic

-- 4. Verify the changes
SELECT 
  id,
  title,
  pre_early_bird_fee,
  pre_early_bird_deadline,
  early_bird_fee,
  early_bird_deadline,
  final_fee,
  fee as old_fee_column
FROM events
LIMIT 5;

-- Note: The 'fee' column is kept for backward compatibility
-- The app will use the tiered pricing columns and fall back to 'fee' if needed
