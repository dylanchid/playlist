'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getSpotifyConnectionStatus,
  removeSpotifyConnection,
  createAuthenticatedSpotifyClient,
} from '@/lib/spotify/database';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { buildSpotifyOAuthRedirectUriSnapshot } from '@/lib/spotify/oauth-redirect-uri';
import {
  logSpotifyRedirectSnapshot,
  pickForwardingHeaders,
} from '@/lib/spotify/oauth-debug';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Reusable function to get the current user ID
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}

/**
 * Server Action to get the current Spotify connection status.
 */
export async function getSpotifyConnectionStatusAction() {
  try {
    const userId = await getUserId();
    return await getSpotifyConnectionStatus(userId);
  } catch {
    return { connected: false };
  }
}

/**
 * Server Action to initiate the Spotify connection process.
 * Generates an authorization URL and redirects the user.
 */
export async function initiateSpotifyConnectionAction(formData?: FormData) {
  const headerList = await headers();
  const forwarding = pickForwardingHeaders((name) => headerList.get(name));
  const redirectSnapshot = buildSpotifyOAuthRedirectUriSnapshot({
    host: forwarding.host,
    forwardedProto: forwarding.xForwardedProto,
  });
  logSpotifyRedirectSnapshot('server_action_authorize', redirectSnapshot, {
    forwardingHeaders: forwarding,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    spotifyRedirectUriEnv: process.env.SPOTIFY_REDIRECT_URI ?? null,
  });
  const redirectUri = redirectSnapshot.redirectUri;

  console.log("Initiating Spotify connection. IMPORTANT: Ensure your Spotify app's redirect URI is set to this value.");
  console.log('VERIFY THIS REDIRECT URI:', redirectUri);

  const pathname = formData?.get('pathname') as string | null;
  const { url, state, codeVerifier } = await SpotifyAuth.getAuthorizationUrl(redirectUri);

  const cookieStore = await cookies();
  await cookieStore.set('spotify_auth_state', JSON.stringify({
    state,
    codeVerifier,
    pathname: pathname || '/profile/edit', // Default redirect
  }), {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10, // 10 minutes
  });

  return redirect(url);
}

/**
 * Server Action to disconnect the user's Spotify account.
 */
export async function disconnectSpotifyAction() {
  try {
    const userId = await getUserId();
    await removeSpotifyConnection(userId);
    revalidatePath('/profile/edit'); // Example path, adjust as needed
    return { success: true };
  } catch(error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
}

/**
 * Server Action to get the user's Spotify profile.
 */
export async function getSpotifyUserProfileAction() {
  const userId = await getUserId();
  const client = await createAuthenticatedSpotifyClient(userId);
  if (!client) {
    // This can happen if the user has no valid tokens.
    // Return null so the UI can handle this state.
    return null;
  }
  try {
    return await client.getUserProfile();
  } catch (error) {
    console.error("Error fetching Spotify user profile:", error);
    // Depending on the error, you might want to disconnect the user
    // or just return null. For now, we return null.
    return null;
  }
}

/**
 * Server Action to get the user's Spotify playlists.
 */
export async function getSpotifyPlaylistsAction({
  limit = 50,
  pageParam = 0,
}: {
  limit?: number;
  pageParam?: number;
}) {
  const userId = await getUserId();
  const client = await createAuthenticatedSpotifyClient(userId);
  if (!client) {
    return null;
  }
  return await client.getUserPlaylists(limit, pageParam);
}

/**
 * Server Action to get a specific Spotify playlist.
 */
export async function getSpotifyPlaylistAction({
  playlistId,
  fields,
}: {
  playlistId: string;
  fields?: string;
}) {
  const userId = await getUserId();
  const client = await createAuthenticatedSpotifyClient(userId);
  if (!client) {
    return null;
  }
  return await client.getPlaylist(playlistId, fields);
}

/**
 * Server Action to get tracks from a Spotify playlist.
 */
export async function getSpotifyPlaylistTracksAction({
  playlistId,
  limit = 50,
  pageParam = 0,
}: {
  playlistId: string;
  limit?: number;
  pageParam?: number;
}) {
  const userId = await getUserId();
  const client = await createAuthenticatedSpotifyClient(userId);
  if (!client) {
    return null;
  }
  return await client.getPlaylistTracks(playlistId, limit, pageParam);
} 
