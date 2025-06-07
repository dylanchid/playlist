-- Critical Database Schema Updates for Context-Required Sharing
-- This migration implements the first critical priority item from the backlog

-- 1. Add context_story column to playlists table (NOT NULL with default)
ALTER TABLE public.playlists 
ADD COLUMN IF NOT EXISTS context_story text NOT NULL DEFAULT '';

-- Add a comment to document the purpose
COMMENT ON COLUMN public.playlists.context_story IS 'Required context story for sharing - core PRD feature';

-- 2. Create playlist_shares table for contextual sharing
CREATE TABLE IF NOT EXISTS public.playlist_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_context text,
  share_type varchar(20) NOT NULL DEFAULT 'friend' CHECK (share_type IN ('friend', 'public', 'group')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Ensure unique shares per playlist-user combination
  CONSTRAINT unique_playlist_share UNIQUE(playlist_id, shared_by, shared_with)
);

-- Add comments for documentation
COMMENT ON TABLE public.playlist_shares IS 'Tracks contextual playlist sharing between users';
COMMENT ON COLUMN public.playlist_shares.share_context IS 'Additional context for this specific share instance';
COMMENT ON COLUMN public.playlist_shares.share_type IS 'Type of share: friend, public, or group';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlist_shares_playlist_id ON public.playlist_shares(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_shares_shared_by ON public.playlist_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_playlist_shares_shared_with ON public.playlist_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_playlist_shares_created_at ON public.playlist_shares(created_at DESC);

-- 3. Enable Row Level Security (RLS) on playlist_shares
ALTER TABLE public.playlist_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlist_shares
-- Users can insert shares where they are the sharer
CREATE POLICY "Users can create shares for their own playlists" ON public.playlist_shares
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_shares.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Users can view shares where they are involved (either sharing or receiving)
CREATE POLICY "Users can view their own shares" ON public.playlist_shares
  FOR SELECT USING (shared_by = auth.uid() OR shared_with = auth.uid());

-- Users can update their own shares (as the sharer)
CREATE POLICY "Users can update their own shares" ON public.playlist_shares
  FOR UPDATE USING (shared_by = auth.uid());

-- Users can delete their own shares
CREATE POLICY "Users can delete their own shares" ON public.playlist_shares
  FOR DELETE USING (shared_by = auth.uid());

-- 4. Create a function to automatically track friend activities when playlists are shared
CREATE OR REPLACE FUNCTION public.track_playlist_share_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into friend_activities when a playlist is shared with a friend
  IF NEW.share_type = 'friend' THEN
    INSERT INTO public.friend_activities (
      user_id,
      activity_type,
      playlist_id,
      target_user_id,
      activity_metadata
    ) VALUES (
      NEW.shared_by,
      'shared_playlist',
      NEW.playlist_id,
      NEW.shared_with,
      jsonb_build_object(
        'share_context', NEW.share_context,
        'share_type', NEW.share_type
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function
DROP TRIGGER IF EXISTS trigger_track_playlist_share_activity ON public.playlist_shares;
CREATE TRIGGER trigger_track_playlist_share_activity
  AFTER INSERT ON public.playlist_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.track_playlist_share_activity();

-- 5. Update existing playlists to have a default context_story if they don't have one
-- This ensures existing data works with the new NOT NULL constraint
UPDATE public.playlists 
SET context_story = COALESCE(description, 'A great playlist worth sharing!')
WHERE context_story = '' OR context_story IS NULL;

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_shares TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verification queries (commented out for safety)
-- SELECT COUNT(*) as playlist_count FROM public.playlists;
-- SELECT COUNT(*) as share_count FROM public.playlist_shares;
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'playlists' AND column_name = 'context_story';

COMMIT; 