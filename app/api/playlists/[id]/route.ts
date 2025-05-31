import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPlaylistById, updatePlaylist, deletePlaylist } from '@/lib/supabase/playlists'
import type { UpdatePlaylistData } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const playlist = await fetchPlaylistById(supabase, id)
    
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ data: playlist })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Check if playlist exists and user owns it
    const existingPlaylist = await fetchPlaylistById(supabase, id)
    if (!existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    if (existingPlaylist.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own playlists' },
        { status: 403 }
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
    })
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Check if playlist exists and user owns it
    const existingPlaylist = await fetchPlaylistById(supabase, id)
    if (!existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    if (existingPlaylist.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own playlists' },
        { status: 403 }
      )
    }

    await deletePlaylist(supabase, id)
    
    return NextResponse.json({
      message: 'Playlist deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    )
  }
} 