# Next steps: database, features, and verification

Use this file for **what to run** and **how to verify** social/sharing features. Architectural and security detail lives in **[docs/OPERATIONS_AND_SECURITY.md](docs/OPERATIONS_AND_SECURITY.md)**.

---

## 1. Apply database schema (pick one path)

### Option A — Supabase CLI (recommended for new or empty databases)

1. In **[supabase/config.toml](supabase/config.toml)**, set **`[db] major_version`** to match your hosted Postgres (run `SHOW server_version;` in the Supabase SQL editor).
2. From the repo root:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npm run db:push
   ```
3. Read **[supabase/README.md](supabase/README.md)** for ordering and caveats if you already ran ad-hoc SQL in the dashboard.

Migrations applied, in order:

1. **`supabase/migrations/20260212140000_prd_social_and_sharing.sql`** — sharing, reactions, friend activity, RLS, indexes (supports **public** shares with `shared_with` NULL).
2. **`supabase/migrations/20260212140100_spotify_credentials.sql`** — `spotify_credentials`, `spotify_import_jobs`, drops OAuth columns from **`user_profiles`**.

### Option B — Supabase Dashboard (legacy / one-off)

Only if you are **not** using CLI migrations yet:

1. Open **Supabase Dashboard** → your project → **SQL Editor**.
2. Prefer comparing **`supabase/migrations/`** contents with what you already ran; avoid running duplicate policy DDL.
3. Historical reference files (use with care): **`fix-database-prd-alignment.sql`**, **`database-migration-critical.sql`**. Do not run conflicting scripts twice.

---

## 2. What the schema enables

- **`playlist_shares`** — Context-required sharing (including public rows).
- **`playlist_reactions`** — Reaction system.
- **`friend_activities`** — Social feed.
- **`spotify_credentials`** — Encrypted Spotify tokens (app uses **`lib/spotify/database.ts`**).

---

## 3. Verify locally

1. Ensure **`.env.local`** has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and any crypto/Spotify secrets your code paths need).
2. Start the app:
   ```bash
   npm run dev
   ```
3. **Share:** Open a playlist → **Share** → confirm story length validation (minimum length enforced in UI/actions).
4. **Reactions:** React to a playlist; counts should update when **`playlist_reactions`** exists and RLS allows your user.
5. **Feed:** Open **Friends** after interactions.
6. **Comments:** On a playlist detail page, post a comment (requires `20260212140200_playlist_comments` migration via `npm run db:push`).

Optional connectivity / schema smoke checks (Node, uses `.env.local` and optional `ws` for Node 20):

```bash
npm run db:migration:status
npm run db:migration:verify
npm run db:rls:check
```

E2E (optional; app must be running):

```bash
npx playwright install chromium
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
# Authenticated share smoke: E2E_EMAIL=... E2E_PASSWORD=... (same base URL)
```

CI expects **`npm run typecheck`**, **`npm run lint`**, **`npm run test`**, and **`npm run build`** to pass (see **`.github/workflows/ci.yml`**).

---

## 4. After verification

- **Phase 3 / product:** see **[docs/PRD.md](docs/PRD.md)** and **[docs/TECHNICAL_SPECS.md](docs/TECHNICAL_SPECS.md)** for roadmap-aligned work.
- **Ongoing:** add tests for critical Server Actions and APIs; consider **`npm audit`** / dependency updates on a schedule.

---

**Status:** Phase 1 & 2 features are implemented in code; they require the schema above (CLI migrations or equivalent SQL) on your Supabase project to function end-to-end.
