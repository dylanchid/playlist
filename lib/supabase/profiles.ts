import { SupabaseClient } from '@supabase/supabase-js'
import { Database, UserProfile } from '@/types/database'

export type SupabaseClientType = SupabaseClient<Database>

export async function createUserProfile(
  supabase: SupabaseClientType,
  userId: string,
  email: string,
  metadata?: Record<string, unknown>
): Promise<UserProfile | null> {
  try {
    console.log('🆕 [CREATE_PROFILE] Starting profile creation for:', { userId, email, metadata });
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('✅ [CREATE_PROFILE] Profile already exists:', existingProfile.username);
      return existingProfile
    }

    // Generate a username from email (max 14 characters)
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
    let baseUsername = emailPrefix
    
    // Truncate if too long, leaving room for counter
    if (baseUsername.length > 12) {
      baseUsername = baseUsername.substring(0, 12)
    }
    
    console.log('🔧 [CREATE_PROFILE] Generated base username:', baseUsername);
    
    // Find an available username
    let username = baseUsername
    let counter = 1
    let isAvailable = false
    
    while (!isAvailable && counter < 100) {
      // Check if current username fits in 14 character limit
      if (username.length > 14) {
        // Truncate base further to make room for counter
        const maxBaseLength = 14 - counter.toString().length
        username = baseUsername.substring(0, maxBaseLength) + counter
      }
      
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single()
      
      if (!existing) {
        isAvailable = true
        console.log('✅ [CREATE_PROFILE] Available username found:', username);
      } else {
        console.log('⚠️ [CREATE_PROFILE] Username taken, trying next:', username);
        counter++
        if (counter.toString().length + baseUsername.length <= 14) {
          username = `${baseUsername}${counter}`
        } else {
          // Need to shorten base username to fit counter
          const maxBaseLength = 14 - counter.toString().length
          username = baseUsername.substring(0, maxBaseLength) + counter
        }
      }
    }

    if (!isAvailable) {
      console.error('❌ [CREATE_PROFILE] Could not find available username after 100 attempts');
      return null;
    }

    // Create the profile
    const profileData = {
      id: userId,
      username: username,
      display_name: (metadata?.full_name as string) || (metadata?.name as string) || null,
      avatar_url: (metadata?.avatar_url as string) || null,
      profile_completed: !!(metadata?.full_name),
    };
    
    console.log('💾 [CREATE_PROFILE] Inserting profile data:', profileData);
    
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('❌ [CREATE_PROFILE] Database error creating profile:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Profile data attempted:', profileData)
      throw error
    }

    console.log('✅ [CREATE_PROFILE] Profile created successfully:', { 
      username: newProfile.username, 
      id: newProfile.id 
    });
    
    return newProfile
  } catch (error) {
    console.error('❌ [CREATE_PROFILE] Exception in createUserProfile:', error)
    return null
  }
}

export async function getOrCreateUserProfile(
  supabase: SupabaseClientType,
  userId: string,
  email: string,
  metadata?: Record<string, unknown>
): Promise<UserProfile | null> {
  try {
    console.log('🔍 [GET_OR_CREATE] Starting profile fetch/create for:', { userId, email });
    
    // First try to get existing profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('🔍 [GET_OR_CREATE] Profile query result:', { 
      hasProfile: !!profile, 
      errorCode: error?.code,
      errorMessage: error?.message 
    });

    if (profile && !error) {
      console.log('✅ [GET_OR_CREATE] Existing profile found:', profile.username);
      return profile
    }

    // If no profile exists, create one
    if (error?.code === 'PGRST116') {
      console.log('🆕 [GET_OR_CREATE] No profile found, creating new one...');
      const newProfile = await createUserProfile(supabase, userId, email, metadata)
      console.log('🆕 [GET_OR_CREATE] Profile creation result:', { 
        success: !!newProfile, 
        username: newProfile?.username 
      });
      return newProfile
    }

    console.error('❌ [GET_OR_CREATE] Unexpected error fetching profile:', error)
    return null
  } catch (error) {
    console.error('❌ [GET_OR_CREATE] Exception in getOrCreateUserProfile:', error)
    return null
  }
} 