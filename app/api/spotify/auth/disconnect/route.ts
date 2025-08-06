import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { getSpotifyTokens, removeSpotifyConnection } from '@/lib/spotify/database';

export async function POST(_request: NextRequest) {
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
    
    // Get the user's current Spotify tokens for revocation
    const tokens = await getSpotifyTokens(user.id);
    
    // Try to revoke the access token (best effort)
    if (tokens?.accessToken) {
      try {
        await SpotifyAuth.revokeToken(tokens.accessToken);
      } catch (error) {
        // Log but don't fail the disconnect process
        console.warn('Failed to revoke Spotify token:', error);
      }
    }
    
    // Remove the Spotify connection from the database
    await removeSpotifyConnection(user.id);
    
    return NextResponse.json({
      message: 'Spotify account disconnected successfully',
    });
    
  } catch (error) {
    console.error('Spotify disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Spotify account' },
      { status: 500 }
    );
  }
} 