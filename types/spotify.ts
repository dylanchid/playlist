// Spotify Web API types
export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: {
    total: number;
  };
  country: string;
  product: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  tracks: {
    total: number;
    items?: SpotifyPlaylistTrack[];
    href: string;
    next: string | null;
    previous: string | null;
  };
  external_urls: {
    spotify: string;
  };
  public: boolean;
  collaborative: boolean;
  owner: {
    id: string;
    display_name: string;
  };
  snapshot_id: string;
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  added_by: {
    id: string;
  };
  is_local: boolean;
  track: SpotifyTrack;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
  track_number: number;
  type: 'track';
  uri: string;
  is_local: boolean;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  type: 'artist';
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  total_tracks: number;
  type: 'album';
  external_urls: {
    spotify: string;
  };
  artists: SpotifyArtist[];
}

// Spotify API response types
export interface SpotifyPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

export interface SpotifyPlaylistsResponse extends SpotifyPaginatedResponse<SpotifyPlaylist> {}

export interface SpotifyTracksResponse extends SpotifyPaginatedResponse<SpotifyPlaylistTrack> {}

// Spotify OAuth types
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export interface SpotifyTokenRefreshResponse {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
}

export interface SpotifyAuthState {
  state: string;
  code_verifier: string;
}

// Error types
export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

// Import/conversion types
export interface SpotifyPlaylistImport {
  spotify_playlist: SpotifyPlaylist;
  import_tracks: boolean;
  make_public: boolean;
  tags: string[];
}

export interface SpotifyTrackImport {
  track: SpotifyTrack;
  position: number;
}

// Utility types for our app
export interface ConvertedPlaylist {
  name: string;
  description?: string;
  platform: 'spotify';
  external_id: string;
  external_url: string;
  track_count: number;
  duration_ms: number;
  cover_image_url?: string;
  is_public: boolean;
  tags: string[];
}

export interface ConvertedTrack {
  track_name: string;
  artist_name: string;
  album_name: string;
  duration_ms: number;
  external_id: string;
  track_url: string;
  position: number;
}

// API client types
export interface SpotifyAPIConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface SpotifyAPIClient {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// Rate limiting types
export interface SpotifyRateLimit {
  limit: number;
  remaining: number;
  resetTime: Date;
}

// Search types
export interface SpotifySearchQuery {
  q: string;
  type: 'track' | 'artist' | 'album' | 'playlist';
  limit?: number;
  offset?: number;
  market?: string;
}

export interface SpotifySearchResponse {
  tracks?: SpotifyPaginatedResponse<SpotifyTrack>;
  artists?: SpotifyPaginatedResponse<SpotifyArtist>;
  albums?: SpotifyPaginatedResponse<SpotifyAlbum>;
  playlists?: SpotifyPaginatedResponse<SpotifyPlaylist>;
} 