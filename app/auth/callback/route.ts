import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')
  const next = redirect ? `${origin}${redirect}` : `${origin}/`

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Auth error:', authError)
        return NextResponse.redirect(`${origin}/auth/error`)
      }

      if (authData.user) {
        // Check if user profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        // Create profile if it doesn't exist
        if (!existingProfile) {
          // Generate a username from email or user metadata
          const email = authData.user.email || ''
          const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
          
          // Find an available username
          let username = baseUsername
          let counter = 1
          let isAvailable = false
          
          while (!isAvailable && counter < 100) {
            const { data: existing } = await supabase
              .from('user_profiles')
              .select('username')
              .eq('username', username)
              .single()
            
            if (!existing) {
              isAvailable = true
            } else {
              username = `${baseUsername}${counter}`
              counter++
            }
          }

          // Create the profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              username: username,
              display_name: authData.user.user_metadata?.full_name || authData.user.user_metadata?.name,
              avatar_url: authData.user.user_metadata?.avatar_url,
              profile_completed: !!authData.user.user_metadata?.full_name,
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Continue anyway - profile can be created later
          }
        }
      }

      return NextResponse.redirect(next)
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${origin}/auth/error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
} 