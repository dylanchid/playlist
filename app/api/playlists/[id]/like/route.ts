import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LEGACY_LIKE_REACTION = 'fire'

// Helper function to add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error ? String(error.message) : ''
  return message.includes('does not exist') || message.includes('playlist_reactions')
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id: playlistId } = await params

    let data: { id: string } | null = null

    const { data: reactionData, error: reactionError } = await supabase
      .from('playlist_reactions')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', user.id)
      .eq('reaction_type', LEGACY_LIKE_REACTION)
      .single()

    if (reactionError && reactionError.code !== 'PGRST116') {
      if (!isMissingTableError(reactionError)) throw reactionError
    } else {
      data = reactionData
    }

    if (!data && isMissingTableError(reactionError)) {
      const { data: likeData, error: likeError } = await supabase
        .from('playlist_likes')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', user.id)
        .single()

      if (likeError && likeError.code !== 'PGRST116') throw likeError
      data = likeData
    }

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
  { params }: { params: Promise<{ id: string }> }
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

    const { id: playlistId } = await params

    // Check if already liked
    const { data: existingReaction, error: existingReactionError } = await supabase
      .from('playlist_reactions')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('user_id', user.id)
      .eq('reaction_type', LEGACY_LIKE_REACTION)
      .single()

    if (existingReactionError && existingReactionError.code !== 'PGRST116' && !isMissingTableError(existingReactionError)) {
      throw existingReactionError
    }

    if (isMissingTableError(existingReactionError)) {
      const { data: existingLike, error: existingLikeError } = await supabase
        .from('playlist_likes')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('user_id', user.id)
        .single()

      if (existingLikeError && existingLikeError.code !== 'PGRST116') throw existingLikeError

      if (existingLike) {
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
      }

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

    if (existingReaction) {
      // Unlike
      const { error } = await supabase
        .from('playlist_reactions')
        .delete()
        .eq('id', existingReaction.id)
      
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
        .from('playlist_reactions')
        .insert({ playlist_id: playlistId, user_id: user.id, reaction_type: LEGACY_LIKE_REACTION })
      
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
