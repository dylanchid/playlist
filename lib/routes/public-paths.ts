/**
 * Routes that do not require a valid Supabase session for middleware.
 * Server actions and RLS still enforce authorization for mutations and private data.
 */
const PUBLIC_PATH_PREFIXES = [
  "/auth",
  "/login",
  "/discover",
  "/members",
  "/rankings",
] as const;

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;

  for (const prefix of PUBLIC_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  if (pathname.startsWith("/playlists/")) {
    if (pathname.startsWith("/playlists/create")) return false;
    return true;
  }

  if (
    pathname.startsWith("/profile/") &&
    !pathname.startsWith("/profile/edit")
  ) {
    return true;
  }

  return false;
}
