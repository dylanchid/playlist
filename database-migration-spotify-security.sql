-- Enhanced Spotify Integration - Secure Token Storage
-- This migration creates encrypted token storage and job management tables

-- Drop existing spotify columns from the user_profiles table if they exist
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS spotify_access_token,
DROP COLUMN IF EXISTS spotify_refresh_token, 
DROP COLUMN IF EXISTS spotify_token_expires_at;

-- Secure table for storing encrypted Spotify tokens
CREATE TABLE IF NOT EXISTS public.spotify_credentials (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-read-collaborative', 'user-library-read'],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.spotify_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own credentials
CREATE POLICY "Users can access own spotify credentials" 
ON public.spotify_credentials FOR ALL 
USING (auth.uid() = user_id);

-- Table for managing background import jobs
CREATE TABLE IF NOT EXISTS public.spotify_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    playlist_ids TEXT[] NOT NULL,
    progress JSONB DEFAULT '{"processed": 0, "total": 0, "errors": [], "current_playlist": null}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Enable Row Level Security for import jobs
ALTER TABLE public.spotify_import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own jobs
CREATE POLICY "Users can access own import jobs"
ON public.spotify_import_jobs FOR ALL
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_spotify_credentials_user_id ON public.spotify_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_import_jobs_user_id ON public.spotify_import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_import_jobs_status ON public.spotify_import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_spotify_import_jobs_created_at ON public.spotify_import_jobs(created_at);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on spotify_credentials
DROP TRIGGER IF EXISTS update_spotify_credentials_updated_at ON public.spotify_credentials;
CREATE TRIGGER update_spotify_credentials_updated_at
    BEFORE UPDATE ON public.spotify_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bulk insert function for efficient track insertion (for future use)
CREATE OR REPLACE FUNCTION bulk_insert_tracks(
    playlist_id_param UUID,
    tracks_data JSONB
) RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER;
BEGIN
    WITH track_inserts AS (
        INSERT INTO playlist_tracks (
            playlist_id,
            track_name,
            artist_name,
            album_name,
            duration_ms,
            external_id,
            track_url,
            position
        )
        SELECT 
            playlist_id_param,
            (track->>'track_name')::TEXT,
            (track->>'artist_name')::TEXT,
            (track->>'album_name')::TEXT,
            (track->>'duration_ms')::INTEGER,
            (track->>'external_id')::TEXT,
            (track->>'track_url')::TEXT,
            (track->>'position')::INTEGER
        FROM jsonb_array_elements(tracks_data) AS track
        ON CONFLICT (playlist_id, external_id) 
        DO UPDATE SET
            position = EXCLUDED.position,
            track_name = EXCLUDED.track_name,
            artist_name = EXCLUDED.artist_name,
            album_name = EXCLUDED.album_name,
            duration_ms = EXCLUDED.duration_ms,
            track_url = EXCLUDED.track_url,
            updated_at = NOW()
        RETURNING 1
    )
    SELECT COUNT(*) INTO inserted_count FROM track_inserts;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 