import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { saveSpotifyTokens, saveSpotifyUserId } from '@/lib/spotify/database';
import { getAndClearOAuthStateCookie } from '@/lib/spotify/state';
import { SpotifyAPIClient } from '@/lib/spotify/client';
import { buildSpotifyOAuthRedirectUriSnapshot } from '@/lib/spotify/oauth-redirect-uri';
import {
  logSpotifyOAuth,
  logSpotifyRedirectSnapshot,
  pickForwardingHeaders,
} from '@/lib/spotify/oauth-debug';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  let redirectTo = new URL('/profile/edit', request.url);

  if (error) {
    const errorMessage = searchParams.get('error_description') || 'Authorization failed';
    logSpotifyOAuth('callback_spotify_error_param', {
      error,
      errorMessage,
      callbackUrl: request.url,
    });
    console.error(`Spotify authorization failed: ${error}`, errorMessage);
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

  try {
    const forwarding = pickForwardingHeaders((name) => request.headers.get(name));
    const redirectSnapshot = buildSpotifyOAuthRedirectUriSnapshot({
      host: forwarding.host,
      forwardedProto: forwarding.xForwardedProto,
    });
    const redirectUri = redirectSnapshot.redirectUri;
    logSpotifyRedirectSnapshot('callback_token_exchange_redirect', redirectSnapshot, {
      callbackUrl: request.url,
      forwardingHeaders: forwarding,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
      spotifyRedirectUriEnv: process.env.SPOTIFY_REDIRECT_URI ?? null,
    });

    const storedState = await getAndClearOAuthStateCookie();
    if (!storedState) {
      const message = 'OAuth state not found or expired. Please try again.';
      console.error(`Spotify callback failed: ${message}`);
      redirectTo.searchParams.set('error', 'spotify_auth_failed');
      redirectTo.searchParams.set('message', message);
      return NextResponse.redirect(redirectTo);
    }

    const { state: expectedState, codeVerifier, pathname } = storedState;

    if (pathname) {
      redirectTo = new URL(pathname, request.url);
      if (pathname.includes('onboarding/connect-spotify')) {
        redirectTo = new URL('/onboarding/select-genres', request.url);
      }
    }

    if (state !== expectedState) {
      const message = 'Invalid OAuth state (CSRF protection).';
      console.error(`Spotify callback failed: ${message}`);
      redirectTo.searchParams.set('error', 'spotify_auth_failed');
      redirectTo.searchParams.set('message', message);
      return NextResponse.redirect(redirectTo);
    }
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Supabase auth error while getting user:', authError);
      return NextResponse.redirect(new URL('/auth/login?error=authentication_required', request.url));
    }

    const tokens = await SpotifyAuth.exchangeCodeForTokens(code, codeVerifier, redirectUri);

    const spotifyClient = new SpotifyAPIClient({
      accessToken: tokens.access_token,
    });
    const spotifyUser = await spotifyClient.getUserProfile();

    await saveSpotifyTokens(user.id, tokens, tokens.scope.split(' '));
    await saveSpotifyUserId(user.id, spotifyUser.id);

    redirectTo.searchParams.set('success', 'spotify_connected');
    return NextResponse.redirect(redirectTo);

  } catch (err) {
    const error = err as Error;
    console.error('Spotify auth callback error:', error);
    logSpotifyOAuth('callback_caught_error', {
      message: error.message,
      name: error.name,
      hint:
        error.message.includes('redirect') || error.message.includes('Redirect')
          ? 'Compare redirectUri in logs (callback_token_exchange_redirect vs api_login_authorize) with Spotify Dashboard Redirect URIs and SPOTIFY_REDIRECT_URI.'
          : undefined,
    });
    const errorMessage = error.message || 'An unknown error occurred.';
    redirectTo.searchParams.set('error', 'spotify_auth_failed');
    redirectTo.searchParams.set('message', `Failed to complete Spotify authorization: ${errorMessage}`);
    return NextResponse.redirect(redirectTo);
  }
}
