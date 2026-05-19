'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReactionType } from '@/types/database'

export type { ReactionType } from '@/types/database'

/**
 * Shares a playlist with context
 */
export async function sharePlaylist(
  playlistId: string,
  targetFriends: string[],
  context: string,
  shareType: 'friend' | 'public' = 'friend'
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be logged in to share a playlist')
  }

  if (context.trim().length < 10) {
    throw new Error('Share context must be at least 10 characters long')
  }

  try {
    if (shareType === 'friend' && targetFriends.length > 0) {
      const shares = targetFriends.map(friendId => ({
        playlist_id: playlistId,
        shared_by: user.id,
        shared_with: friendId,
        share_context: context.trim(),
        share_type: 'friend'
      }))

      const { error } = await supabase.from('playlist_shares').insert(shares)
      if (error) throw error
    } else if (shareType === 'public') {
      const { error } = await supabase.from('playlist_shares').insert({
        playlist_id: playlistId,
        shared_by: user.id,
        shared_with: null, // Public share has no specific target
        share_context: context.trim(),
        share_type: 'public'
      })
      if (error) throw error
    }

    revalidatePath('/friends')
    revalidatePath(`/playlists/${playlistId}`)
    return { success: true }
  } catch (error) {
    console.error('Error sharing playlist:', error)
    throw new Error('Failed to share playlist. Database tables might be missing.')
  }
}

/**
 * Adds or removes a reaction to a playlist
 */
export async function toggleReaction(
  playlistId: string,
  reactionType: ReactionType
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be logged in to react to a playlist')
  }

  try {
    // Check if reaction already exists
    const { data: existing, error: existingError } = await supabase
      .from('playlist_reactions')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError
    }

    if (existing) {
      // Remove reaction
      const { error } = await supabase
        .from('playlist_reactions')
        .delete()
        .eq('id', existing.id)
      if (error) throw error
    } else {
      // Add reaction
      const { error } = await supabase.from('playlist_reactions').insert({
        playlist_id: playlistId,
        user_id: user.id,
        reaction_type: reactionType
      })
      if (error) throw error
    }

    revalidatePath('/friends')
    revalidatePath(`/playlists/${playlistId}`)
    return { success: true }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    throw new Error('Failed to update reaction. Database tables might be missing.')
  }
}

/**
 * Fetches recent friend activities
 */
export async function getFriendActivities() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return []

  try {
    const { data: rows, error } = await supabase
      .from('friend_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    if (!rows?.length) return []

    // PostgREST cannot embed user_profiles:user_id because friend_activities.user_id
    // FK targets auth.users, not public.user_profiles — PGRST200. Load relations explicitly.
    const userIds = new Set<string>()
    const playlistIds = new Set<string>()
    for (const r of rows) {
      if (typeof r.user_id === 'string') userIds.add(r.user_id)
      if (typeof r.target_user_id === 'string') userIds.add(r.target_user_id)
      if (typeof r.playlist_id === 'string') playlistIds.add(r.playlist_id)
    }

    const userIdList = [...userIds]
    const playlistIdList = [...playlistIds]

    const [profilesResult, playlistsResult] = await Promise.all([
      userIdList.length > 0
        ? supabase.from('user_profiles').select('id, username, avatar_url').in('id', userIdList)
        : { data: [] as { id: string; username: string; avatar_url: string | null }[], error: null },
      playlistIdList.length > 0
        ? supabase.from('playlists').select('id, name, cover_image_url').in('id', playlistIdList)
        : { data: [] as { id: string; name: string; cover_image_url: string | null }[], error: null },
    ])

    if (profilesResult.error) {
      console.error('getFriendActivities user_profiles:', profilesResult.error)
    }
    if (playlistsResult.error) {
      console.error('getFriendActivities playlists:', playlistsResult.error)
    }

    const profileById = Object.fromEntries(
      (profilesResult.data ?? []).map((p) => [p.id, p]),
    )
    const playlistById = Object.fromEntries(
      (playlistsResult.data ?? []).map((p) => [p.id, p]),
    )

    return rows.map((r) => {
      const actor = r.user_id ? profileById[r.user_id as string] : undefined
      const target = r.target_user_id ? profileById[r.target_user_id as string] : undefined
      const pl = r.playlist_id ? playlistById[r.playlist_id as string] : undefined

      return {
        ...r,
        user_profiles: actor
          ? { username: actor.username, avatar_url: actor.avatar_url }
          : undefined,
        playlists: pl
          ? { name: pl.name, cover_image_url: pl.cover_image_url }
          : undefined,
        target_profiles: target ? { username: target.username } : undefined,
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return [] // Return empty if tables missing
  }
}

/**
 * Fetches comments for a playlist with author profiles.
 */
export async function getPlaylistComments(playlistId: string) {
  const supabase = await createClient()

  try {
    const { data: rows, error } = await supabase
      .from('playlist_comments')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!rows?.length) return []

    const userIds = [...new Set(rows.map((r) => r.user_id))]
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    const profileById = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p]),
    )

    return rows.map((row) => ({
      ...row,
      user_profiles: profileById[row.user_id]
        ? {
            username: profileById[row.user_id].username,
            avatar_url: profileById[row.user_id].avatar_url,
          }
        : undefined,
    }))
  } catch (error) {
    console.error('Error fetching playlist comments:', error)
    return []
  }
}

/**
 * Adds a comment to a playlist and records friend activity.
 */
export async function addPlaylistComment(
  playlistId: string,
  commentText: string,
  respondsToContext = true,
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be logged in to comment')
  }

  const trimmed = commentText.trim()
  if (trimmed.length < 1) {
    throw new Error('Comment cannot be empty')
  }

  try {
    const { data: comment, error } = await supabase
      .from('playlist_comments')
      .insert({
        playlist_id: playlistId,
        user_id: user.id,
        comment_text: trimmed,
        responds_to_context: respondsToContext,
      })
      .select('*')
      .single()

    if (error) throw error

    await supabase.from('friend_activities').insert({
      user_id: user.id,
      activity_type: 'commented',
      playlist_id: playlistId,
      activity_metadata: {
        comment_text: trimmed,
        comment_id: comment.id,
      },
    })

    revalidatePath('/friends')
    revalidatePath(`/playlists/${playlistId}`)
    return { success: true, comment }
  } catch (error) {
    console.error('Error adding playlist comment:', error)
    throw new Error('Failed to add comment. Database tables might be missing.')
  }
}

/**
 * Deletes the current user's comment.
 */
export async function deletePlaylistComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be logged in to delete a comment')
  }

  try {
    const { error } = await supabase
      .from('playlist_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/friends')
    return { success: true }
  } catch (error) {
    console.error('Error deleting playlist comment:', error)
    throw new Error('Failed to delete comment')
  }
}
