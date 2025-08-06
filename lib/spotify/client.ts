import type { 
  SpotifyUser, 
  SpotifyPlaylistsResponse, 
  SpotifyPlaylist,
  SpotifyTracksResponse,
  SpotifyError,
} from '@/types/spotify';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export class SpotifyAPIClient {
  private readonly accessToken: string;
  private readonly baseURL = 'https://api.spotify.com/v1';

  constructor(tokens: SpotifyTokens) {
    if (!tokens.accessToken) {
      throw new Error('SpotifyAPIClient requires an access token.');
    }
    this.accessToken = tokens.accessToken;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Important: Use server-side caching strategy
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData: SpotifyError = await response.json();
        errorMessage = `Spotify API Error: ${errorData.error.message}`;
      } catch {
        // If we can't parse the error, use the status text
      }
      throw new Error(errorMessage);
    }
    
    // Handle cases where Spotify API returns 204 No Content with an empty body
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Public API methods
  async getUserProfile(): Promise<SpotifyUser> {
    return this.makeRequest<SpotifyUser>('/me');
  }

  async getUserPlaylists(limit = 50, offset = 0): Promise<SpotifyPlaylistsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.makeRequest<SpotifyPlaylistsResponse>(`/me/playlists?${params}`);
  }

  async getPlaylist(playlistId: string, fields?: string): Promise<SpotifyPlaylist> {
    const params = fields ? `?fields=${encodeURIComponent(fields)}` : '';
    return this.makeRequest<SpotifyPlaylist>(`/playlists/${playlistId}${params}`);
  }

  async getPlaylistTracks(
    playlistId: string,
    limit = 50,
    offset = 0
  ): Promise<SpotifyTracksResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.makeRequest<SpotifyTracksResponse>(`/playlists/${playlistId}/tracks?${params}`);
  }
} 