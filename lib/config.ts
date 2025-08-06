import { validateEncryptionKey } from './crypto';

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenEncryptionKey: string;
  scopes: string[];
}

interface AppConfig {
  baseUrl: string;
  environment: 'development' | 'production' | 'test';
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// App configuration
export const appConfig: AppConfig = {
  baseUrl: getOptionalEnvVar('NEXT_PUBLIC_APP_URL', 'http://127.0.0.1:3000'),
  environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
};

// Spotify configuration
export const spotifyConfig: SpotifyConfig = {
  clientId: getRequiredEnvVar('SPOTIFY_CLIENT_ID'),
  clientSecret: getRequiredEnvVar('SPOTIFY_CLIENT_SECRET'),
  redirectUri: `${appConfig.baseUrl}/api/spotify/auth/callback`,
  tokenEncryptionKey: getRequiredEnvVar('TOKEN_ENCRYPTION_KEY'),
  scopes: [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
  ],
};

// Validation
function validateConfig() {
  // Validate encryption key
  if (!validateEncryptionKey(spotifyConfig.tokenEncryptionKey)) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal string. Generate one with: openssl rand -hex 32');
  }

  // Validate URLs
  try {
    new URL(spotifyConfig.redirectUri);
    new URL(appConfig.baseUrl);
  } catch (_error) {
    throw new Error('Invalid URL configuration. Check NEXT_PUBLIC_APP_URL in your .env.local file.');
  }
}

// Run validation on import
if (typeof window === 'undefined') {
  // Only validate on server-side
  validateConfig();
} 