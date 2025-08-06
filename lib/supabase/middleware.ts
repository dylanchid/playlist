import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // Create Supabase client for cookie handling only - no network requests
  const _supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
      auth: {
        // Completely disable all auth operations in middleware
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  // Get user from cookies only (no network requests)
  let user = null;
  try {
    // Only read from cookies, don't make network requests
    const authCookies = request.cookies.getAll().filter(cookie => 
      cookie.name.includes('auth-token') || cookie.name.includes('sb-')
    );
    
    // If we have auth cookies, assume user is logged in (validation happens client-side)
    if (authCookies.length > 0) {
      // Don't actually validate the token in middleware to avoid network requests
      // This is a simplified check - full validation happens on the client
      const hasValidAuthCookie = authCookies.some(cookie => 
        cookie.value && cookie.value.length > 10
      );
      if (hasValidAuthCookie) {
        user = { id: 'middleware-placeholder' }; // Placeholder to indicate user presence
      }
    }
  } catch (error) {
    // Silently handle any cookie parsing errors
    console.warn('Cookie parsing error in middleware:', error);
    user = null;
  }

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
