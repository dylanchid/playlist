/**
 * Spotify requires the same redirect_uri byte-for-byte on /authorize and on the token exchange.
 * All OAuth entry points must use this helper so scheme/host stay consistent.
 */

function normalizeOverride(uri: string): string {
  return uri.replace(/\/+$/, '');
}

function isLocalLoopbackHost(host: string): boolean {
  const lower = host.toLowerCase();
  if (lower.startsWith('127.0.0.1')) return true;
  if (lower.startsWith('localhost')) return true;
  if (lower.startsWith('[::1]')) return true;
  if (lower.startsWith('::1:')) return true;
  return false;
}

export function resolveOAuthRequestProtocol(
  forwardedProto: string | null | undefined,
  host?: string | null
): string {
  const first = forwardedProto?.split(',')[0]?.trim();
  if (
    first === 'https' &&
    process.env.NODE_ENV !== 'production' &&
    host &&
    isLocalLoopbackHost(host) &&
    process.env.SPOTIFY_TRUST_LOCAL_FORWARDED_HTTPS !== 'true'
  ) {
    // Proxies / dev tooling sometimes set x-forwarded-proto=https while Next serves HTTP on loopback.
    // Spotify must list http://… for that case; otherwise token exchange fails with redirect_uri mismatch.
    return 'http';
  }
  if (first) return first;
  return process.env.NODE_ENV === 'production' ? 'https' : 'http';
}

export type SpotifyOAuthRedirectSnapshot = {
  redirectUri: string;
  source: 'env_override' | 'derived';
  hostHeader: string | null;
  forwardedProtoHeader: string | null;
  forwardedProtoFirst: string | null;
  resolvedProtocol: string;
  loopbackForcedHttp: boolean;
};

function computeSpotifyOAuthRedirectSnapshot(options: {
  host: string | null | undefined;
  forwardedProto?: string | null | undefined;
}): SpotifyOAuthRedirectSnapshot {
  const forwardedProtoHeader = options.forwardedProto ?? null;
  const forwardedProtoFirst =
    typeof forwardedProtoHeader === 'string'
      ? forwardedProtoHeader.split(',')[0]?.trim() ?? null
      : null;
  const hostTrimmed = options.host?.trim() ?? null;

  const override = process.env.SPOTIFY_REDIRECT_URI?.trim();
  if (override) {
    const normalized = normalizeOverride(override);
    try {
      new URL(normalized);
    } catch {
      throw new Error(`Invalid SPOTIFY_REDIRECT_URI: ${override}`);
    }
    const u = new URL(normalized);
    return {
      redirectUri: normalized,
      source: 'env_override',
      hostHeader: hostTrimmed,
      forwardedProtoHeader,
      forwardedProtoFirst,
      resolvedProtocol: u.protocol === 'https:' ? 'https' : 'http',
      loopbackForcedHttp: false,
    };
  }

  if (!hostTrimmed) {
    throw new Error('Missing Host header; cannot build Spotify OAuth redirect URI.');
  }

  const loopbackForcedHttp =
    forwardedProtoFirst === 'https' &&
    process.env.NODE_ENV !== 'production' &&
    isLocalLoopbackHost(hostTrimmed) &&
    process.env.SPOTIFY_TRUST_LOCAL_FORWARDED_HTTPS !== 'true';

  const resolvedProtocol = resolveOAuthRequestProtocol(
    options.forwardedProto,
    hostTrimmed
  );

  return {
    redirectUri: `${resolvedProtocol}://${hostTrimmed}/api/spotify/auth/callback`,
    source: 'derived',
    hostHeader: hostTrimmed,
    forwardedProtoHeader,
    forwardedProtoFirst,
    resolvedProtocol,
    loopbackForcedHttp,
  };
}

export function buildSpotifyOAuthRedirectUriSnapshot(options: {
  host: string | null | undefined;
  forwardedProto?: string | null | undefined;
}): SpotifyOAuthRedirectSnapshot {
  return computeSpotifyOAuthRedirectSnapshot(options);
}

export function buildSpotifyOAuthRedirectUri(options: {
  host: string | null | undefined;
  forwardedProto?: string | null | undefined;
}): string {
  return computeSpotifyOAuthRedirectSnapshot(options).redirectUri;
}
