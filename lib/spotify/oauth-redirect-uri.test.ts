import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSpotifyOAuthRedirectUri,
  buildSpotifyOAuthRedirectUriSnapshot,
  resolveOAuthRequestProtocol,
} from './oauth-redirect-uri';

describe('resolveOAuthRequestProtocol', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses first value when x-forwarded-proto is a comma-separated list', () => {
    expect(resolveOAuthRequestProtocol('https,http')).toBe('https');
  });

  it('defaults to https in production when header is absent', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(resolveOAuthRequestProtocol(null)).toBe('https');
  });

  it('defaults to http in development when header is absent', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(resolveOAuthRequestProtocol(undefined)).toBe('http');
  });

  it('uses http on loopback in development when forwarded proto is https (misconfigured proxy)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(resolveOAuthRequestProtocol('https', '127.0.0.1:3000')).toBe('http');
    expect(resolveOAuthRequestProtocol('https', 'localhost:3000')).toBe('http');
  });

  it('respects https on loopback when SPOTIFY_TRUST_LOCAL_FORWARDED_HTTPS is true', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SPOTIFY_TRUST_LOCAL_FORWARDED_HTTPS', 'true');
    expect(resolveOAuthRequestProtocol('https', '127.0.0.1:3000')).toBe('https');
  });
});

describe('buildSpotifyOAuthRedirectUri', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the Spotify callback path', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(
      buildSpotifyOAuthRedirectUri({
        host: 'localhost:3000',
        forwardedProto: null,
      })
    ).toBe('http://localhost:3000/api/spotify/auth/callback');
  });

  it('throws when host is missing and no override', () => {
    expect(() =>
      buildSpotifyOAuthRedirectUri({ host: null, forwardedProto: 'https' })
    ).toThrow('Missing Host header');
  });

  it('uses SPOTIFY_REDIRECT_URI when set', () => {
    vi.stubEnv(
      'SPOTIFY_REDIRECT_URI',
      'http://127.0.0.1:3000/api/spotify/auth/callback'
    );
    expect(
      buildSpotifyOAuthRedirectUri({ host: null, forwardedProto: 'https' })
    ).toBe('http://127.0.0.1:3000/api/spotify/auth/callback');
  });

  it('strips trailing slash from SPOTIFY_REDIRECT_URI', () => {
    vi.stubEnv(
      'SPOTIFY_REDIRECT_URI',
      'http://127.0.0.1:3000/api/spotify/auth/callback/'
    );
    expect(
      buildSpotifyOAuthRedirectUri({ host: 'ignored:1', forwardedProto: null })
    ).toBe('http://127.0.0.1:3000/api/spotify/auth/callback');
  });
});

describe('buildSpotifyOAuthRedirectUriSnapshot', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns metadata for derived redirect', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const snap = buildSpotifyOAuthRedirectUriSnapshot({
      host: '127.0.0.1:3000',
      forwardedProto: 'https',
    });
    expect(snap.redirectUri).toBe(
      'http://127.0.0.1:3000/api/spotify/auth/callback'
    );
    expect(snap.source).toBe('derived');
    expect(snap.loopbackForcedHttp).toBe(true);
    expect(snap.resolvedProtocol).toBe('http');
  });
});
