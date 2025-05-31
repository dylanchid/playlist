// Core entity types (matching database schema)
export interface User {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  spotify_id?: string;
  apple_music_id?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields (not stored in DB)
  followers_count?: number;
  following_count?: number;
  playlists_count?: number;
}

// Track type for individual tracks (used in SoundCloud demo and player)
export interface Track {
  id: string;
  title: string;
  artist: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
  cover_image_url?: string;
  duration_ms: number;
  created_at?: string;
  genre?: string;
  tags?: string[];
  plays_count?: number;
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
}

// Track type specifically for playlist tracks (includes position and playlist context)
export interface PlaylistTrack extends Track {
  playlist_id: string;
  position: number;
  added_at: string;
  added_by_user_id: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  platform: 'spotify' | 'apple' | 'custom';
  external_id?: string;
  external_url?: string;
  track_count: number;
  duration_ms: number;
  cover_image_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  
  // Computed fields
  likes_count?: number;
  plays_count?: number;
  
  // Relations
  user?: User;
  tracks?: PlaylistTrack[];
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
  created_at: string;
}

// Component prop types
export interface PlaylistCardProps {
  playlist: Playlist;
  user: User;
  onLike: (playlistId: string) => void;
  onShare: (playlist: Playlist) => void;
  isLiked: boolean;
}

export interface UserProfileProps {
  user: User;
  onFollow: (userId: string) => void;
  isFollowing: boolean;
}

// API response types
export interface PlaylistWithUser extends Playlist {
  user: User;
}

export interface UserWithStats extends User {
  followers_count: number;
  following_count: number;
  playlists_count: number;
}

// Form types
export interface CreatePlaylistData {
  name: string;
  description?: string;
  platform: 'spotify' | 'apple' | 'custom';
  external_id?: string;
  external_url?: string;
  cover_image_url?: string;
  is_public: boolean;
  tags: string[];
}

export interface UpdatePlaylistData extends Partial<CreatePlaylistData> {
  id: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

// External API types
export interface AppleMusicPlaylist {
  id: string;
  attributes: {
    name: string;
    description?: {
      standard: string;
    };
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    trackCount: number;
    isPublic: boolean;
  };
}

// State management types
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  updateProfile: (data: UpdateUserData) => Promise<void>;
}

export interface PlaylistState {
  playlists: PlaylistWithUser[];
  currentPlaylist: Playlist | null;
  loading: boolean;
  fetchPlaylists: () => Promise<void>;
  fetchUserPlaylists: (userId: string) => Promise<void>;
  likePlaylist: (id: string) => Promise<void>;
  unlikePlaylist: (id: string) => Promise<void>;
  createPlaylist: (data: CreatePlaylistData) => Promise<void>;
  updatePlaylist: (data: UpdatePlaylistData) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
}

export interface UserState {
  users: UserWithStats[];
  currentUser: User | null;
  followers: User[];
  following: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  followUser: (id: string) => Promise<void>;
  unfollowUser: (id: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
}

// Utility types
export type Platform = 'spotify' | 'apple' | 'custom';
export type PlaylistVisibility = 'public' | 'private';
export type SortOrder = 'asc' | 'desc';
export type PlaylistSortBy = 'created_at' | 'name' | 'likes_count' | 'plays_count';
export type UserSortBy = 'created_at' | 'username' | 'followers_count';

// Helper function to format duration
export function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'created_at' | 'updated_at'>>;
      };
      playlist_likes: {
        Row: PlaylistLike;
        Insert: Omit<PlaylistLike, 'id' | 'created_at'>;
        Update: Partial<Omit<PlaylistLike, 'id' | 'created_at'>>;
      };
      user_follows: {
        Row: UserFollow;
        Insert: Omit<UserFollow, 'id' | 'created_at'>;
        Update: Partial<Omit<UserFollow, 'id' | 'created_at'>>;
      };
    };
  };
} 