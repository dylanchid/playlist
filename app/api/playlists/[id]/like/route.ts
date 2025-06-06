import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

// Check if user has liked a playlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: corsHeaders(),
        }
      )
    }

    const { id: playlistId } = params

    const { data, error } = await supabase
      .from('playlist_likes')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({
      liked: !!data
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error checking playlist like:', error)
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

// Toggle playlist like/unlike
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: corsHeaders(),
        }
      )
    }

    const { id: playlistId } = params

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('playlist_likes')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('playlist_likes')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      return NextResponse.json({
        action: 'unliked',
        liked: false
      }, {
        headers: corsHeaders(),
      })
    } else {
      // Like
      const { error } = await supabase
        .from('playlist_likes')
        .insert({ playlist_id: playlistId, user_id: user.id })
      
      if (error) throw error
      
      return NextResponse.json({
        action: 'liked',
        liked: true
      }, {
        headers: corsHeaders(),
      })
    }
  } catch (error) {
    console.error('Error toggling playlist like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
} 