import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { getSpotifyTokens, updateSpotifyTokens } from '@/lib/spotify/database';

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
    
    // Get the user's current Spotify tokens
    const tokens = await getSpotifyTokens(user.id);
    if (!tokens?.refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 400 }
      );
    }
    
    // Refresh the access token
    const refreshedTokens = await SpotifyAuth.refreshToken(tokens.refreshToken);
    
    // Update the tokens in the database
    const expiresAt = new Date(Date.now() + refreshedTokens.expires_in * 1000);
    await updateSpotifyTokens(user.id, {
      accessToken: refreshedTokens.access_token,
      expiresAt,
    });
    
    return NextResponse.json({
      access_token: refreshedTokens.access_token,
      token_type: refreshedTokens.token_type,
      expires_in: refreshedTokens.expires_in,
      scope: refreshedTokens.scope,
      message: 'Token refreshed successfully',
    });
    
  } catch (error) {
    console.error('Spotify token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh Spotify token' },
      { status: 500 }
    );
  }
} 