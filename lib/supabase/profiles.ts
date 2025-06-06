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
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return existingProfile
    }

    // Generate a username from email (max 14 characters)
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
    let baseUsername = emailPrefix
    
    // Truncate if too long, leaving room for counter
    if (baseUsername.length > 12) {
      baseUsername = baseUsername.substring(0, 12)
    }
    
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
      } else {
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

    // Create the profile
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username,
        display_name: (metadata?.full_name as string) || (metadata?.name as string) || null,
        avatar_url: (metadata?.avatar_url as string) || null,
        profile_completed: !!(metadata?.full_name),
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating profile:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      throw error
    }

    return newProfile
  } catch (error) {
    console.error('Error in createUserProfile:', error)
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
    // First try to get existing profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profile && !error) {
      return profile
    }

    // If no profile exists, create one
    if (error?.code === 'PGRST116') {
      return await createUserProfile(supabase, userId, email, metadata)
    }

    console.error('Error fetching profile:', error)
    return null
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error)
    return null
  }
} 