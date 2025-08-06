import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifyAuth } from '@/lib/spotify/auth';
import { setOAuthStateCookie } from '@/lib/spotify/state';

export async function GET(request: NextRequest) {
  console.log('Initiating Spotify authorization flow...');
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('pathname') || '/profile/edit';

  try {
    console.log('Creating Supabase client to get user.');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.log('Successfully retrieved user:', user.id);

    console.log('Generating OAuth state and code verifier.');
    const state = SpotifyAuth.generateState();
    const codeVerifier = SpotifyAuth.generateCodeVerifier();
    
    console.log('Storing OAuth state in cookie.');
    await setOAuthStateCookie(state, codeVerifier, pathname);
    
    console.log('Generating Spotify authorization URL.');
    const host = request.headers.get('host') || '';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const finalProtocol = forwardedProto || protocol;
    const redirectUri = `${finalProtocol}://${host}/api/spotify/auth/callback`;
    
    const authUrl = await SpotifyAuth.generateAuthURL(state, codeVerifier, redirectUri);
    
    console.log('Successfully generated auth URL. Sending to client.');
    return NextResponse.json({
      authUrl,
      state,
      message: 'Redirect to Spotify authorization',
    });
    
  } catch (error) {
    console.error('Spotify auth login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Spotify authorization' },
      { status: 500 }
    );
  }
} 