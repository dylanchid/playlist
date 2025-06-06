import { SupabaseClient } from '@supabase/supabase-js'
import { 
  Database, 
  PlaylistWithUser, 
  PlaylistFilters, 
  CreatePlaylistData, 
  UpdatePlaylistData
} from '@/types/database'

export type SupabaseClientType = SupabaseClient<Database>

// Fetch playlists with filters and user data
export async function fetchPlaylists(
  supabase: SupabaseClientType,
  filters: PlaylistFilters = {}
): Promise<PlaylistWithUser[]> {
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

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  // Fetch likes and plays counts separately for better performance
  const playlistIds = data?.map(p => p.id) || []
  
  if (playlistIds.length === 0) {
    return []
  }

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
}

// Fetch single playlist by ID
export async function fetchPlaylistById(
  supabase: SupabaseClientType,
  id: string
): Promise<PlaylistWithUser | null> {
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
        position,
        track_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) return null

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
}

// Create new playlist with required context story
export async function createPlaylist(
  supabase: SupabaseClientType,
  userId: string,
  playlistData: CreatePlaylistData
): Promise<PlaylistWithUser> {
  // Ensure context_story is provided and not empty
  if (!playlistData.context_story || playlistData.context_story.trim().length < 10) {
    throw new Error('Context story is required and must be at least 10 characters long')
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      user_id: userId,
      ...playlistData,
    })
    .select(`
      *,
      user_profiles (
        id,
        username,
        avatar_url
      )
    `)
    .single()

  if (error) throw error

  return {
    ...data,
    likes_count: 0,
    plays_count: 0,
  }
}

// Update playlist
export async function updatePlaylist(
  supabase: SupabaseClientType,
  id: string,
  updates: UpdatePlaylistData
): Promise<PlaylistWithUser> {
  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      user_profiles (
        id,
        username,
        avatar_url
      )
    `)
    .single()

  if (error) throw error

  // Get current likes and plays count
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
}

// Delete playlist
export async function deletePlaylist(
  supabase: SupabaseClientType,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Like/unlike playlist
export async function togglePlaylistLike(
  supabase: SupabaseClientType,
  playlistId: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
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

    // Get updated count
    const { data: likesData } = await supabase
      .from('playlist_likes')
      .select('id')
      .eq('playlist_id', playlistId)

    return {
      liked: false,
      count: likesData?.length || 0
    }
  } else {
    // Like
    const { error } = await supabase
      .from('playlist_likes')
      .insert({
        playlist_id: playlistId,
        user_id: userId
      })

    if (error) throw error

    // Get updated count
    const { data: likesData } = await supabase
      .from('playlist_likes')
      .select('id')
      .eq('playlist_id', playlistId)

    return {
      liked: true,
      count: likesData?.length || 0
    }
  }
}

// Check if user has liked a playlist
export async function checkPlaylistLiked(
  supabase: SupabaseClientType,
  playlistId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('playlist_likes')
    .select('id')
    .eq('playlist_id', playlistId)
    .eq('user_id', userId)
    .single()

  return !!data
}

// Record playlist play
export async function recordPlaylistPlay(
  supabase: SupabaseClientType,
  playlistId: string,
  userId?: string,
  userAgent?: string
): Promise<void> {
  const { error } = await supabase
    .from('playlist_plays')
    .insert({
      playlist_id: playlistId,
      user_id: userId,
      user_agent: userAgent,
    })

  if (error) throw error
}

// Share playlist with context (PRD core feature)
export async function sharePlaylistWithContext(
  supabase: SupabaseClientType,
  playlistId: string,
  sharedBy: string,
  sharedWith: string,
  shareContext: string,
  shareType: 'friend' | 'public' | 'group' = 'friend'
): Promise<void> {
  // Validate context requirement
  if (!shareContext || shareContext.trim().length < 10) {
    throw new Error('Share context is required and must be at least 10 characters long')
  }

  const { error } = await supabase
    .from('playlist_shares')
    .insert({
      playlist_id: playlistId,
      shared_by: sharedBy,
      shared_with: sharedWith,
      share_context: shareContext.trim(),
      share_type: shareType,
    })

  if (error) throw error

  // Record activity for feed
  await supabase
    .from('friend_activities')
    .insert({
      user_id: sharedBy,
      activity_type: 'shared_playlist',
      playlist_id: playlistId,
      target_user_id: sharedWith,
      activity_metadata: {
        share_context: shareContext.trim(),
        share_type: shareType,
      },
    })
}

// Get shared playlists for a user
export async function getSharedPlaylists(
  supabase: SupabaseClientType,
  userId: string
): Promise<PlaylistWithUser[]> {
  const { data, error } = await supabase
    .from('playlist_shares')
    .select(`
      share_context,
      share_type,
      created_at,
      playlists (
        *,
        user_profiles (
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq('shared_with', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Transform the data to include share context
  return data?.filter(share => share.playlists).map(share => {
    const playlist = share.playlists as unknown as PlaylistWithUser;
    return {
      ...playlist,
      share_context: share.share_context,
      shared_at: share.created_at,
      likes_count: 0, // Will be populated separately if needed
      plays_count: 0,
    };
  }) || []
} 