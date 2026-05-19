import type { SpotifyOAuthRedirectSnapshot } from './oauth-redirect-uri';

const LOG_PREFIX = '[Spotify OAuth]';

/**
 * Logs when NODE_ENV is not production, or when SPOTIFY_OAUTH_DEBUG is 1/true (including production).
 */
export function isSpotifyOAuthDebugEnabled(): boolean {
  const flag = process.env.SPOTIFY_OAUTH_DEBUG;
  if (flag === '1' || flag === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export function logSpotifyOAuth(
  phase: string,
  details: Record<string, unknown>
): void {
  if (!isSpotifyOAuthDebugEnabled()) return;
  console.info(LOG_PREFIX, {
    phase,
    ts: new Date().toISOString(),
    ...details,
  });
}

export function logSpotifyRedirectSnapshot(
  phase: string,
  snapshot: SpotifyOAuthRedirectSnapshot,
  extra?: Record<string, unknown>
): void {
  logSpotifyOAuth(phase, {
    redirectUri: snapshot.redirectUri,
    source: snapshot.source,
    hostHeader: snapshot.hostHeader,
    forwardedProtoHeader: snapshot.forwardedProtoHeader,
    forwardedProtoFirst: snapshot.forwardedProtoFirst,
    resolvedProtocol: snapshot.resolvedProtocol,
    loopbackForcedHttp: snapshot.loopbackForcedHttp,
    spotifyRedirectUriChecklist: [
      'Spotify Dashboard → app → Redirect URIs must include this exact redirectUri string.',
      'Authorize URL query param redirect_uri must match token exchange body redirect_uri (this code uses one snapshot for both).',
      'If SPOTIFY_REDIRECT_URI is set, it wins over Host / x-forwarded-proto.',
    ],
    ...extra,
  });
}

export function pickForwardingHeaders(get: (name: string) => string | null): {
  host: string | null;
  xForwardedProto: string | null;
  xForwardedHost: string | null;
  forwarded: string | null;
} {
  return {
    host: get('host'),
    xForwardedProto: get('x-forwarded-proto'),
    xForwardedHost: get('x-forwarded-host'),
    forwarded: get('forwarded'),
  };
}
