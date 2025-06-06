'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { 
  PlaylistWithUser, 
  PlaylistFilters, 
  CreatePlaylistData, 
  UpdatePlaylistData,
  PaginatedResponse 
} from '@/types/database'

// Query keys for consistent cache management
export const playlistKeys = {
  all: ['playlists'] as const,
  lists: () => [...playlistKeys.all, 'list'] as const,
  list: (filters: PlaylistFilters) => [...playlistKeys.lists(), filters] as const,
  details: () => [...playlistKeys.all, 'detail'] as const,
  detail: (id: string) => [...playlistKeys.details(), id] as const,
  user: (userId: string) => [...playlistKeys.all, 'user', userId] as const,
  liked: (userId: string) => [...playlistKeys.all, 'liked', userId] as const,
}

// Fetch playlists with filters and pagination
export function usePlaylists(filters: PlaylistFilters = {}) {
  return useQuery({
    queryKey: playlistKeys.list(filters),
    queryFn: async (): Promise<PlaylistWithUser[]> => {
      // Use Next.js API route instead of direct Supabase calls to avoid CORS issues
      const searchParams = new URLSearchParams();
      
      if (filters.platform) searchParams.set('platform', filters.platform);
      if (filters.tags && filters.tags.length > 0) searchParams.set('tags', filters.tags.join(','));
      if (filters.user_id) searchParams.set('user_id', filters.user_id);
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.is_public !== undefined) searchParams.set('is_public', filters.is_public.toString());
      
      const response = await fetch(`/api/playlists?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Infinite query for playlist feed
export function useInfinitePlaylists(filters: PlaylistFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...playlistKeys.list(filters), 'infinite'],
    queryFn: async ({ pageParam = 0 }): Promise<PaginatedResponse<PlaylistWithUser>> => {
      const searchParams = new URLSearchParams();
      
      searchParams.set('page', pageParam.toString());
      searchParams.set('limit', '12');
      
      if (filters.platform) searchParams.set('platform', filters.platform);
      if (filters.tags && filters.tags.length > 0) searchParams.set('tags', filters.tags.join(','));
      if (filters.user_id) searchParams.set('user_id', filters.user_id);
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.is_public !== undefined) searchParams.set('is_public', filters.is_public.toString());
      
      const response = await fetch(`/api/playlists/infinite?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const result = await response.json();
      return result;
    },
    getNextPageParam: (lastPage) => 
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  })
}

// Get single playlist by ID
export function usePlaylist(id: string) {
  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: async (): Promise<PlaylistWithUser | null> => {
      const response = await fetch(`/api/playlists/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch playlist');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Check if user has liked a playlist
export function useIsPlaylistLiked(playlistId: string, userId?: string) {
  return useQuery({
    queryKey: ['playlist-liked', playlistId, userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false

      const response = await fetch(`/api/playlists/${playlistId}/like`);
      
      if (!response.ok) {
        if (response.status === 401) {
          return false; // User not authenticated
        }
        throw new Error('Failed to check like status');
      }
      
      const result = await response.json();
      return result.liked;
    },
    enabled: !!playlistId && !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// Playlist mutations
export function usePlaylistMutations() {
  const queryClient = useQueryClient()

  const likePlaylist = useMutation({
    mutationFn: async ({ playlistId }: { playlistId: string; userId: string }) => {
      const response = await fetch(`/api/playlists/${playlistId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (_, { playlistId, userId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
      queryClient.invalidateQueries({ queryKey: ['playlist-liked', playlistId, userId] })
    },
  })

  const createPlaylist = useMutation({
    mutationFn: async (data: CreatePlaylistData) => {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
    },
  })

  const updatePlaylist = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePlaylistData }) => {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update playlist');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
    },
  })

  const deletePlaylist = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
    },
  })

  // TODO: Create API endpoints for these operations
  // const recordPlay = useMutation({
  //   mutationFn: async ({ playlistId, userId }: { playlistId: string; userId?: string }) => {
  //     // Will need API endpoint for recording plays
  //   },
  //   onSuccess: (_, { playlistId }) => {
  //     queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) })
  //   },
  // })

  // const sharePlaylist = useMutation({
  //   mutationFn: async ({ 
  //     playlistId, 
  //     sharedWith, 
  //     shareContext, 
  //     shareType = 'friend' 
  //   }: { 
  //     playlistId: string
  //     sharedWith: string
  //     shareContext: string
  //     shareType?: 'friend' | 'public' | 'group'
  //   }) => {
  //     // Will need API endpoint for sharing playlists
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: playlistKeys.all })
  //     queryClient.invalidateQueries({ queryKey: ['friend-activities'] })
  //   },
  // })

  return {
    likePlaylist,
    toggleLike: likePlaylist, // Alias for compatibility
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    // recordPlay, // TODO: Implement API endpoint
    // sharePlaylist, // TODO: Implement API endpoint
  }
} 