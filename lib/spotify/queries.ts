import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSpotifyConnectionStatusAction,
  getSpotifyUserProfileAction,
  getSpotifyPlaylistsAction,
  getSpotifyPlaylistAction,
  getSpotifyPlaylistTracksAction,
  initiateSpotifyConnectionAction,
  disconnectSpotifyAction,
} from '@/app/actions/spotify';

// Connection status query
export const useSpotifyConnectionStatus = () => {
  return useQuery({
    queryKey: ['spotify', 'connection'],
    queryFn: () => getSpotifyConnectionStatusAction(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

// User profile query
export const useSpotifyUser = () => {
  const { data: connection } = useSpotifyConnectionStatus();
  return useQuery({
    queryKey: ['spotify', 'user'],
    queryFn: () => getSpotifyUserProfileAction(),
    enabled: !!connection?.connected,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// User playlists with infinite scroll
export const useSpotifyPlaylists = (limit = 50) => {
  const { data: connection } = useSpotifyConnectionStatus();
  return useInfiniteQuery({
    queryKey: ['spotify', 'playlists', limit],
    queryFn: ({ pageParam = 0 }) => getSpotifyPlaylistsAction({ limit, pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.next) {
        // Extract offset and limit from the 'next' URL
        const url = new URL(lastPage.next);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        return offset;
      }
      return undefined;
    },
    enabled: !!connection?.connected,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Individual playlist query
export const useSpotifyPlaylist = (playlistId: string, fields?: string) => {
  const { data: connection } = useSpotifyConnectionStatus();
  return useQuery({
    queryKey: ['spotify', 'playlist', playlistId, fields],
    queryFn: () => getSpotifyPlaylistAction({ playlistId, fields }),
    enabled: !!playlistId && !!connection?.connected,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Playlist tracks with infinite scroll
export const useSpotifyPlaylistTracks = (playlistId: string, limit = 50) => {
  const { data: connection } = useSpotifyConnectionStatus();
  return useInfiniteQuery({
    queryKey: ['spotify', 'playlist', playlistId, 'tracks', limit],
    queryFn: ({ pageParam = 0 }) => getSpotifyPlaylistTracksAction({ playlistId, limit, pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
       if (lastPage?.next) {
        const url = new URL(lastPage.next);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        return offset;
      }
      return undefined;
    },
    enabled: !!playlistId && !!connection?.connected,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation for connecting to Spotify
// This is now handled by a simple form action, but a mutation can be useful for optimistic UI
export const useSpotifyConnect = () => {
  return useMutation({
    mutationFn: async () => {
      // The server action handles the redirect, so we just call it.
      // This function effectively won't return in the browser context.
      return await initiateSpotifyConnectionAction();
    },
  });
};

// Mutation for disconnecting from Spotify
export const useSpotifyDisconnect = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: disconnectSpotifyAction,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate all spotify queries to reflect disconnected state
        queryClient.invalidateQueries({ queryKey: ['spotify'] });
      } else {
        // Handle error, e.g., show a toast notification
        console.error('Failed to disconnect Spotify:', data.error);
      }
    },
    onError: (error) => {
       console.error('Failed to disconnect Spotify:', error);
    }
  });
}; 