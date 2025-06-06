export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'created_at'>>;
      };
      playlist_tracks: {
        Row: PlaylistTrack;
        Insert: Omit<PlaylistTrack, 'id' | 'added_at'>;
        Update: Partial<Omit<PlaylistTrack, 'id' | 'playlist_id'>>;
      };
      playlist_likes: {
        Row: PlaylistLike;
        Insert: Omit<PlaylistLike, 'id' | 'created_at'>;
        Update: never;
      };
      user_follows: {
        Row: UserFollow;
        Insert: Omit<UserFollow, 'id' | 'created_at'>;
        Update: never;
      };
      playlist_plays: {
        Row: PlaylistPlay;
        Insert: Omit<PlaylistPlay, 'id' | 'played_at'>;
        Update: never;
      };
      playlist_shares: {
        Row: PlaylistShare;
        Insert: Omit<PlaylistShare, 'id' | 'created_at'>;
        Update: Partial<Omit<PlaylistShare, 'id' | 'playlist_id' | 'shared_by'>>;
      };
      friend_activities: {
        Row: FriendActivity;
        Insert: Omit<FriendActivity, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      platform_type: 'spotify' | 'apple' | 'custom';
    };
  };
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_private: boolean;
  spotify_id?: string;
  apple_music_id?: string;
  spotify_access_token?: string;
  spotify_refresh_token?: string;
  spotify_token_expires_at?: string;
  music_preferences: Record<string, unknown>; // JSON object for genre preferences, moods, etc.
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  context_story: string; // Required for sharing - core PRD feature
  platform: 'spotify' | 'apple' | 'custom';
  external_id?: string;
  external_url?: string;
  track_count: number;
  duration_ms: number;
  cover_image_url?: string;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  duration_ms?: number;
  external_id?: string;
  track_url?: string;
  position: number;
  added_at: string;
}

export interface PlaylistLike {
  id: string;
  user_id: string;
  playlist_id: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  compatibility_score: number; // 0-100 based on music taste overlap
  connection_source: string; // 'manual', 'suggestion', 'search'
  status: 'pending' | 'connected' | 'blocked';
  created_at: string;
}

export interface PlaylistPlay {
  id: string;
  playlist_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  played_at: string;
}

export interface PlaylistShare {
  id: string;
  playlist_id: string;
  shared_by: string;
  shared_with: string;
  share_context?: string; // Additional context for this specific share
  share_type: 'friend' | 'public' | 'group';
  created_at: string;
}

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'shared_playlist' | 'commented' | 'liked_playlist' | 'followed_user';
  playlist_id?: string;
  target_user_id?: string;
  activity_metadata: Record<string, unknown>;
  created_at: string;
}

// Extended types with computed fields
export interface UserWithStats extends UserProfile {
  followers_count: number;
  following_count: number;
  playlists_count: number;
  is_following?: boolean;
}

export interface PlaylistWithUser extends Playlist {
  user_profiles: UserProfile;
  likes_count: number;
  plays_count: number;
  is_liked?: boolean;
  tracks?: PlaylistTrack[];
}

// Filter and query types
export interface PlaylistFilters {
  platform?: 'spotify' | 'apple' | 'custom';
  tags?: string[];
  user_id?: string;
  search?: string;
  is_public?: boolean;
}

export interface UserFilters {
  search?: string;
  has_playlists?: boolean;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreatePlaylistData {
  name: string;
  description?: string;
  context_story: string; // Required for sharing
  platform: 'spotify' | 'apple' | 'custom';
  external_id?: string;
  external_url?: string;
  cover_image_url?: string;
  is_public: boolean;
  tags: string[];
}

export interface UpdatePlaylistData {
  name?: string;
  description?: string;
  context_story?: string;
  cover_image_url?: string;
  is_public?: boolean;
  tags?: string[];
}

export interface CreateUserProfileData {
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_private?: boolean;
}

export interface UpdateUserProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_private?: boolean;
  profile_completed?: boolean;
} 