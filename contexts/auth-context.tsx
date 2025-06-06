'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types/database'
import { getOrCreateUserProfile } from '@/lib/supabase/profiles'

// Define a comprehensive error type for better type safety
type AuthError = 
  | { message?: string; error_description?: string; code?: string; name?: string }
  | string
  | Error
  | null
  | undefined
  | unknown

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  authError: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  console.log('🏗️ [AUTH_PROVIDER] Component initialized', { 
    timestamp: new Date().toISOString(),
    initialized,
    loading,
    hasUser: !!user,
    hasProfile: !!profile 
  });

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const handleAuthError = useCallback((error: AuthError, context: string) => {
    // More comprehensive error filtering
    if (!error) {
      return;
    }

    // Check for empty objects
    if (typeof error === 'object' && error !== null && Object.keys(error).length === 0) {
      return;
    }

    // Check for Supabase database errors that are not user-facing
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const supabaseError = error as { code?: string; message?: string; details?: string; hint?: string };
      
      // Skip logging for certain database error codes that are expected
      if (supabaseError.code === 'PGRST116' || // No rows found
          supabaseError.code === '42501' ||    // Insufficient privilege
          supabaseError.code === '23505' ||    // Unique violation
          supabaseError.code === 'PGRST301') { // JSON object is not valid
        return;
      }
      
      // Skip empty error messages
      if (!supabaseError.message && !supabaseError.details && !supabaseError.hint) {
        return;
      }
    }

    // Check for network/fetch errors that are expected
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as { name?: string; message?: string; stack?: string };
      
      // Skip certain error types that are not actionable
      if (errorObj.name === 'AbortError' || 
          errorObj.message === 'The operation was aborted.' ||
          errorObj.message === 'Failed to fetch' ||
          errorObj.message?.includes('NetworkError') ||
          errorObj.message?.includes('ERR_NETWORK') ||
          errorObj.message?.includes('ERR_INTERNET_DISCONNECTED')) {
        console.log(`🔄 Network error in ${context}, not logging as error`);
        return;
      }
    }

    // Check for empty or undefined error messages
    let errorMessage: string = '';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as { message?: string; error_description?: string; name?: string };
      errorMessage = errorObj.message || errorObj.error_description || '';
    } else {
      errorMessage = String(error);
    }

    // Don't log if the error message is empty or just whitespace
    if (!errorMessage || errorMessage.trim() === '' || errorMessage === 'undefined' || errorMessage === 'null') {
      return;
    }

    // Only log meaningful errors
    console.error(`Auth error in ${context}:`, error)
    
    // Check for CORS or network errors
    if (errorMessage?.includes('CORS') || 
        errorMessage?.includes('Access-Control') ||
        errorMessage?.includes('Load failed') ||
        (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'TypeError')) {
      setAuthError('Network connection issue. Please refresh the page and try again.')
      
      // Clear potentially corrupted auth state
      if (typeof window !== 'undefined') {
        console.log('🔄 Clearing auth state due to CORS error')
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
        localStorage.removeItem(`sb-${projectRef}-auth-token`)
        // Force sign out to clear any corrupted state
        supabase.auth.signOut()
      }
    } else if (errorMessage?.includes('Auth session missing') || 
               errorMessage?.includes('refresh_token')) {
      // Handle auth token issues
      console.log('🔄 Auth session issue detected, clearing state')
      if (typeof window !== 'undefined') {
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
        localStorage.removeItem(`sb-${projectRef}-auth-token`)
      }
      setAuthError(null) // Don't show error for this case
    } else if (errorMessage) {
      setAuthError(errorMessage)
    }
  }, [supabase])

  const fetchProfile = useCallback(async (userId: string, userEmail?: string, userMetadata?: Record<string, unknown>) => {
    if (!userId) {
      console.log('No user ID provided for profile fetch');
      return;
    }

    setProfileLoading(true)
    clearAuthError()
    
    try {
      console.log('🔍 [PROFILE] Fetching or creating profile for user:', userId, { userEmail, hasMetadata: !!userMetadata });
      
      // If we have email, try to get or create profile
      if (userEmail) {
        console.log('📧 [PROFILE] User has email, attempting to get or create profile...');
        const profile = await getOrCreateUserProfile(supabase, userId, userEmail, userMetadata);
        if (profile) {
          console.log('✅ [PROFILE] Profile fetched/created successfully:', { 
            username: profile.username, 
            displayName: profile.display_name,
            profileCompleted: profile.profile_completed 
          });
          setProfile(profile);
          return;
        }
        console.log('⚠️ [PROFILE] getOrCreateUserProfile returned null, falling back to direct fetch');
      }

      // Fallback to original fetch logic
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          console.log('ℹ️ [PROFILE] No profile found for user:', userId);
          setProfile(null);
        } else {
          console.error('❌ [PROFILE] Database error during profile fetch:', error);
          // Only pass meaningful errors to handleAuthError
          if (error && 
              (typeof error !== 'object' || 
               Object.keys(error).length > 0) &&
              error.message &&
              error.message.trim() !== '') {
            handleAuthError(error as AuthError, 'profile fetch')
          }
        }
      } else {
        console.log('✅ [PROFILE] Profile fetched successfully:', { 
          username: data.username, 
          displayName: data.display_name,
          id: data.id 
        });
        setProfile(data)
      }
    } catch (error) {
      // Only pass meaningful errors to handleAuthError
      if (error && 
          (typeof error !== 'object' || 
           Object.keys(error).length > 0) &&
          ((error as Error).message || (error as { message?: string }).message)) {
        handleAuthError(error as AuthError, 'profile fetch')
      }
    } finally {
      setProfileLoading(false)
    }
  }, [clearAuthError, handleAuthError, supabase])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log('🔄 [PROFILE] Refreshing profile for user:', user.id);
      await fetchProfile(user.id, user.email || undefined, user.user_metadata)
    } else {
      console.log('👻 [PROFILE] No user to refresh profile for');
    }
  }, [user?.id, user?.email, user?.user_metadata, fetchProfile])

  // Track state changes for debugging
  useEffect(() => {
    console.log('📊 [AUTH_PROVIDER] State changed:', {
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      userId: user?.id,
      hasSession: !!session,
      hasProfile: !!profile,
      profileUsername: profile?.username,
      loading,
      profileLoading,
      initialized
    });
  }, [user, session, profile, loading, profileLoading, initialized]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized) {
      return;
    }

    // Get initial session
    const getSession = async () => {
      try {
        console.log('🔐 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          handleAuthError(error as AuthError, 'initial session')
        } else {
                  console.log('🔐 Initial session:', session?.user?.email || 'No session');
        console.log('🔐 Session details:', { 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          userId: session?.user?.id,
          email: session?.user?.email 
        });
        setSession(session)
        setUser(session?.user ?? null)
          
          if (session?.user?.id) {
            await fetchProfile(session.user.id, session.user.email || undefined, session.user.user_metadata)
          }
        }
      } catch (error) {
        handleAuthError(error as AuthError, 'initial session')
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email || 'No session')
        console.log('🔐 Auth event details:', { 
          event, 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id 
        });
        
        try {
          console.log('🔄 [AUTH_PROVIDER] Setting session and user state...', {
            sessionExists: !!session,
            userExists: !!session?.user,
            userId: session?.user?.id
          });
          
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user?.id) {
            console.log('👤 [AUTH_PROVIDER] User found, fetching profile...', session.user.id);
            await fetchProfile(session.user.id, session.user.email || undefined, session.user.user_metadata)
          } else {
            console.log('🔐 [AUTH_PROVIDER] No user in session, clearing profile');
            setProfile(null)
            clearAuthError() // Clear errors on sign out
          }
          
          console.log('✅ [AUTH_PROVIDER] Auth state change processing completed');
        } catch (error) {
          console.error('❌ [AUTH_PROVIDER] Error during auth state change:', error);
          handleAuthError(error as AuthError, 'auth state change')
        } finally {
          setLoading(false)
          console.log('🏁 [AUTH_PROVIDER] Loading set to false');
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    }
  }, [initialized, supabase.auth, fetchProfile, handleAuthError, clearAuthError])

  const signOut = async () => {
    try {
      clearAuthError()
      console.log('🚪 Starting sign out process...');
      
      // First clear our local state immediately
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Call Supabase signOut
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error during Supabase signOut:', error)
        handleAuthError(error as AuthError, 'sign out')
      }
      
      // Clear ALL browser storage related to auth
      if (typeof window !== 'undefined') {
        console.log('🧹 Clearing all auth-related storage...')
        
        // Clear localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || 
              key.startsWith('supabase') || 
              key.includes('auth') ||
              key.includes('session') ||
              key.includes('token')) {
            console.log(`Removing localStorage key: ${key}`)
            localStorage.removeItem(key)
          }
        })
        
        // Clear sessionStorage items
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || 
              key.startsWith('supabase') || 
              key.includes('auth') ||
              key.includes('session') ||
              key.includes('token')) {
            console.log(`Removing sessionStorage key: ${key}`)
            sessionStorage.removeItem(key)
          }
        })
        
        // Force a new Supabase client instance by invalidating any cached instances
        // This ensures the next auth operation starts fresh
        window.dispatchEvent(new Event('supabase-auth-clear'))
      }
      
      console.log('✅ Sign out process completed');
      
      // Additional verification - check if we still have any session
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.warn('⚠️ Session still exists after logout, forcing clear...')
          await supabase.auth.signOut({ scope: 'global' })
        }
      }, 100)
      
    } catch (error) {
      console.error('Error during sign out process:', error)
      handleAuthError(error as AuthError, 'sign out')
      
      // Even if there's an error, clear local state
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    authError,
    signOut,
    refreshProfile,
    clearAuthError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 