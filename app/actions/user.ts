'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
      .eq('user_id', userId)
      .select('display_name')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Revalidate paths that depend on this data
    if (data?.display_name) {
      revalidatePath(`/profile/${data.display_name}`);
    }
    revalidatePath('/melo-home');
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
  redirect('/melo-home');
}

export async function followUserAction(userIdToFollow: string) {
  'use server';
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
    return { success: true };

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in followUserAction:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
} 