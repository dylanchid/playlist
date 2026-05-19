import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/crypto';
import { SpotifyAPIClient } from './client';
import type { SpotifyTokenResponse, SpotifyTokens } from '@/types/spotify';

/**
 * Save encrypted Spotify tokens to the secure credentials table
 */
export async function saveSpotifyTokens(userId: string, tokens: SpotifyTokenResponse, scopes?: string[]): Promise<void> {
  const supabase = await createServerClient();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  
  // Encrypt the sensitive tokens
  const encryptedAccessToken = await encrypt(tokens.access_token);
  const encryptedRefreshToken = await encrypt(tokens.refresh_token || '');
  
  const { error } = await supabase
    .from('spotify_credentials')
    .upsert({
      user_id: userId,
      encrypted_access_token: encryptedAccessToken,
      encrypted_refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt.toISOString(),
      scopes: scopes || ['user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-read-collaborative', 'user-library-read'],
    });
    
  if (error) {
    throw new Error(`Failed to save Spotify tokens: ${error.message}`);
  }
}

/**
 * Get decrypted Spotify tokens for a user
 */
export async function getSpotifyTokens(userId: string): Promise<SpotifyTokens | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('spotify_credentials')
    .select('encrypted_access_token, encrypted_refresh_token, token_expires_at')
    .eq('user_id', userId)
    .single();
    
  if (error || !data?.encrypted_access_token) {
    return null;
  }
  
  try {
    // Decrypt the tokens
    const accessToken = await decrypt(data.encrypted_access_token);
    const refreshToken = data.encrypted_refresh_token ? await decrypt(data.encrypted_refresh_token) : undefined;
    
    return {
      accessToken,
      refreshToken,
      expiresAt: data.token_expires_at ? new Date(data.token_expires_at) : undefined,
    };
  } catch (decryptError) {
    console.error('Failed to decrypt Spotify tokens:', decryptError);
    return null;
  }
}

/**
 * Update encrypted Spotify tokens (used for token refresh)
 */
export async function updateSpotifyTokens(userId: string, tokens: Partial<SpotifyTokens>): Promise<void> {
  const supabase = await createServerClient();
  
  const updateData: Record<string, string | Date> = {};
  if (tokens.accessToken) updateData.encrypted_access_token = await encrypt(tokens.accessToken);
  if (tokens.refreshToken) updateData.encrypted_refresh_token = await encrypt(tokens.refreshToken);
  if (tokens.expiresAt) updateData.token_expires_at = tokens.expiresAt.toISOString();
  
  const { error } = await supabase
    .from('spotify_credentials')
    .update(updateData)
    .eq('user_id', userId);
    
  if (error) {
    throw new Error(`Failed to update Spotify tokens: ${error.message}`);
  }
}

/**
 * Save Spotify user ID to link accounts
 */
export async function saveSpotifyUserId(userId: string, spotifyId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('users')
    .update({ spotify_id: spotifyId })
    .eq('id', userId);
    
  if (error) {
    throw new Error(`Failed to save Spotify user ID: ${error.message}`);
  }
}

/**
 * Remove Spotify connection from user profile
 */
export async function removeSpotifyConnection(userId: string): Promise<void> {
  const supabase = await createServerClient();
  
  // Delete from the credentials table
  const { error: credentialsError } = await supabase
    .from('spotify_credentials')
    .delete()
    .eq('user_id', userId);
    
  if (credentialsError) {
    throw new Error(`Failed to remove Spotify credentials: ${credentialsError.message}`);
  }
  
  // Clear spotify_id from users table
  const { error: userError } = await supabase
    .from('users')
    .update({ spotify_id: null })
    .eq('id', userId);
    
  if (userError) {
    throw new Error(`Failed to clear Spotify ID from user profile: ${userError.message}`);
  }
}

/**
 * Check if a user has valid Spotify tokens
 */
export async function isSpotifyTokenValid(userId: string): Promise<boolean> {
  const tokens = await getSpotifyTokens(userId);
  if (!tokens?.accessToken) return false;
  
  if (tokens.expiresAt && tokens.expiresAt <= new Date()) {
    return false; // Token expired
  }
  
  return true;
}

/**
 * Get user's Spotify connection status
 */
export async function getSpotifyConnectionStatus(userId: string): Promise<{
  connected: boolean;
  spotifyId?: string;
  expiresAt?: Date;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: Date;
  };
}> {
  const supabase = await createServerClient();
  
  // Get spotify_id from users table and credentials from credentials table
  const [userResult, credentialsResult] = await Promise.all([
    supabase.from('users').select('spotify_id').eq('id', userId).single(),
    supabase.from('spotify_credentials').select('token_expires_at').eq('user_id', userId).single()
  ]);
  
  const connected = !credentialsResult.error && !!credentialsResult.data;
  const spotifyId = userResult.data?.spotify_id || undefined;
  const expiresAt = credentialsResult.data?.token_expires_at ? new Date(credentialsResult.data.token_expires_at) : undefined;
  
  return {
    connected,
    spotifyId,
    expiresAt,
  };
}

/**
 * Store OAuth state and code verifier securely (using session or temporary storage)
 * In a production app, you might want to use Redis or another secure store
 */
export async function storeOAuthState(userId: string, state: string, codeVerifier: string): Promise<void> {
  // For now, we'll use localStorage on the client side
  // In production, consider using httpOnly cookies or server-side session storage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`spotify_oauth_${userId}`, JSON.stringify({
      state,
      codeVerifier,
      timestamp: Date.now(),
    }));
  }
}

/**
 * Retrieve and validate OAuth state and code verifier
 */
export async function getOAuthState(userId: string): Promise<{
  state: string;
  codeVerifier: string;
} | null> {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(`spotify_oauth_${userId}`);
    if (!stored) return null;
    
    try {
      const data = JSON.parse(stored);
      
      // Check if the state is not too old (15 minutes max)
      if (Date.now() - data.timestamp > 15 * 60 * 1000) {
        sessionStorage.removeItem(`spotify_oauth_${userId}`);
        return null;
      }
      
      return {
        state: data.state,
        codeVerifier: data.codeVerifier,
      };
    } catch {
      sessionStorage.removeItem(`spotify_oauth_${userId}`);
      return null;
    }
  }
  return null;
}

/**
 * Clear OAuth state after successful authentication
 */
export async function clearOAuthState(userId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(`spotify_oauth_${userId}`);
  }
}

/**
 * Factory function to create an authenticated Spotify API client
 * This replaces the singleton pattern for serverless safety
 */
export async function createAuthenticatedSpotifyClient(userId: string): Promise<SpotifyAPIClient | null> {
  const tokens = await getSpotifyTokens(userId);
  if (!tokens) {
    return null;
  }
  
  // Check if token needs refresh (refresh 5 minutes before expiry)
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  
  if (tokens.expiresAt && tokens.expiresAt <= fiveMinutesFromNow && tokens.refreshToken) {
    try {
      // Refresh the token
      const { SpotifyAuth } = await import('./auth');
      const newTokens = await SpotifyAuth.refreshToken(tokens.refreshToken);
      
      // Save the new tokens
      await updateSpotifyTokens(userId, {
        accessToken: newTokens.access_token,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
      });
      
      // Return client with fresh tokens
      return new SpotifyAPIClient({
        accessToken: newTokens.access_token,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
      });
    } catch (refreshError) {
      console.error('Failed to refresh Spotify token:', refreshError);
      return null;
    }
  }
  
  // Return client with existing tokens
  return new SpotifyAPIClient(tokens);
} 
