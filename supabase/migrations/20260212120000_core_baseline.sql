-- Core schema for a greenfield Supabase project (aligned with types/ and app code).
-- Run before PRD social migrations. OAuth tokens belong in spotify_credentials (later migration), not here.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles: id equals auth.users.id
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username varchar(50) UNIQUE NOT NULL,
  display_name varchar(100),
  bio text,
  avatar_url text,
  is_private boolean DEFAULT false NOT NULL,
  profile_completed boolean DEFAULT false NOT NULL,
  onboarding_completed boolean DEFAULT false NOT NULL,
  music_preferences jsonb DEFAULT '{}'::jsonb,
  spotify_id varchar(255),
  apple_music_id varchar(255),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  platform varchar(20) NOT NULL CHECK (platform IN ('spotify', 'apple', 'custom')),
  external_id varchar(255),
  external_url text,
  track_count integer DEFAULT 0 NOT NULL,
  duration_ms bigint DEFAULT 0 NOT NULL,
  cover_image_url text,
  is_public boolean DEFAULT true NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

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
  added_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playlist_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, playlist_id)
);

CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS public.music_friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status varchar(20) DEFAULT 'connected' NOT NULL CHECK (status IN ('pending', 'connected', 'blocked')),
  connection_source varchar(50) DEFAULT 'manual',
  compatibility_score integer DEFAULT 0 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE TABLE IF NOT EXISTS public.playlist_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  played_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_platform ON public.playlists(platform);
CREATE INDEX IF NOT EXISTS idx_playlists_is_public ON public.playlists(is_public);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON public.playlists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlists_tags ON public.playlists USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_likes_playlist_id ON public.playlist_likes(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_likes_user_id ON public.playlist_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_music_friends_user ON public.music_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_music_friends_friend ON public.music_friends(friend_id);

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public user_profiles readable" ON public.user_profiles
  FOR SELECT USING (is_private = false OR auth.uid() = id);

CREATE POLICY "user_profiles insert own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles update own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "user_profiles delete own" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

CREATE POLICY "playlists_select" ON public.playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "playlists_insert" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "playlists_update" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "playlists_delete" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "playlist_tracks_select" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_tracks.playlist_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "playlist_tracks_manage" ON public.playlist_tracks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_tracks.playlist_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_tracks.playlist_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "playlist_likes_select" ON public.playlist_likes FOR SELECT USING (true);

CREATE POLICY "playlist_likes_mutate" ON public.playlist_likes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_follows_select" ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "user_follows_mutate" ON public.user_follows
  FOR ALL USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "music_friends_select" ON public.music_friends
  FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "music_friends_insert" ON public.music_friends
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "music_friends_update" ON public.music_friends
  FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "music_friends_delete" ON public.music_friends
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "playlist_plays_select" ON public.playlist_plays FOR SELECT USING (true);

CREATE POLICY "playlist_plays_insert" ON public.playlist_plays
  FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

NOTIFY pgrst, 'reload schema';
