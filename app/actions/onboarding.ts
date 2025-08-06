'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

export async function skipSpotifyConnectionAction() {
  return redirect('/onboarding/select-genres');
}

export async function skipGenreSelectionAction() {
  // This action will also mark the onboarding as completed for the user
  // so they don't get redirected back to onboarding steps.
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in skipGenreSelectionAction:", error);
      // Not redirecting to an error page, just logging.
      // The user will be redirected to find-friends anyway.
    }
  }

  return redirect('/onboarding/find-friends');
}

export async function updateUserGenresAction(genres: string[]) {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        music_preferences: {
          genres: genres,
        },
        onboarding_completed: true, // Mark onboarding as completed here too
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('display_name')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data?.display_name) {
      revalidatePath(`/profile/${data.display_name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in updateUserGenresAction:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }

  redirect('/onboarding/find-friends');
} 