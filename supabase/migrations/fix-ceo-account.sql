-- Fix CEO account - Delete and recreate properly
-- Run this in Supabase SQL Editor

-- First, delete the existing CEO user if it exists
DELETE FROM auth.users WHERE email = 'ceo@scify-tech.com';

-- Now go to Supabase Dashboard and create the user manually:
-- Dashboard > Authentication > Users > Add User
-- Email: ceo@scify-tech.com
-- Password: scify@akatsuki
-- ✓ Auto Confirm User

-- This is the ONLY reliable way to create users with passwords
-- SQL password creation often fails due to encryption issues
