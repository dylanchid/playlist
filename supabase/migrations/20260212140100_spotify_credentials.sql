-- Move Spotify OAuth material off user_profiles into encrypted row storage (app uses lib/spotify/database.ts).
-- Does not include generic SECURITY DEFINER helpers; keep surface minimal.

ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS spotify_access_token,
DROP COLUMN IF EXISTS spotify_refresh_token,
DROP COLUMN IF EXISTS spotify_token_expires_at;

CREATE TABLE IF NOT EXISTS public.spotify_credentials (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY[
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read'
  ]::text[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.spotify_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own spotify credentials" ON public.spotify_credentials;
CREATE POLICY "Users can access own spotify credentials"
  ON public.spotify_credentials FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.spotify_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  playlist_ids TEXT[] NOT NULL,
  progress JSONB DEFAULT '{"processed": 0, "total": 0, "errors": [], "current_playlist": null}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.spotify_import_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own import jobs" ON public.spotify_import_jobs;
CREATE POLICY "Users can access own import jobs"
  ON public.spotify_import_jobs FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_spotify_credentials_user_id ON public.spotify_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_import_jobs_user_id ON public.spotify_import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_import_jobs_status ON public.spotify_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_spotify_import_jobs_created_at ON public.spotify_import_jobs(created_at);

CREATE OR REPLACE FUNCTION public.set_spotify_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spotify_credentials_updated_at ON public.spotify_credentials;
CREATE TRIGGER update_spotify_credentials_updated_at
  BEFORE UPDATE ON public.spotify_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_spotify_credentials_updated_at();

GRANT ALL ON public.spotify_credentials TO authenticated;
GRANT ALL ON public.spotify_import_jobs TO authenticated;

NOTIFY pgrst, 'reload schema';
