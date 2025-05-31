// Re-export all types from our new modular type files
export * from './spotify';
export * from './playlist';

// Legacy compatibility - these will be removed once migration is complete
export type Platform = 'spotify' | 'apple' | 'custom';
export type PlaylistVisibility = 'public' | 'private';
export type SortOrder = 'asc' | 'desc';
export type PlaylistSortBy = 'created_at' | 'name' | 'likes_count' | 'plays_count';
export type UserSortBy = 'created_at' | 'username' | 'followers_count';

// Import types from modular files for component props
import type { 
  PlaylistWithUser, 
  UserWithStats, 
  PlaylistTrack, 
  CreatePlaylistData, 
  UpdatePlaylistData,
  UpdateUserData as UpdateUserProfileData,
  User as UserProfile
} from './playlist';

// Component prop types (updated for new schema)
export interface PlaylistCardProps {
  playlist: PlaylistWithUser;
  onLike: (playlistId: string) => void;
  onShare: (playlist: PlaylistWithUser) => void;
  isLiked: boolean;
}

export interface UserProfileProps {
  user: UserWithStats;
  onFollow: (userId: string) => void;
  isFollowing: boolean;
}

// State management types (updated for React Query + Context pattern)
export interface PlaylistContextType {
  currentPlaylist: PlaylistWithUser | null;
  setCurrentPlaylist: (playlist: PlaylistWithUser | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export interface PlayerContextType {
  currentTrack: PlaylistTrack | null;
  setCurrentTrack: (track: PlaylistTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

// Hook return types
export interface UsePlaylistsReturn {
  playlists: PlaylistWithUser[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export interface UsePlaylistMutationsReturn {
  likePlaylist: {
    mutate: (playlistId: string) => void;
    isLoading: boolean;
  };
  createPlaylist: {
    mutate: (data: CreatePlaylistData) => void;
    isLoading: boolean;
  };
  updatePlaylist: {
    mutate: (data: { id: string; updates: UpdatePlaylistData }) => void;
    isLoading: boolean;
  };
  deletePlaylist: {
    mutate: (playlistId: string) => void;
    isLoading: boolean;
  };
}

export interface UseUserMutationsReturn {
  followUser: {
    mutate: (userId: string) => void;
    isLoading: boolean;
  };
  updateProfile: {
    mutate: (data: UpdateUserProfileData) => void;
    isLoading: boolean;
  };
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  platform?: 'spotify' | 'apple' | 'custom';
  tags?: string[];
  sortBy?: 'created_at' | 'name' | 'likes_count' | 'plays_count';
  sortOrder?: 'asc' | 'desc';
}

export interface UserSearchFilters {
  query?: string;
  sortBy?: 'created_at' | 'username' | 'followers_count';
  sortOrder?: 'asc' | 'desc';
}

// Navigation and routing types
export interface PlaylistPageParams {
  id: string;
}

export interface UserPageParams {
  username: string;
}

export interface SearchPageParams {
  q?: string;
  type?: 'playlists' | 'users' | 'all';
  platform?: 'spotify' | 'apple' | 'custom';
  tags?: string;
}

// Form validation types
export interface PlaylistFormErrors {
  name?: string;
  description?: string;
  tags?: string;
}

export interface UserProfileFormErrors {
  username?: string;
  bio?: string;
}

// Utility types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Analytics and metrics types
export interface PlaylistMetrics {
  totalPlaylists: number;
  totalLikes: number;
  totalPlays: number;
  averageTracksPerPlaylist: number;
  topTags: Array<{ tag: string; count: number }>;
  platformDistribution: Array<{ platform: Platform; count: number }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  averagePlaylistsPerUser: number;
  topCreators: Array<{ user: UserProfile; playlistCount: number }>;
}

// Additional types for compatibility
export interface PlaylistFilters {
  platform?: 'spotify' | 'apple' | 'custom';
  tags?: string[];
  user_id?: string;
  search?: string;
  is_public?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  has_more: boolean;
} 