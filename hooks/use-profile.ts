'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from './use-supabase'
import { UpdateUserProfileData, UserProfile } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

export function useProfile(username?: string) {
  const supabase = useSupabase()
  
  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) return null
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single()
      
      if (error) throw error
      return data as UserProfile
    },
    enabled: !!username,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const supabase = useSupabase()
  const { user, refreshProfile } = useAuth()
  
  return useMutation({
    mutationFn: async (data: UpdateUserProfileData) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      return profile as UserProfile
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      // Refresh auth context
      refreshProfile()
    },
  })
}

export function useUploadAvatar() {
  const supabase = useSupabase()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated')
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        })
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      return publicUrl
    },
  })
}

export function useCheckUsername() {
  const supabase = useSupabase()
  
  return useMutation({
    mutationFn: async (username: string) => {
      // Validate format
      if (username.length < 3 || username.length > 14) {
        throw new Error('Username must be between 3-14 characters')
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores')
      }
      
      // Check availability
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()
      
      if (data) {
        throw new Error('Username is not available')
      }
      
      // If error is 'PGRST116' (no rows), username is available
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      return true
    },
  })
}

export function useUserPlaylists(username?: string) {
  const supabase = useSupabase()
  
  return useQuery({
    queryKey: ['user-playlists', username],
    queryFn: async () => {
      if (!username) return []
      
      // First get the user profile to get the user ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single()
      
      if (!profile) return []
      
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          user_profiles!inner (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!username,
  })
}

export function useUserStats(username?: string) {
  const supabase = useSupabase()
  
  return useQuery({
    queryKey: ['user-stats', username],
    queryFn: async () => {
      if (!username) return null
      
      // Get user profile ID
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single()
      
      if (!profile) return null
      
      // Get playlist count
      const { count: playlistCount } = await supabase
        .from('playlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_public', true)
      
      // Get followers count
      const { count: followersCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id)
      
      // Get following count
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id)
      
      return {
        playlistCount: playlistCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      }
    },
    enabled: !!username,
  })
} 