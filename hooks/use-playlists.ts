'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/use-supabase'
import { 
  PlaylistWithUser, 
  PlaylistFilters, 
  CreatePlaylistData, 
  UpdatePlaylistData,
  PaginatedResponse 
} from '@/types'

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
  const supabase = useSupabase()

  return useQuery({
    queryKey: playlistKeys.list(filters),
    queryFn: async (): Promise<PlaylistWithUser[]> => {
      let query = supabase
        .from('playlists')
        .select(`
          *,
          user_profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('is_public', true)

      // Apply filters
      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Add likes and plays count using aggregation
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Fetch likes and plays counts separately for better performance
      const playlistIds = data?.map(p => p.id) || []
      
      const [likesData, playsData] = await Promise.all([
        supabase
          .from('playlist_likes')
          .select('playlist_id')
          .in('playlist_id', playlistIds),
        supabase
          .from('playlist_plays')
          .select('playlist_id')
          .in('playlist_id', playlistIds)
      ])

      // Count likes and plays for each playlist
      const likeCounts = likesData.data?.reduce((acc, like) => {
        acc[like.playlist_id] = (acc[like.playlist_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const playCounts = playsData.data?.reduce((acc, play) => {
        acc[play.playlist_id] = (acc[play.playlist_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Combine data
      return data?.map(playlist => ({
        ...playlist,
        likes_count: likeCounts[playlist.id] || 0,
        plays_count: playCounts[playlist.id] || 0,
      })) || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Infinite query for playlist feed
export function useInfinitePlaylists(filters: PlaylistFilters = {}) {
  const supabase = useSupabase()

  return useInfiniteQuery({
    queryKey: [...playlistKeys.list(filters), 'infinite'],
    queryFn: async ({ pageParam = 0 }): Promise<PaginatedResponse<PlaylistWithUser>> => {
      const limit = 12
      const offset = pageParam * limit

      let query = supabase
        .from('playlists')
        .select(`
          *,
          user_profiles (
            id,
            username,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('is_public', true)

      // Apply filters (same as above)
      if (filters.platform) {
        query = query.eq('platform', filters.platform)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Add likes and plays counts
      const playlistIds = data?.map(p => p.id) || []
      
      const [likesData, playsData] = await Promise.all([
        supabase
          .from('playlist_likes')
          .select('playlist_id')
          .in('playlist_id', playlistIds),
        supabase
          .from('playlist_plays')
          .select('playlist_id')
          .in('playlist_id', playlistIds)
      ])

      const likeCounts = likesData.data?.reduce((acc, like) => {
        acc[like.playlist_id] = (acc[like.playlist_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const playCounts = playsData.data?.reduce((acc, play) => {
        acc[play.playlist_id] = (acc[play.playlist_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const enrichedData = data?.map(playlist => ({
        ...playlist,
        likes_count: likeCounts[playlist.id] || 0,
        plays_count: playCounts[playlist.id] || 0,
      })) || []

      return {
        data: enrichedData,
        count: count || 0,
        page: pageParam,
        limit,
        has_more: (count || 0) > offset + limit
      }
    },
    getNextPageParam: (lastPage) => 
      lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  })
}

// Get single playlist by ID
export function usePlaylist(id: string) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: async (): Promise<PlaylistWithUser | null> => {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          user_profiles (
            id,
            username,
            avatar_url,
            bio
          ),
          playlist_tracks (
            id,
            track_name,
            artist_name,
            album_name,
            duration_ms,
            external_id,
            track_url,
            position
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Get likes and plays count
      const [likesData, playsData] = await Promise.all([
        supabase
          .from('playlist_likes')
          .select('id')
          .eq('playlist_id', id),
        supabase
          .from('playlist_plays')
          .select('id')
          .eq('playlist_id', id)
      ])

      return {
        ...data,
        likes_count: likesData.data?.length || 0,
        plays_count: playsData.data?.length || 0,
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Check if user has liked a playlist
export function useIsPlaylistLiked(playlistId: string, userId?: string) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['playlist-liked', playlistId, userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false

      const { data, error } = await supabase
        .from('playlist_likes')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!playlistId && !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// Playlist mutations
export function usePlaylistMutations() {
  const queryClient = useQueryClient()
  const supabase = useSupabase()

  const likePlaylist = useMutation({
    mutationFn: async ({ playlistId, userId }: { playlistId: string; userId: string }) => {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('playlist_likes')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('playlist_likes')
          .delete()
          .eq('playlist_id', playlistId)
          .eq('user_id', userId)
        
        if (error) throw error
        return { action: 'unliked' }
      } else {
        // Like
        const { error } = await supabase
          .from('playlist_likes')
          .insert({ playlist_id: playlistId, user_id: userId })
        
        if (error) throw error
        return { action: 'liked' }
      }
    },
    onSuccess: (_, { playlistId, userId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
      queryClient.invalidateQueries({ queryKey: ['playlist-liked', playlistId, userId] })
    },
  })

  const createPlaylist = useMutation({
    mutationFn: async (data: CreatePlaylistData & { user_id: string }) => {
      const { data: playlist, error } = await supabase
        .from('playlists')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return playlist
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
    },
  })

  const updatePlaylist = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePlaylistData }) => {
      const { data, error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
    },
  })

  const deletePlaylist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all })
    },
  })

  const recordPlay = useMutation({
    mutationFn: async ({ playlistId, userId }: { playlistId: string; userId?: string }) => {
      const { error } = await supabase
        .from('playlist_plays')
        .insert({
          playlist_id: playlistId,
          user_id: userId || null,
        })

      if (error) throw error
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.detail(playlistId) })
    },
  })

  return {
    likePlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    recordPlay,
  }
} 