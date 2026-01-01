-- Update old events to add tiered pricing columns if they don't exist
-- This will set default values for events that only have the old 'fee' column

-- First, let's see what events need updating
-- Run this to check:
-- SELECT id, title, fee, final_fee, early_bird_fee, pre_early_bird_fee FROM events;

-- Option 1: Set final_fee = fee for all events that don't have final_fee
UPDATE events 
SET final_fee = fee 
WHERE final_fee IS NULL AND fee IS NOT NULL AND fee > 0;

-- Option 2: If you want to add early bird pricing to old events
-- This sets early bird to 80% of final fee, pre-early bird to 70%
-- Adjust the percentages as needed

-- Set early bird fee (80% of final fee)
UPDATE events 
SET early_bird_fee = ROUND(final_fee * 0.8) 
WHERE early_bird_fee IS NULL AND final_fee IS NOT NULL AND final_fee > 0;

-- Set pre-early bird fee (70% of final fee)
UPDATE events 
SET pre_early_bird_fee = ROUND(final_fee * 0.7) 
WHERE pre_early_bird_fee IS NULL AND final_fee IS NOT NULL AND final_fee > 0;

-- Set deadlines (optional - adjust dates as needed)
-- Early bird deadline: 7 days before event
UPDATE events 
SET early_bird_deadline = start_date - INTERVAL '7 days'
WHERE early_bird_deadline IS NULL 
  AND early_bird_fee IS NOT NULL 
  AND start_date > NOW();

-- Pre-early bird deadline: 14 days before event
UPDATE events 
SET pre_early_bird_deadline = start_date - INTERVAL '14 days'
WHERE pre_early_bird_deadline IS NULL 
  AND pre_early_bird_fee IS NOT NULL 
  AND start_date > NOW();

-- Verify the updates
SELECT 
  id, 
  title, 
  fee as old_fee,
  pre_early_bird_fee,
  pre_early_bird_deadline,
  early_bird_fee,
  early_bird_deadline,
  final_fee,
  start_date
FROM events
ORDER BY created_at DESC;
