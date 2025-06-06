import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPlaylistById, updatePlaylist, deletePlaylist } from '@/lib/supabase/playlists'
import type { UpdatePlaylistData } from '@/types/database'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { 
          status: 400,
          headers: corsHeaders(),
        }
      )
    }

    const playlist = await fetchPlaylistById(supabase, id)
    
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { 
          status: 404,
          headers: corsHeaders(),
        }
      )
    }

    return NextResponse.json({
      data: playlist
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
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

    const { id } = params
    
    // Check if playlist exists and user owns it
    const existingPlaylist = await fetchPlaylistById(supabase, id)
    if (!existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { 
          status: 404,
          headers: corsHeaders(),
        }
      )
    }

    if (existingPlaylist.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own playlists' },
        { 
          status: 403,
          headers: corsHeaders(),
        }
      )
    }

    const body = await request.json()
    const updateData: UpdatePlaylistData = {
      name: body.name,
      description: body.description,
      cover_image_url: body.cover_image_url,
      is_public: body.is_public,
      tags: body.tags,
    }

    const updatedPlaylist = await updatePlaylist(supabase, id, updateData)
    
    return NextResponse.json({
      data: updatedPlaylist,
      message: 'Playlist updated successfully'
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
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

    const { id } = params
    
    // Check if playlist exists and user owns it
    const existingPlaylist = await fetchPlaylistById(supabase, id)
    if (!existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { 
          status: 404,
          headers: corsHeaders(),
        }
      )
    }

    if (existingPlaylist.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own playlists' },
        { 
          status: 403,
          headers: corsHeaders(),
        }
      )
    }

    await deletePlaylist(supabase, id)
    
    return NextResponse.json({
      message: 'Playlist deleted successfully'
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
} 