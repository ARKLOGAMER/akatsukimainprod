-- Add CEO admin user
-- Run this in Supabase SQL Editor

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
VALUES ('ceo@scify-tech.com', 'CEO Admin')
ON CONFLICT (email) DO NOTHING;
