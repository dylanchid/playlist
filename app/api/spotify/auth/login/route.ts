import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { setOAuthStateCookie } from '@/lib/spotify/state';
import { buildSpotifyOAuthRedirectUriSnapshot } from '@/lib/spotify/oauth-redirect-uri';
import {
  logSpotifyOAuth,
  logSpotifyRedirectSnapshot,
  pickForwardingHeaders,
} from '@/lib/spotify/oauth-debug';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname') || '/profile/edit';

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const state = SpotifyAuth.generateState();
    const codeVerifier = SpotifyAuth.generateCodeVerifier();
    
    await setOAuthStateCookie(state, codeVerifier, pathname);
    
    const forwarding = pickForwardingHeaders((name) => request.headers.get(name));
    const redirectSnapshot = buildSpotifyOAuthRedirectUriSnapshot({
      host: forwarding.host,
      forwardedProto: forwarding.xForwardedProto,
    });
    logSpotifyRedirectSnapshot('api_login_authorize', redirectSnapshot, {
      requestUrl: request.url,
      forwardingHeaders: forwarding,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
      spotifyRedirectUriEnv: process.env.SPOTIFY_REDIRECT_URI ?? null,
    });
    const redirectUri = redirectSnapshot.redirectUri;

    const authUrl = await SpotifyAuth.generateAuthURL(state, codeVerifier, redirectUri);

    const redirectInAuthUrl = new URL(authUrl).searchParams.get('redirect_uri');
    logSpotifyOAuth('api_login_authorize_url_built', {
      authorizeUrlLength: authUrl.length,
      redirectUriInQueryMatchesSnapshot: redirectInAuthUrl === redirectUri,
      redirectUriInQuery: redirectInAuthUrl,
    });

    return NextResponse.json({
      authUrl,
      state,
      message: 'Redirect to Spotify authorization',
    });
    
  } catch (error) {
    console.error('Spotify auth login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Spotify authorization' },
      { status: 500 }
    );
  }
}
