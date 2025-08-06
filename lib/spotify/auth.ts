import type { SpotifyTokenResponse, SpotifyTokenRefreshResponse } from '@/types/spotify';
import { spotifyConfig } from '@/lib/config';

// PKCE utilities
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export class SpotifyAuth {
  private static readonly CLIENT_ID = spotifyConfig.clientId;
  private static readonly CLIENT_SECRET = spotifyConfig.clientSecret;
  
  // Spotify API scopes we need
  private static readonly SCOPES = spotifyConfig.scopes;

  /**
   * Generate the Spotify authorization URL with PKCE
   */
  static async generateAuthURL(state: string, codeVerifier: string, redirectUri: string): Promise<string> {
    const codeChallenge = base64encode(await sha256(codeVerifier));
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      scope: this.SCOPES.join(' '),
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForTokens(
    code: string, 
    codeVerifier: string,
    redirectUri: string
  ): Promise<SpotifyTokenResponse> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Spotify token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  static async refreshToken(refreshToken: string): Promise<SpotifyTokenRefreshResponse> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Spotify token refresh failed: ${errorData.error_description || errorData.error}`);
    }

    return response.json();
  }

  /**
   * Generate a random state string for OAuth
   */
  static generateState(): string {
    return generateRandomString(16);
  }

  /**
   * Generate a code verifier for PKCE
   */
  static generateCodeVerifier(): string {
    return generateRandomString(128);
  }

  /**
   * Helper to generate everything needed for the auth URL.
   * This is called by the server action to start the process.
   */
  static async getAuthorizationUrl(redirectUri: string): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
  }> {
    const state = this.generateState();
    const codeVerifier = this.generateCodeVerifier();
    const url = await this.generateAuthURL(state, codeVerifier, redirectUri);
    return { url, state, codeVerifier };
  }

  /**
   * Validate state parameter to prevent CSRF attacks
   */
  static validateState(receivedState: string, expectedState: string): boolean {
    return receivedState === expectedState;
  }

  /**
   * Revoke Spotify access token
   */
  static async revokeToken(token: string): Promise<void> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        token: token,
        token_type_hint: 'access_token',
      }),
    });

    if (!response.ok) {
      // Spotify token revocation endpoint might not exist or work as expected
      // Log the error but don't throw to avoid breaking disconnect flow
      console.warn('Failed to revoke Spotify token:', response.status);
    }
  }

  /**
   * Get the required scopes for display purposes
   */
  static getRequiredScopes(): string[] {
    return [...this.SCOPES];
  }

  /**
   * Check if we have all required scopes
   */
  static hasRequiredScopes(grantedScopes: string): boolean {
    const granted = grantedScopes.split(' ');
    return this.SCOPES.every(scope => granted.includes(scope));
  }
} 