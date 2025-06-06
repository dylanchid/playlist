-- Fix PlaylistShare Database Schema
-- Run this in your Supabase SQL Editor to resolve the API errors

-- 1. Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name varchar(50),
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- 2. Ensure all required columns exist with proper constraints
-- Update username constraint to match the migration
ALTER TABLE public.user_profiles ALTER COLUMN username TYPE varchar(14);

-- 3. Drop existing constraints if they exist and recreate them
-- (PostgreSQL doesn't support IF NOT EXISTS for constraints)
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    BEGIN
        ALTER TABLE public.user_profiles DROP CONSTRAINT username_length_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    -- Add the constraint
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT username_length_check 
      CHECK (length(username) >= 3 AND username ~ '^[a-zA-Z0-9_]+$');
END $$;

DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    BEGIN
        ALTER TABLE public.user_profiles DROP CONSTRAINT bio_length_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    -- Add the constraint
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT bio_length_check CHECK (length(bio) <= 500);
END $$;

-- 4. Update RLS policies to ensure proper access
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- Create proper RLS policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (
    is_private = false OR auth.uid() = id
  );

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- 5. Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON public.user_profiles(is_private, created_at);

-- 6. Grant proper permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- 7. Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Ensure the trigger exists
DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. For testing: disable email confirmation temporarily (optional)
-- You can run this if you want to test without email confirmation:
-- UPDATE auth.config SET value = 'false' WHERE parameter = 'enable_email_confirmations';

-- 10. Create a test user profile to verify the fix works
-- (This will only work after you have a confirmed user in auth.users)
-- Replace the UUID below with a real user ID from auth.users if you want to test
/*
INSERT INTO public.user_profiles (
  id, 
  username, 
  display_name, 
  is_private, 
  profile_completed
) VALUES (
  'your-user-id-here',
  'testuser',
  'Test User',
  false,
  true
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_private = EXCLUDED.is_private,
  profile_completed = EXCLUDED.profile_completed;
*/ 