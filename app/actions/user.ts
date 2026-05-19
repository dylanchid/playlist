'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { PlaylistWithUser } from '@/types/database';
import { enrichPlaylistsWithEngagement } from '@/lib/playlists/enrich-feed';

// Reusable function to get the current user ID - consider moving to a shared file
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}

interface TasteProfile {
  genres: string[];
  moods: string[];
  discovery_preferences: 'similar' | 'diverse' | 'open';
}

/**
 * Server Action to update the user's taste profile.
 * @param profile - The user's taste profile data.
 */
export async function updateTasteProfileAction(profile: TasteProfile) {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        music_preferences: {
          genres: profile.genres,
          moods: profile.moods,
          discovery_preferences: profile.discovery_preferences,
        },
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('display_name')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Revalidate paths that depend on this data
    if (data?.display_name) {
      revalidatePath(`/profile/${data.display_name}`);
    }
    revalidatePath('/');
    revalidatePath('/onboarding/taste-profile');

  } catch (error) {
    if (error instanceof Error) {
      // In a real app, you'd want to log this error to a service
      console.error("Error in updateTasteProfileAction:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }

  // Redirect to the main feed upon successful completion
  redirect('/');
}

export async function followUserAction(userIdToFollow: string) {
  try {
    const currentUserId = await getUserId();
    const supabase = await createClient();

    if (currentUserId === userIdToFollow) {
      throw new Error("You cannot follow yourself.");
    }

    const { error } = await supabase.from('music_friends').insert({
      user_id: currentUserId,
      friend_id: userIdToFollow,
      status: 'connected', // Directly connect for now, no request needed
      connection_source: 'onboarding_suggestion',
    });

    if (error) {
      // Handle potential unique constraint violation if already following
      if (error.code === '23505') {
        console.log(`User ${currentUserId} is already following ${userIdToFollow}.`);
        return { success: true, message: 'Already following.' };
      }
      throw new Error(error.message);
    }
    
    revalidatePath('/onboarding/find-friends');
    revalidatePath('/friends');
    return { success: true };

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in followUserAction:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
}

export async function getFriends() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('music_friends')
      .select(`
        friend_id,
        user_profiles!music_friends_friend_id_fkey (
          id,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'connected');
      
    if (error) throw error;

    type FriendProfile = {
      id: string;
      username: string;
      avatar_url: string | null;
      bio: string | null;
    };

    type FriendRow = {
      user_profiles: FriendProfile | FriendProfile[] | null;
    };

    function friendProfile(
      nested: FriendRow["user_profiles"],
    ): FriendProfile | null {
      if (nested == null) return null;
      return Array.isArray(nested) ? nested[0] ?? null : nested;
    }

    return (data ?? [])
      .map((row: FriendRow) => friendProfile(row.user_profiles))
      .filter((p): p is FriendProfile => p != null);
  } catch (error) {
    console.error("Error in getFriends:", error);
    return [];
  }
}

export async function getSuggestions() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();
    
    // Simple suggestion: users not already followed by the current user
    const { data: friendsData } = await supabase
      .from('music_friends')
      .select('friend_id')
      .eq('user_id', userId);
      
    const friendIds =
      friendsData?.map((f: { friend_id: string }) => f.friend_id) || [];
    friendIds.push(userId); // Exclude self
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url, bio')
      .not('id', 'in', `(${friendIds.join(',')})`)
      .limit(5);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    return [];
  }
}

export async function getFriendPlaylists(): Promise<PlaylistWithUser[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const userId = user.id;
    
    const { data: friendsData } = await supabase
      .from('music_friends')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'connected');
      
    const friendIds =
      friendsData?.map((f: { friend_id: string }) => f.friend_id) || [];

    const playlistIds = new Set<string>();

    if (friendIds.length > 0) {
      const { data: friendPlaylists } = await supabase
        .from('playlists')
        .select('id')
        .in('user_id', friendIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      for (const row of friendPlaylists ?? []) {
        playlistIds.add(row.id);
      }
    }

    const { data: shares } = await supabase
      .from('playlist_shares')
      .select('playlist_id')
      .or(`shared_with.eq.${userId},and(share_type.eq.public,shared_with.is.null)`)
      .order('created_at', { ascending: false })
      .limit(20);

    for (const share of shares ?? []) {
      if (share.playlist_id) playlistIds.add(share.playlist_id);
    }

    if (playlistIds.size === 0) return [];

    const ids = [...playlistIds].slice(0, 12);

    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        user_profiles:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .in('id', ids)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    const rows = data ?? [];

    const { data: reactions } = await supabase
      .from('playlist_reactions')
      .select('playlist_id, reaction_type, user_id')
      .in('playlist_id', ids);

    const { data: plays } = await supabase
      .from('playlist_plays')
      .select('playlist_id')
      .in('playlist_id', ids);

    return enrichPlaylistsWithEngagement(rows, reactions, plays, userId) as PlaylistWithUser[];
  } catch (error) {
    console.error("Error in getFriendPlaylists:", error);
    return [];
  }
}