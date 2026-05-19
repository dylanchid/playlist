/**
 * user_profiles columns safe to read from the browser and in public selects.
 * Omits OAuth secrets; prefer `spotify_credentials` + server-only access for tokens.
 */
export const USER_PROFILE_SAFE_COLUMNS =
  "id, username, display_name, bio, avatar_url, is_private, spotify_id, apple_music_id, profile_completed, created_at, updated_at, music_preferences, onboarding_completed";
