# Operations, security, and database

This document is the **canonical reference** for how this repo handles auth boundaries, Supabase schema, CI, and related tooling. For product requirements, see [PRD.md](PRD.md). For Supabase CLI specifics, see [supabase/README.md](../supabase/README.md).

---

## Authentication and middleware

- **Middleware** (`middleware.ts` → `lib/supabase/middleware.ts`) creates an `@supabase/ssr` server client, calls **`supabase.auth.getUser()`**, and refreshes session cookies via the standard `getAll` / `setAll` cookie pattern.
- **Route gating** uses **`lib/routes/public-paths.ts`**: paths listed there do **not** require a session for the middleware redirect. Everything else unauthenticated users are sent to **`/auth/login`** with an optional **`?next=`** return URL (login page reads `searchParams.next`).
- **Important:** Protection of data still relies on **RLS** and server-side checks in **Server Actions** and **route handlers**. Middleware is for UX routing, not the only authorization layer.

Public examples include: `/`, `/auth/*`, `/discover`, `/members` (redirects to `/discover`), `/rankings`, `/playlists/[id]` (but **not** `/playlists/create`), `/profile/[username]` (but **not** `/profile/edit`). Tests live in `lib/routes/public-paths.test.ts`.

**Onboarding** (`/onboarding/*`) is **auth-required** — users sign in first, then complete taste profile, genres, and find-friends steps. Completion redirects to `/` (home feed).

Deprecated routes (`/melo-home`, `/demo`, `/soundcloud-demo`) redirect to `/`.

### Social login (Google, Apple, Spotify)

`UnifiedAuthForm` calls **`supabase.auth.signInWithOAuth`** for Google, Apple, and Spotify. You must turn on each provider under **Supabase Dashboard → Authentication → Providers** and paste the client ID/secret from the vendor console. Follow [Supabase: Login with Google / Apple / etc.](https://supabase.com/docs/guides/auth/social-login) for each provider’s fields.

**Site URL & redirect URLs (Auth → URL configuration):**

- Set **Site URL** to your deployed origin (e.g. `https://yourapp.com`) or `http://localhost:3000` for local-only dev.
- Under **Redirect URLs**, allow at least:  
  `http://localhost:3000/auth/callback`  
  `https://your-production-domain/auth/callback`

OAuth apps (Google Cloud, Apple Developer, Spotify Developer) must list Supabase’s callback, not your Next app path:  
`https://<project-ref>.supabase.co/auth/v1/callback` (shown in the Supabase provider settings).

After sign-in, Supabase redirects to your app’s **`/auth/callback`**, which exchanges the code and creates **`user_profiles`** when missing. Optional return path: `/auth/login?next=/discover` → OAuth still ends at `/auth/callback?redirect=...` via the form.

**Note:** *Continue with Spotify* signs the user in via **Supabase** using Spotify’s identity. **Linking Spotify for API access** (playlist import) still uses **`/api/spotify/auth/login`** after they are logged in—that flow stores tokens in **`spotify_credentials`**, not in the Auth identity.

#### “Unsupported provider: provider is not enabled” (400)

Supabase returns this until the provider is **turned on** in **the same project** as your `NEXT_PUBLIC_SUPABASE_URL`:

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** → your project → **Authentication** → **Providers**.
2. For **Google**, **Apple**, and **Spotify**: open each → toggle **Enable** → paste **Client ID** and **Client Secret** (Apple also needs Team ID, Key ID, private key, etc., per Supabase’s form) → **Save**.
3. In each vendor’s developer console, set the **redirect URI** to exactly what Supabase shows (usually `https://<project-ref>.supabase.co/auth/v1/callback`), not `http://localhost:3000/...`.
4. Under **Authentication** → **URL configuration**, add **Redirect URLs** `http://localhost:3000/auth/callback` (and your production `/auth/callback`).

If `.env.local` points at project A but you enabled providers on project B, you will see this error until the keys and dashboard match.

**See what Auth actually reports:** with the dev server running, open **`/api/auth/oauth-status`** (e.g. `http://localhost:3000/api/auth/oauth-status`). The JSON shows `oauth.google`, `oauth.apple`, `oauth.spotify`. If any is `false`, that provider is still off for **`NEXT_PUBLIC_SUPABASE_URL`**.

**Common misses**

- Toggle is on but **Save** was never clicked on the provider panel.
- **Client ID / Client Secret** left empty — some setups only flip `external.*` after required fields are filled.
- **Wrong Supabase project**: project ref in the dashboard URL must match the ref in `NEXT_PUBLIC_SUPABASE_URL` (e.g. `abcdxyz` from `https://abcdxyz.supabase.co`).
- **Dev server** started before fixing `.env.local` — restart **`npm run dev`** after env changes.

---
    

## Database migrations

### Recommended: Supabase CLI

Versioned SQL lives under **`supabase/migrations/`** (oldest → newest by timestamp prefix):

| Migration | Purpose |
|-----------|---------|
| `20260212140000_prd_social_and_sharing.sql` | PRD social features: `context_story`, `playlist_shares` (nullable `shared_with` for public shares), `playlist_reactions`, `friend_activities`, RLS, compatibility helpers. Skips `user_follows` / follower policies when that table does not exist. |
| `20260212140100_spotify_credentials.sql` | Removes Spotify OAuth columns from **`user_profiles`**; adds **`spotify_credentials`** and **`spotify_import_jobs`** with RLS. |
| `20260212140200_playlist_comments.sql` | Contextual **`playlist_comments`** with RLS for public/owner-visible playlists. |

**Before pushing:**

1. Set **`[db] major_version`** in **`supabase/config.toml`** to match your **remote** Postgres major version (e.g. run `SHOW server_version;` on Supabase).
2. Link the remote project: `npx supabase link --project-ref <ref>`.
3. Prefer **`npm run db:push`** (alias for `npx supabase db push`) on a **staging** project first.

If the database was previously patched with ad-hoc root-level `.sql` files, **compare** them to these migrations before `db push` to avoid duplicate policies or conflicting objects.

### Legacy: dashboard SQL

Older bundles such as **`fix-database-prd-alignment.sql`** and **`database-migration-critical.sql`** are **not** the preferred source of truth for new environments. Use them only for historical reference or one-off reconciliation. **`NEXT_STEPS.md`** summarizes feature activation; **`supabase/migrations/`** should win for new installs.

### Verification helper (Node)

**`npm run db:migration:status`** and **`npm run db:migration:verify`** run **`apply-critical-migration-simple.js`**, which checks connectivity and whether key objects exist. This does **not** replace migrations; it is a local sanity check against `.env.local`.

---

## Spotify and secrets

- App code stores encrypted tokens in **`spotify_credentials`** (see **`lib/spotify/database.ts`**), not on **`user_profiles`**.
- **`types/database.ts`** defines **`SpotifyCredential`** / **`SpotifyImportJob`** and no longer lists Spotify token fields on **`UserProfile`**.
- Client and shared selects use **`USER_PROFILE_SAFE_COLUMNS`** from **`lib/supabase/user-profile-select.ts`** so plaintext OAuth columns are not pulled into the browser even if they ever reappeared in the schema.
- **Encryption:** ensure server-side encryption env (see **`lib/crypto.ts`**) is set in production wherever **`encrypt` / `decrypt`** are used for tokens.

---

## HTTP security headers

**`next.config.ts`** sets a **Content-Security-Policy** that allows Spotify and Supabase endpoints, plus **`frame-ancestors 'self'`**. It intentionally still allows **`'unsafe-inline'`** and **`'unsafe-eval'`** where required for current third-party flows; tightening further should be done incrementally with manual regression on auth and Spotify.

Global **`Access-Control-Allow-Origin: *`** was **removed**; the app is expected to be used same-origin. If you add a true cross-origin API consumer, scope CORS to that origin on the relevant routes only.

---

## CI and local scripts

**`.github/workflows/ci.yml`** runs, in order:

1. **`npm ci`**
2. **`npm run typecheck`** (`tsc --noEmit`)
3. **`npm run lint`**
4. **`npm run test`** (Vitest)
5. **`npm run build`**

Useful npm scripts:

| Script | Purpose |
|--------|---------|
| `dev` | Next dev (Turbopack) |
| `build` | Production build |
| `lint` | ESLint |
| `typecheck` | TypeScript |
| `test` | Vitest |
| `db:push` | `npx supabase db push` |
| `db:migration:status` / `db:migration:verify` | Node helper against Supabase |

---

## Testing map

| Area | File(s) |
|------|---------|
| Public route policy | `lib/routes/public-paths.test.ts` |
| Playlist feed aggregation | `lib/playlists/enrich-feed.test.ts` |
| UI playlist mapping | `lib/playlists/map-for-ui.test.ts` |
| Share server actions | `app/actions/social.test.ts` |
| Playlist comments | `app/actions/social.test.ts` (addPlaylistComment) |
| Play URL helper | `lib/playlists/open-playlist.test.ts` |
| Playlists list API | `app/api/playlists/route.test.ts` |
| Infinite playlists API | `app/api/playlists/infinite/route.test.ts` |
| Spotify OAuth redirect URI | `lib/spotify/oauth-redirect-uri.test.ts` |
| Utilities | `utils/format.test.ts` |

---

## RLS and staging verification checklist

Run on a **staging** Supabase project after `npm run db:push`:

| Check | How to verify | Expected |
|-------|----------------|----------|
| Public playlists | Anonymous `GET /api/playlists/infinite` | Only `is_public = true` rows |
| Private playlist URL | Open `/playlists/{private-id}` while logged out | No data / not listed in feed |
| Share insert | Logged-in user shares with 10+ char context | Row in `playlist_shares`; friends feed updates |
| Reactions | `toggleReaction` on public playlist | Row in `playlist_reactions` |
| Spotify credentials | Query `spotify_credentials` as another user (SQL or API) | RLS denies |
| Profile columns | Inspect network tab for `user_profiles` selects | No token columns; uses `USER_PROFILE_SAFE_COLUMNS` |

Local schema smoke (requires `.env.local` and optional `ws` for Node 20):

```bash
npm run db:migration:verify
```

Remote migrations (requires `npx supabase link`):

```bash
npm run db:push
```

RLS smoke (after push, uses `.env.local`):

```bash
npm run db:rls:check
```

E2E smoke (optional; requires running app + `PLAYWRIGHT_BASE_URL`):

```bash
npx playwright install chromium
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

### Staging verification log

Record results here after running on staging (date / project ref / pass-fail):

| Check | Staging result | Notes |
|-------|----------------|-------|
| Public playlists (anon infinite API) | _pending_ | |
| Private playlist URL logged out | _pending_ | |
| Share insert (10+ char context) | _pending_ | |
| Reactions | _pending_ | |
| Comments | _pending_ | Requires `20260212140200` migration |
| Spotify credentials RLS | _pending_ | |
| Safe profile columns | _pending_ | |

---

## Related documents

- **[supabase/README.md](../supabase/README.md)** — CLI workflow and migration order.
- **[NEXT_STEPS.md](../NEXT_STEPS.md)** — Feature checklist and manual verification (sharing, reactions, feed).
- **[SPOTIFY_INTEGRATION_PLAN.md](SPOTIFY_INTEGRATION_PLAN.md)** — Product/technical Spotify notes (if maintained).

---

## Changelog (high level)

Recent hardening work in this repo includes: real Supabase session validation in middleware; explicit public path list; safe `user_profiles` column lists; versioned Supabase migrations (PRD social + Spotify credentials); pinned `next` / Supabase deps; removal of deprecated `@supabase/auth-helpers-nextjs`; CI including production build; extracted playlist feed enrichment for tests; CSP `frame-ancestors` and removal of blanket CORS.

---

## Supabase dashboard / “Connect” wizard (this repo)

If you follow the official **Install packages → shadcn → env** flow, align it with this codebase as follows:

1. **Packages** — Already declared in `package.json` (`@supabase/supabase-js`, `@supabase/ssr`). Run `npm install` after clone.

2. **`npx shadcn@latest add @supabase/supabase-client-nextjs`** — **Do not use `--overwrite` here** unless you intend to replace this project’s custom clients. A dry run shows it would overwrite `lib/supabase/client.ts`, `server.ts`, and `middleware.ts` and may introduce `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` while this app still uses **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**. Prefer keeping the existing files; browse **https://supabase.com/ui** for individual components to copy in manually.

3. **Environment variables** — Copy **[`.env.example`](../.env.example)** to **`.env.local`** and set at least `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Add Spotify and `TOKEN_ENCRYPTION_KEY` if you use those features.

4. **More UI** — Use **https://supabase.com/ui** for auth, realtime, and storage patterns; wire them to `lib/supabase/client.ts` and server helpers as needed.

5. **Agent skills** — Optional: `npx skills add supabase/agent-skills` for AI tooling; unrelated to runtime behavior.

