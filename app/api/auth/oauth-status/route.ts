import { NextResponse } from "next/server";

/** Legacy anon key is a JWT; new publishable keys must not use Bearer the same way. */
function headersForSupabasePublicKey(anonKey: string): Record<string, string> {
  const k = anonKey.trim();
  if (!k) return { apikey: k };
  const headers: Record<string, string> = { apikey: k };
  if (k.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${k}`;
  }
  return headers;
}

/**
 * Returns which social providers GoTrue reports as enabled for the project
 * tied to NEXT_PUBLIC_SUPABASE_URL. Use when you see
 * "Unsupported provider: provider is not enabled" — if all are false, fix
 * Authentication → Providers in the Supabase Dashboard for *this* project.
 *
 * GET /api/auth/oauth-status — no secrets in response.
 */
export async function GET() {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!urlRaw || !anon) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      },
      { status: 500 },
    );
  }

  const base = urlRaw.trim().replace(/\/$/, "");
  const anonKey = anon.trim();

  if (!base || !anonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is empty after trim",
      },
      { status: 500 },
    );
  }
  let hostname = "";
  try {
    hostname = new URL(base).hostname;
  } catch {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL is not a valid URL" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${base}/auth/v1/settings`, {
      headers: headersForSupabasePublicKey(anonKey),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      const isJwt = anonKey.startsWith("eyJ");
      const hint =
        res.status === 401
          ? isJwt
            ? "401 with a JWT anon key usually means the key is wrong, rotated, or not from this project. In Dashboard → Settings → API Keys, copy the legacy anon key or publishable key for this project, update .env.local, restart dev."
            : "401 with a publishable key (sb_publishable_...) is often a wrong/truncated key or a key from another project. Copy the key again from Settings → API Keys, ensure no quotes/spaces in .env.local, restart npm run dev."
          : undefined;
      return NextResponse.json(
        {
          ok: false,
          supabaseHost: hostname,
          error: `Auth settings request failed: ${res.status}`,
          detail: text.slice(0, 500),
          hint,
        },
        { status: 502 },
      );
    }

    const body = (await res.json()) as {
      external?: Partial<Record<string, boolean>>;
    };
    const ext = body.external ?? {};

    const supabaseSpotifyLoginRedirectUri = `${base}/auth/v1/callback`;
    const spotifyClientIdFromEnv = process.env.SPOTIFY_CLIENT_ID?.trim();

    return NextResponse.json({
      ok: true,
      supabaseHost: hostname,
      message:
        "If google/apple/spotify are false, open this project in Supabase Dashboard → Authentication → Providers, enable each, enter Client ID + Secret, and Save.",
      oauth: {
        google: Boolean(ext.google),
        apple: Boolean(ext.apple),
        spotify: Boolean(ext.spotify),
      },
      spotifySupabaseLogin: {
        redirectUriSpotifyMustAllowExactly: supabaseSpotifyLoginRedirectUri,
        addThisInSpotifyDashboard:
          "Spotify Developer → your app (the one whose Client ID is pasted in Supabase → Authentication → Providers → Spotify) → Redirect URIs → add the value of redirectUriSpotifyMustAllowExactly exactly.",
        whyDotenvClientIdMayDiffer:
          "SPOTIFY_CLIENT_ID in .env is for this repo’s playlist /api/spotify OAuth. Supabase login uses the Client ID stored in the Supabase Dashboard, not .env. If those are two different Spotify apps, only the Supabase-linked app needs the Supabase callback URI; the other app needs /api/spotify URIs.",
        spotifyClientIdPrefixFromEnvForPlaylistApp: spotifyClientIdFromEnv
          ? `${spotifyClientIdFromEnv.slice(0, 8)}...`
          : null,
        compareToAuthorizeUrl:
          "After clicking Continue with Spotify, before the error page, check the URL bar: client_id= must match the Spotify app where you added the Supabase callback.",
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        supabaseHost: hostname,
        error: e instanceof Error ? e.message : "Failed to fetch auth settings",
      },
      { status: 502 },
    );
  }
}
