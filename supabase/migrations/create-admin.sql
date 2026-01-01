-- Create admin users in Supabase Authentication
-- Run this in your Supabase SQL Editor

-- RECOMMENDED: Create users through Supabase Dashboard instead
-- Go to Supabase Dashboard > Authentication > Users > Add User
-- 
-- Admin 1 - CBO:
--   Email: cbo@scify-tech.com
--   Password: scify@akatsuki
--   ✓ Auto Confirm User
--
-- Admin 2 - CEO:
--   Email: ceo@scify-tech.com
--   Password: scify@akatsuki
--   ✓ Auto Confirm User

-- Alternatively, if you have service_role access, you can use this SQL:
-- This inserts directly into auth.users (requires service_role key)

-- CBO Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'cbo@scify-tech.com',
  crypt('scify@akatsuki', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"CBO Admin"}',
  false,
  ''
);

-- CEO Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ceo@scify-tech.com',
  crypt('scify@akatsuki', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"CEO Admin"}',
  false,
  ''
);

-- Add to admins table (optional tracking)
INSERT INTO admins (email, name)
VALUES 
  ('cbo@scify-tech.com', 'CBO Admin'),
  ('ceo@scify-tech.com', 'CEO Admin');
