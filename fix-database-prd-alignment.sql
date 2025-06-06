-- PRD Alignment Database Schema Updates
-- Run this in your Supabase SQL Editor to implement core PRD features

-- 1. Add context story requirement to playlists (CRITICAL PRD FEATURE)
ALTER TABLE public.playlists 
ADD COLUMN IF NOT EXISTS context_story text NOT NULL DEFAULT '';

-- Make context_story truly required for new playlists
ALTER TABLE public.playlists 
ALTER COLUMN context_story DROP DEFAULT;

-- 2. Create playlist_shares table for contextual sharing
CREATE TABLE IF NOT EXISTS public.playlist_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_context text, -- Additional context for this specific share
  share_type varchar(20) DEFAULT 'friend' CHECK (share_type IN ('friend', 'public', 'group')),
  created_at timestamp DEFAULT now(),
  UNIQUE(playlist_id, shared_by, shared_with)
);

-- 3. Replace simple likes with reaction system (PRD requirement)
CREATE TABLE IF NOT EXISTS public.playlist_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type varchar(20) NOT NULL CHECK (reaction_type IN ('fire', 'perfect', 'thoughtful', 'energy')),
  created_at timestamp DEFAULT now(),
  UNIQUE(playlist_id, user_id, reaction_type)
);

-- 4. Add music taste compatibility to user_follows (PRD friend features)
ALTER TABLE public.user_follows 
ADD COLUMN IF NOT EXISTS compatibility_score integer DEFAULT 0 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
ADD COLUMN IF NOT EXISTS connection_source varchar(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'connected' CHECK (status IN ('pending', 'connected', 'blocked'));

-- 5. Add music preferences to user profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS music_preferences jsonb DEFAULT '{}';

-- 6. Create friend activity feed table
CREATE TABLE IF NOT EXISTS public.friend_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type varchar(30) NOT NULL CHECK (activity_type IN ('shared_playlist', 'reacted', 'commented', 'liked_playlist', 'followed_user')),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- 7. Enhanced comments with context response tracking
ALTER TABLE public.playlist_comments 
ADD COLUMN IF NOT EXISTS responds_to_context boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES public.playlist_comments(id) ON DELETE CASCADE;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlist_shares_shared_with ON public.playlist_shares(shared_with, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_shares_shared_by ON public.playlist_shares(shared_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_reactions_playlist ON public.playlist_reactions(playlist_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_playlist_reactions_user ON public.playlist_reactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_activities_user ON public.friend_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_activities_type ON public.friend_activities(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_compatibility ON public.user_follows(compatibility_score DESC, status);

-- 9. Create RLS policies for new tables
ALTER TABLE public.playlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_activities ENABLE ROW LEVEL SECURITY;

-- Playlist shares policies
CREATE POLICY "Users can view playlist shares they're involved in" ON public.playlist_shares
  FOR SELECT USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "Users can create playlist shares" ON public.playlist_shares
  FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can delete their own playlist shares" ON public.playlist_shares
  FOR DELETE USING (shared_by = auth.uid());

-- Playlist reactions policies  
CREATE POLICY "Anyone can view playlist reactions" ON public.playlist_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON public.playlist_reactions
  FOR ALL USING (user_id = auth.uid());

-- Friend activities policies
CREATE POLICY "Users can view friend activities" ON public.friend_activities
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_follows 
      WHERE follower_id = auth.uid() 
      AND following_id = friend_activities.user_id 
      AND status = 'connected'
    )
  );

CREATE POLICY "Users can create their own activities" ON public.friend_activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 10. Grant permissions
GRANT ALL ON public.playlist_shares TO authenticated;
GRANT SELECT ON public.playlist_shares TO anon;
GRANT ALL ON public.playlist_reactions TO authenticated;
GRANT SELECT ON public.playlist_reactions TO anon;
GRANT ALL ON public.friend_activities TO authenticated;
GRANT SELECT ON public.friend_activities TO anon;

-- 11. Create functions for compatibility scoring
CREATE OR REPLACE FUNCTION calculate_music_compatibility(user1_id uuid, user2_id uuid)
RETURNS integer AS $$
DECLARE
  common_tags text[];
  user1_tags text[];
  user2_tags text[];
  common_count integer;
  total_unique_count integer;
  compatibility_score integer;
BEGIN
  -- Get all tags from user1's public playlists
  SELECT ARRAY_AGG(DISTINCT tag) INTO user1_tags
  FROM public.playlists p1, UNNEST(p1.tags) AS tag
  WHERE p1.user_id = user1_id AND p1.is_public = true;
  
  -- Get all tags from user2's public playlists
  SELECT ARRAY_AGG(DISTINCT tag) INTO user2_tags
  FROM public.playlists p2, UNNEST(p2.tags) AS tag
  WHERE p2.user_id = user2_id AND p2.is_public = true;
  
  -- Handle null cases
  IF user1_tags IS NULL THEN user1_tags := ARRAY[]::text[]; END IF;
  IF user2_tags IS NULL THEN user2_tags := ARRAY[]::text[]; END IF;
  
  -- Find common tags
  SELECT ARRAY_AGG(tag) INTO common_tags
  FROM (
    SELECT UNNEST(user1_tags) AS tag
    INTERSECT
    SELECT UNNEST(user2_tags) AS tag
  ) AS common;
  
  IF common_tags IS NULL THEN common_tags := ARRAY[]::text[]; END IF;
  
  common_count := array_length(common_tags, 1);
  IF common_count IS NULL THEN common_count := 0; END IF;
  
  -- Calculate total unique tags
  total_unique_count := (
    SELECT COUNT(DISTINCT tag) 
    FROM (
      SELECT UNNEST(user1_tags) AS tag
      UNION
      SELECT UNNEST(user2_tags) AS tag
    ) AS all_tags
  );
  
  -- Calculate compatibility score (0-100)
  IF total_unique_count = 0 THEN
    compatibility_score := 0;
  ELSE
    compatibility_score := ROUND((common_count::float / total_unique_count::float) * 100);
  END IF;
  
  RETURN compatibility_score;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to update compatibility scores
CREATE OR REPLACE FUNCTION update_compatibility_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Update compatibility scores for all connections involving this user
  UPDATE public.user_follows
  SET compatibility_score = calculate_music_compatibility(follower_id, following_id)
  WHERE follower_id = NEW.user_id OR following_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update compatibility when playlists change
DROP TRIGGER IF EXISTS update_compatibility_on_playlist_change ON public.playlists;
CREATE TRIGGER update_compatibility_on_playlist_change
  AFTER INSERT OR UPDATE OF tags ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_compatibility_scores();

-- 13. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT 'PRD alignment database updates completed successfully! 🎉' AS status; 