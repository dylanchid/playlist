-- Contextual comments on playlists (PRD Phase 2)

CREATE TABLE IF NOT EXISTS public.playlist_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text text NOT NULL CHECK (char_length(trim(comment_text)) >= 1),
  responds_to_context boolean DEFAULT true NOT NULL,
  parent_comment_id uuid REFERENCES public.playlist_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_playlist_comments_playlist
  ON public.playlist_comments(playlist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_playlist_comments_user
  ON public.playlist_comments(user_id, created_at DESC);

ALTER TABLE public.playlist_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "playlist_comments_select" ON public.playlist_comments;
DROP POLICY IF EXISTS "playlist_comments_insert" ON public.playlist_comments;
DROP POLICY IF EXISTS "playlist_comments_update" ON public.playlist_comments;
DROP POLICY IF EXISTS "playlist_comments_delete" ON public.playlist_comments;

CREATE POLICY "playlist_comments_select" ON public.playlist_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_comments.playlist_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "playlist_comments_insert" ON public.playlist_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_comments.playlist_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "playlist_comments_update" ON public.playlist_comments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "playlist_comments_delete" ON public.playlist_comments
  FOR DELETE USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_playlist_comments_updated_at ON public.playlist_comments;
CREATE TRIGGER update_playlist_comments_updated_at
  BEFORE UPDATE ON public.playlist_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
