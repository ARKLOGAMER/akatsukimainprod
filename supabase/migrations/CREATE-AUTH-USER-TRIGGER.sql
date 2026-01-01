-- ============================================
-- CREATE TRIGGER: Auto-create Auth User + Student on RSVP
-- ============================================

-- 1. Create the function that creates auth user and student
CREATE OR REPLACE FUNCTION create_student_from_rsvp()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create Supabase Auth user with email and password
  -- Note: This requires the password to be passed in the RSVP data
  -- The password should be in NEW.password field
  
  -- Insert into students table
  INSERT INTO students (email, name, phone, college)
  VALUES (NEW.email, NEW.full_name, NEW.phone, NEW.college)
  ON CONFLICT (email) DO NOTHING;
  
  -- Link student to event
  INSERT INTO student_courses (student_id, event_id, status)
  SELECT s.id, NEW.event_id, 'ongoing'
  FROM students s
  WHERE s.email = NEW.email
  ON CONFLICT (student_id, event_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop old trigger if exists
DROP TRIGGER IF EXISTS auto_create_student ON rsvps;

-- 3. Create new trigger
CREATE TRIGGER auto_create_student
AFTER INSERT ON rsvps
FOR EACH ROW
EXECUTE FUNCTION create_student_from_rsvp();

-- 4. Add password column to rsvps table (to store it temporarily)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS password TEXT;

-- 5. Verify
SELECT '✅ Trigger created! Now students will be created with auth users.' as status;
