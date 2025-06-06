-- Database Performance Optimization for PlaylistShare
-- Run this in your Supabase SQL Editor to fix performance warnings

-- 1. Fix RLS policy performance by using subqueries instead of direct auth calls
-- This prevents re-evaluation of auth functions for each row

-- Drop existing RLS policy that has performance issues
DROP POLICY IF EXISTS "Anyone can view public playlists" ON public.playlists;

-- Create optimized RLS policy using subquery
CREATE POLICY "Anyone can view public playlists" ON public.playlists
  FOR SELECT USING (
    is_public = true OR user_id = (SELECT auth.uid())
  );

-- 2. Add missing index on foreign key for playlist_plays table
-- This improves query performance for playlist analytics

CREATE INDEX IF NOT EXISTS idx_playlist_plays_playlist_id 
ON public.playlist_plays(playlist_id);

-- 3. Add other performance indexes that might be missing

-- Index for user_id in playlist_plays (for user analytics)
CREATE INDEX IF NOT EXISTS idx_playlist_plays_user_id 
ON public.playlist_plays(user_id);

-- Index for played_at timestamp (for time-based queries)
CREATE INDEX IF NOT EXISTS idx_playlist_plays_played_at 
ON public.playlist_plays(played_at DESC);

-- Index for playlist_likes foreign keys
CREATE INDEX IF NOT EXISTS idx_playlist_likes_playlist_id 
ON public.playlist_likes(playlist_id);

CREATE INDEX IF NOT EXISTS idx_playlist_likes_user_id 
ON public.playlist_likes(user_id);

-- Index for playlist_tracks foreign key
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id 
ON public.playlist_tracks(playlist_id);

-- Index for playlist_tracks position (for ordering)
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position 
ON public.playlist_tracks(playlist_id, position);

-- 4. Optimize other RLS policies that might have similar issues

-- Fix user_profiles RLS policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (
    is_private = false OR id = (SELECT auth.uid())
  );

-- Fix playlists update policy
DROP POLICY IF EXISTS "Users can update their own playlists" ON public.playlists;

CREATE POLICY "Users can update their own playlists" ON public.playlists
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Fix playlists delete policy  
DROP POLICY IF EXISTS "Users can delete their own playlists" ON public.playlists;

CREATE POLICY "Users can delete their own playlists" ON public.playlists
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Fix playlists insert policy
DROP POLICY IF EXISTS "Users can create their own playlists" ON public.playlists;

CREATE POLICY "Users can create their own playlists" ON public.playlists
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- 5. Optimize playlist_tracks policies
DROP POLICY IF EXISTS "Anyone can view tracks of public playlists" ON public.playlist_tracks;

CREATE POLICY "Anyone can view tracks of public playlists" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_tracks.playlist_id 
      AND (is_public = true OR user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can manage tracks of their playlists" ON public.playlist_tracks;

CREATE POLICY "Users can manage tracks of their playlists" ON public.playlist_tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE id = playlist_tracks.playlist_id 
      AND user_id = (SELECT auth.uid())
    )
  );

-- 6. Optimize likes and follows policies
DROP POLICY IF EXISTS "Users can like/unlike playlists" ON public.playlist_likes;

CREATE POLICY "Users can like/unlike playlists" ON public.playlist_likes
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- 7. Add composite indexes for common query patterns

-- For playlist discovery (public playlists ordered by creation)
CREATE INDEX IF NOT EXISTS idx_playlists_public_created 
ON public.playlists(is_public, created_at DESC) 
WHERE is_public = true;

-- For user's playlists
CREATE INDEX IF NOT EXISTS idx_playlists_user_created 
ON public.playlists(user_id, created_at DESC);

-- For playlist search by platform
CREATE INDEX IF NOT EXISTS idx_playlists_platform_public 
ON public.playlists(platform, is_public, created_at DESC) 
WHERE is_public = true;

-- For user profile searches
CREATE INDEX IF NOT EXISTS idx_user_profiles_username_lower 
ON public.user_profiles(LOWER(username));

-- 8. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Performance optimization complete! 