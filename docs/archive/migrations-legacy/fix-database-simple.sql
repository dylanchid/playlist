-- Simple fix for PlaylistShare Database Schema
-- Run this in your Supabase SQL Editor to resolve the API errors

-- 1. Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name varchar(50);

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- 2. Create or ensure playlists table exists with proper foreign key
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  platform varchar(20) CHECK (platform IN ('spotify', 'apple', 'custom')) NOT NULL,
  external_id varchar(255),
  external_url text,
  track_count integer DEFAULT 0,
  duration_ms bigint DEFAULT 0,
  cover_image_url text,
  is_public boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 3. Fix foreign key relationship if playlists table already exists
-- Drop existing foreign key if it exists
DO $$ 
BEGIN
    -- Try to drop the constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'playlists_user_id_fkey' 
        AND table_name = 'playlists'
    ) THEN
        ALTER TABLE public.playlists DROP CONSTRAINT playlists_user_id_fkey;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if constraint doesn't exist
        NULL;
END $$;

-- Add proper foreign key constraint to user_profiles
ALTER TABLE public.playlists 
ADD CONSTRAINT playlists_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 4. Create other necessary tables if they don't exist
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  track_name varchar(255) NOT NULL,
  artist_name varchar(255) NOT NULL,
  album_name varchar(255),
  duration_ms integer,
  external_id varchar(255),
  track_url text,
  position integer NOT NULL,
  added_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playlist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, playlist_id)
);

CREATE TABLE IF NOT EXISTS public.playlist_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  played_at timestamp DEFAULT now()
);

-- 5. Update RLS policies to ensure proper access
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- Create proper RLS policies for user_profiles
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

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_plays ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playlists
DROP POLICY IF EXISTS "Anyone can view public playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can create their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON public.playlists;

CREATE POLICY "Anyone can view public playlists" ON public.playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Grant proper permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL ON public.playlists TO authenticated;
GRANT SELECT ON public.playlists TO anon;
GRANT ALL ON public.playlist_tracks TO authenticated;
GRANT SELECT ON public.playlist_tracks TO anon;
GRANT ALL ON public.playlist_likes TO authenticated;
GRANT SELECT ON public.playlist_likes TO anon;
GRANT ALL ON public.playlist_plays TO authenticated;
GRANT SELECT ON public.playlist_plays TO anon;

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

DROP TRIGGER IF EXISTS handle_playlists_updated_at ON public.playlists;
CREATE TRIGGER handle_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON public.user_profiles(is_private, created_at);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON public.playlists(is_public, created_at);
CREATE INDEX IF NOT EXISTS idx_playlists_platform ON public.playlists(platform);

-- 10. For testing: disable email confirmation temporarily (optional)
-- Uncomment the line below if you want to test without email confirmation:
-- UPDATE auth.config SET enable_email_confirmations = false; 