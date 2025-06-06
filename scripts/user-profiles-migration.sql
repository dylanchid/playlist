-- User profiles extension for PlaylistShare
-- Run this migration in your Supabase SQL editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username varchar(14) UNIQUE NOT NULL CHECK (length(username) >= 3 AND username ~ '^[a-zA-Z0-9_]+$'),
  display_name varchar(50),
  bio text CHECK (length(bio) <= 500),
  avatar_url text,
  is_private boolean DEFAULT false,
  spotify_id varchar(255),
  apple_music_id varchar(255),
  spotify_access_token text,
  spotify_refresh_token text,
  spotify_token_expires_at timestamp,
  profile_completed boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public profiles and their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (
    is_private = false OR auth.uid() = id
  );

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Create index for public profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON public.user_profiles(is_private, created_at);

-- Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon; 