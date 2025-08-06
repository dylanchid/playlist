import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSpotifyTokens } from '@/lib/spotify/database';
import { SpotifyAPIClient } from '@/lib/spotify/client';

export async function GET(_request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user's Spotify tokens
    const tokens = await getSpotifyTokens(user.id);
    if (!tokens) {
      return NextResponse.json(
        { error: 'Spotify not connected' },
        { status: 400 }
      );
    }
    
    // Initialize Spotify client
    const spotifyClient = new SpotifyAPIClient(tokens);
    
    // Get Spotify user profile
    const spotifyUser = await spotifyClient.getUserProfile();
    
    return NextResponse.json({
      user: spotifyUser,
      connection: {
        connected: true,
        expiresAt: tokens.expiresAt?.toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Spotify user profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get Spotify user profile' },
      { status: 500 }
    );
  }
} 