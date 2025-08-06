import { cookies } from 'next/headers';


const STATE_COOKIE_NAME = 'spotify_auth_state';

/**
 * Stores the OAuth state and code verifier in an HTTP-only cookie.
 */
export async function setOAuthStateCookie(state: string, codeVerifier: string, pathname: string) {
  const cookieStore = await cookies();
  const value = JSON.stringify({ state, codeVerifier, pathname });

  console.log('Setting OAuth state cookie:', value);

  cookieStore.set(STATE_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });
}

/**
 * Retrieves and deletes the OAuth state from the cookie.
 */
export async function getAndClearOAuthStateCookie(): Promise<{ state: string; codeVerifier: string; pathname: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(STATE_COOKIE_NAME);

  if (!cookie?.value) {
    console.error('OAuth state cookie not found.');
    return null;
  }

  try {
    const value = JSON.parse(cookie.value);
    console.log('Retrieved OAuth state from cookie:', value);
    
    // Clear the cookie after reading it
    cookieStore.delete(STATE_COOKIE_NAME);
    console.log('Cleared OAuth state cookie.');

    return value;
  } catch (error) {
    console.error('Failed to parse OAuth state cookie:', error);
    // Clear the corrupted cookie
    cookieStore.delete(STATE_COOKIE_NAME);
    return null;
  }
} 