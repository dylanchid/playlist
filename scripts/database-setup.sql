-- PlaylistShare Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles extension (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username varchar(50) UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  spotify_id varchar(255),
  apple_music_id varchar(255),
  spotify_access_token text,
  spotify_refresh_token text,
  spotify_token_expires_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Core playlist tables
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Playlist tracks
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

-- Social features
CREATE TABLE IF NOT EXISTS public.playlist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, playlist_id)
);

CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Analytics
CREATE TABLE IF NOT EXISTS public.playlist_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  played_at timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_platform ON public.playlists(platform);
CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON public.playlists(is_public);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON public.playlists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlists_tags ON public.playlists USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_likes_playlist_id ON public.playlist_likes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_likes_user_id ON public.playlist_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- Row Level Security Policies

-- User profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all public profiles" 
  ON public.user_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public playlists" 
  ON public.playlists FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
  ON public.playlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
  ON public.playlists FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
  ON public.playlists FOR DELETE 
  USING (auth.uid() = user_id);

-- Playlist tracks
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks of public playlists" 
  ON public.playlist_tracks FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_tracks.playlist_id 
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage tracks of their playlists" 
  ON public.playlist_tracks FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_tracks.playlist_id 
      AND user_id = auth.uid()
    )
  );

-- Playlist likes
ALTER TABLE public.playlist_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" 
  ON public.playlist_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can like/unlike playlists" 
  ON public.playlist_likes FOR ALL 
  USING (auth.uid() = user_id);

-- User follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" 
  ON public.user_follows FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their follows" 
  ON public.user_follows FOR ALL 
  USING (auth.uid() = follower_id);

-- Playlist plays
ALTER TABLE public.playlist_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view play counts" 
  ON public.playlist_plays FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can log plays" 
  ON public.playlist_plays FOR INSERT 
  WITH CHECK (true);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON public.playlists
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Sample data (optional - for testing)
/*
INSERT INTO public.user_profiles (id, username, bio) VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'musiclover', 'Love discovering new music!'),
  ('123e4567-e89b-12d3-a456-426614174001', 'beatmaster', 'Creating the perfect playlists');

INSERT INTO public.playlists (user_id, name, description, platform, track_count, duration_ms, is_public, tags) VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Chill Vibes', 'Perfect for relaxing', 'spotify', 25, 5400000, true, ARRAY['chill', 'relax', 'indie']),
  ('123e4567-e89b-12d3-a456-426614174001', 'Workout Hits', 'High energy for the gym', 'spotify', 30, 7200000, true, ARRAY['workout', 'energy', 'rock']);
*/ 