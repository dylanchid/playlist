import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPlaylists, createPlaylist } from '@/lib/supabase/playlists'
import type { PlaylistFilters, CreatePlaylistData } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters for filters
    const filters: PlaylistFilters = {
      platform: searchParams.get('platform') as 'spotify' | 'apple' | 'custom' | null || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      search: searchParams.get('search') || undefined,
      is_public: searchParams.get('is_public') === 'false' ? false : true,
    }

    const playlists = await fetchPlaylists(supabase, filters)
    
    return NextResponse.json({
      data: playlists,
      count: playlists.length
    })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const playlistData: CreatePlaylistData = {
      name: body.name,
      description: body.description,
      platform: body.platform,
      external_id: body.external_id,
      external_url: body.external_url,
      cover_image_url: body.cover_image_url,
      is_public: body.is_public ?? true,
      tags: body.tags || [],
    }

    const playlist = await createPlaylist(supabase, user.id, playlistData)
    
    return NextResponse.json({
      data: playlist,
      message: 'Playlist created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
} 