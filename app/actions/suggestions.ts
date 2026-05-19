'use server';

import { createClient } from '@/lib/supabase/server';

// Mocked curators for now
const FEATURED_CURATORS = [
    { id: '3f5a2b16-8343-4e2b-8086-21a2212b2a3a', display_name: 'Alice', bio: 'Loves indie and folk.' },
    { id: 'f8d3b49a-2b7e-4b6e-8ee3-12a8b9f7c8d6', display_name: 'Bob', bio: 'All about that 90s hip hop.' },
    { id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', display_name: 'Charlie', bio: 'Electronic music producer.' },
];

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}


export async function getFriendSuggestionsAction() {
  const supabase = await createClient();
  const currentUserId = await getUserId();

  if (!currentUserId) {
    return { suggestions: FEATURED_CURATORS };
  }

  // 1. Check if user has selected genres
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('music_preferences')
    .eq('id', currentUserId)
    .single();

  if (profileError || !userProfile?.music_preferences?.genres?.length) {
    // Return featured curators if no genres or profile error
    return { suggestions: FEATURED_CURATORS.filter(c => c.id !== currentUserId) };
  }

  // 2. Find users with similar genres
  // This is a simplified query. A real implementation would be more complex,
  // likely using a database function for matching.
  const { data: similarUsers, error: similarUsersError } = await supabase
    .from('user_profiles')
    .select('id, display_name, bio')
    .neq('id', currentUserId) // Exclude current user
    // The following is a placeholder for a real similarity search
    .limit(10);

  if (similarUsersError) {
    console.error('Error fetching similar users:', similarUsersError);
    return { suggestions: FEATURED_CURATORS.filter(c => c.id !== currentUserId) };
  }
  
  const suggestions = similarUsers.map((u: { id: string; display_name: string | null; bio: string | null }) => ({
    id: u.id,
    display_name: u.display_name,
    bio: u.bio,
  }));

  // In case no similar users are found, return curators
  if (suggestions.length === 0) {
      return { suggestions: FEATURED_CURATORS.filter(c => c.id !== currentUserId) }
  }

  return { suggestions };
} 