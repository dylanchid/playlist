import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { saveSpotifyTokens, saveSpotifyUserId } from '@/lib/spotify/database';
import { getAndClearOAuthStateCookie } from '@/lib/spotify/state';
import { SpotifyAPIClient } from '@/lib/spotify/client';

export async function GET(request: NextRequest) {
  console.log('Received callback from Spotify.');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  let redirectTo = new URL('/profile/edit', request.url);
  console.log(`Initial redirect URL: ${redirectTo.href}`);

  if (error) {
    const errorMessage = searchParams.get('error_description') || 'Authorization failed';
    console.error(`Spotify authorization failed with error: ${error}, message: ${errorMessage}`);
    redirectTo.searchParams.set('error', 'spotify_auth_failed');
    redirectTo.searchParams.set('message', errorMessage);
    return NextResponse.redirect(redirectTo);
  }

  if (!code || !state) {
    const message = 'Missing authorization code or state.';
    console.error(`Spotify callback failed: ${message}`);
    redirectTo.searchParams.set('error', 'spotify_auth_failed');
    redirectTo.searchParams.set('message', message);
    return NextResponse.redirect(redirectTo);
  }
  console.log(`Received code and state from Spotify. State: ${state}`);

  try {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const redirectUri = `${protocol}://${host}/api/spotify/auth/callback`;
    console.log(`Constructed redirect URI for token exchange: ${redirectUri}`);

    console.log('Retrieving OAuth state from cookie.');
    const storedState = await getAndClearOAuthStateCookie();
    if (!storedState) {
      const message = 'OAuth state not found or expired. Please try again.';
      console.error(`Spotify callback failed: ${message}`);
      redirectTo.searchParams.set('error', 'spotify_auth_failed');
      redirectTo.searchParams.set('message', message);
      return NextResponse.redirect(redirectTo);
    }
    console.log('Successfully retrieved OAuth state from cookie.');

    const { state: expectedState, codeVerifier, pathname } = storedState;

    if (pathname) {
      redirectTo = new URL(pathname, request.url);
      console.log(`Redirect URL updated based on stored pathname: ${redirectTo.href}`);
      if (pathname.includes('onboarding/connect-spotify')) {
        redirectTo = new URL('/onboarding/select-genres', request.url);
        console.log(`Onboarding flow detected. Redirecting to: ${redirectTo.href}`);
      }
    }

    if (state !== expectedState) {
      const message = 'Invalid OAuth state (CSRF protection).';
      console.error(`Spotify callback failed: ${message}. Received: ${state}, Expected: ${expectedState}`);
      redirectTo.searchParams.set('error', 'spotify_auth_failed');
      redirectTo.searchParams.set('message', message);
      return NextResponse.redirect(redirectTo);
    }
    console.log('OAuth state validated successfully.');
    
    const supabase = await createClient();
    console.log('Retrieving user from Supabase.');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Supabase auth error while getting user:', authError);
      return NextResponse.redirect(new URL('/auth/login?error=authentication_required', request.url));
    }
    console.log('Successfully retrieved user:', user.id);

    console.log('Exchanging authorization code for tokens.');
    const tokens = await SpotifyAuth.exchangeCodeForTokens(code, codeVerifier, redirectUri);
    console.log('Successfully exchanged code for tokens.');

    const spotifyClient = new SpotifyAPIClient({
      accessToken: tokens.access_token,
    });
    console.log('Fetching Spotify user profile.');
    const spotifyUser = await spotifyClient.getUserProfile();
    console.log('Successfully fetched Spotify user profile:', spotifyUser.id);

    console.log('Saving Spotify tokens and user ID to database.');
    await saveSpotifyTokens(user.id, tokens, tokens.scope.split(' '));
    await saveSpotifyUserId(user.id, spotifyUser.id);
    console.log('Successfully saved Spotify data to database.');

    redirectTo.searchParams.set('success', 'spotify_connected');
    console.log(`Spotify connection successful. Redirecting to: ${redirectTo.href}`);
    return NextResponse.redirect(redirectTo);

  } catch (err) {
    const error = err as Error;
    console.error('Spotify auth callback error:', error);
    const errorMessage = error.message || 'An unknown error occurred.';
    redirectTo.searchParams.set('error', 'spotify_auth_failed');
    redirectTo.searchParams.set('message', `Failed to complete Spotify authorization: ${errorMessage}`);
    return NextResponse.redirect(redirectTo);
  }
} 