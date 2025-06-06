import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlaylistFilters, PaginatedResponse, PlaylistWithUser } from '@/types/database'

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = page * limit
    
    // Parse filters
    const filters: PlaylistFilters = {
      platform: searchParams.get('platform') as 'spotify' | 'apple' | 'custom' | null || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      search: searchParams.get('search') || undefined,
      is_public: searchParams.get('is_public') === 'false' ? false : true,
    }

    let query = supabase
      .from('playlists')
      .select(`
        *,
        user_profiles (
          id,
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_public', true)

    // Apply filters
    if (filters.platform) {
      query = query.eq('platform', filters.platform)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Add likes and plays counts
    const playlistIds = data?.map(p => p.id) || []
    
    const [likesData, playsData] = await Promise.all([
      supabase
        .from('playlist_likes')
        .select('playlist_id')
        .in('playlist_id', playlistIds),
      supabase
        .from('playlist_plays')
        .select('playlist_id')
        .in('playlist_id', playlistIds)
    ])

    const likeCounts = likesData.data?.reduce((acc, like) => {
      acc[like.playlist_id] = (acc[like.playlist_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const playCounts = playsData.data?.reduce((acc, play) => {
      acc[play.playlist_id] = (acc[play.playlist_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const enrichedData = data?.map(playlist => ({
      ...playlist,
      likes_count: likeCounts[playlist.id] || 0,
      plays_count: playCounts[playlist.id] || 0,
    })) || []

    const result: PaginatedResponse<PlaylistWithUser> = {
      data: enrichedData,
      count: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    }

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error fetching infinite playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
} 