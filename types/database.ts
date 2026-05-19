/** Supabase client generics: each table must include `Relationships` (postgrest-js >= v2.74). */
type EmptyRelationships = []

/** Rows/inserts/updates must extend `Record<string, unknown>` for `GenericSchema` inference. */
type DbRecord<T> = T & Record<string, unknown>

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: DbRecord<UserProfile>;
        Insert: DbRecord<
          Omit<UserProfile, 'created_at' | 'updated_at' | 'is_private'> & {
            is_private?: boolean;
          }
        >;
        Update: DbRecord<Partial<Omit<UserProfile, 'id' | 'created_at'>>>;
        Relationships: EmptyRelationships;
      };
      playlists: {
        Row: DbRecord<Playlist>;
        Insert: DbRecord<
          Omit<
            Playlist,
            | 'id'
            | 'created_at'
            | 'updated_at'
            | 'track_count'
            | 'duration_ms'
          > & {
            track_count?: number;
            duration_ms?: number;
          }
        >;
        Update: DbRecord<Partial<Omit<Playlist, 'id' | 'created_at'>>>;
        Relationships: [
          {
            foreignKeyName: 'playlists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'playlist_tracks_playlist_id_fkey';
            columns: ['id'];
            isOneToOne: false;
            referencedRelation: 'playlist_tracks';
            referencedColumns: ['playlist_id'];
          },
        ];
      };
      playlist_tracks: {
        Row: DbRecord<PlaylistTrack>;
        Insert: DbRecord<Omit<PlaylistTrack, 'id' | 'added_at'>>;
        Update: DbRecord<Partial<Omit<PlaylistTrack, 'id' | 'playlist_id'>>>;
        Relationships: [
          {
            foreignKeyName: 'playlist_tracks_playlist_id_fkey';
            columns: ['playlist_id'];
            isOneToOne: false;
            referencedRelation: 'playlists';
            referencedColumns: ['id'];
          },
        ];
      };
      playlist_likes: {
        Row: DbRecord<PlaylistLike>;
        Insert: DbRecord<Omit<PlaylistLike, 'id' | 'created_at'>>;
        Update: never;
        Relationships: EmptyRelationships;
      };
      user_follows: {
        Row: DbRecord<UserFollow>;
        Insert: DbRecord<Omit<UserFollow, 'id' | 'created_at'>>;
        Update: never;
        Relationships: EmptyRelationships;
      };
      music_friends: {
        Row: DbRecord<MusicFriend>;
        Insert: DbRecord<Omit<MusicFriend, 'id' | 'created_at'>>;
        Update: DbRecord<
          Partial<Omit<MusicFriend, 'id' | 'user_id' | 'friend_id' | 'created_at'>>
        >;
        Relationships: EmptyRelationships;
      };
      playlist_plays: {
        Row: DbRecord<PlaylistPlay>;
        Insert: DbRecord<Omit<PlaylistPlay, 'id' | 'played_at'>>;
        Update: never;
        Relationships: EmptyRelationships;
      };
      playlist_shares: {
        Row: DbRecord<PlaylistShare>;
        Insert: DbRecord<Omit<PlaylistShare, 'id' | 'created_at'>>;
        Update: DbRecord<
          Partial<Omit<PlaylistShare, 'id' | 'playlist_id' | 'shared_by'>>
        >;
        Relationships: EmptyRelationships;
      };
      playlist_reactions: {
        Row: DbRecord<PlaylistReaction>;
        Insert: DbRecord<Omit<PlaylistReaction, 'id' | 'created_at'>>;
        Update: never;
        Relationships: EmptyRelationships;
      };
      friend_activities: {
        Row: DbRecord<FriendActivity>;
        Insert: DbRecord<Omit<FriendActivity, 'id' | 'created_at'>>;
        Update: never;
        Relationships: EmptyRelationships;
      };
      spotify_credentials: {
        Row: DbRecord<SpotifyCredential>;
        Insert: DbRecord<SpotifyCredentialInsert>;
        Update: DbRecord<Partial<Omit<SpotifyCredential, 'user_id' | 'created_at'>>>;
        Relationships: EmptyRelationships;
      };
      spotify_import_jobs: {
        Row: DbRecord<SpotifyImportJob>;
        Insert: DbRecord<Omit<SpotifyImportJob, 'id' | 'created_at'>>;
        Update: DbRecord<Partial<Omit<SpotifyImportJob, 'id' | 'created_at'>>>;
        Relationships: EmptyRelationships;
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
  profile_completed: boolean;
  music_preferences?: {
    genres?: string[];
    moods?: string[];
    discovery_preferences?: string;
  } | null;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpotifyCredential {
  user_id: string;
  encrypted_access_token: string;
  encrypted_refresh_token: string;
  token_expires_at: string;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

export type SpotifyCredentialInsert = Omit<
  SpotifyCredential,
  'created_at' | 'updated_at'
>;

export interface SpotifyImportJob {
  id: string;
  user_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  playlist_ids: string[];
  progress: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
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

export interface MusicFriend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'connected' | 'blocked';
  connection_source: string;
  compatibility_score: number;
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
  shared_with: string | null;
  share_context?: string; // Additional context for this specific share
  share_type: 'friend' | 'public' | 'group';
  created_at: string;
}

export type ReactionType = 'fire' | 'perfect' | 'thoughtful' | 'energy';

export interface PlaylistReaction {
  id: string;
  playlist_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'shared_playlist' | 'commented' | 'liked_playlist' | 'followed_user' | 'reacted' | 'playlist_create' | 'follow' | 'comment';
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

export type PlaylistEmbedAuthor = Pick<
  UserProfile,
  'id' | 'username' | 'avatar_url'
> & { bio?: string }

export interface PlaylistWithUser extends Playlist {
  user_profiles: PlaylistEmbedAuthor;
  likes_count: number;
  plays_count: number;
  is_liked?: boolean;
  tracks?: PlaylistTrack[];
  reactions?: Record<ReactionType, number>;
  user_reaction?: ReactionType | null;
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
