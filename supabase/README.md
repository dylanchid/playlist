# Supabase CLI and migrations

This folder holds the **versioned database migrations** for this app. Treat **`supabase/migrations/*.sql`** as the source of truth for new environments.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) (repo scripts use `npx supabase` so a global install is optional).

## Config

- **`config.toml`** — Local dev defaults (ports, `project_id`, etc.).
- **`[db] major_version`** must match your **hosted** Postgres major version. In the Supabase SQL editor run:
  ```sql
  SHOW server_version;
  ```
  Then align **`major_version`** in `config.toml` before relying on local **`supabase db`** behavior or diffs.

## Applying migrations to a remote project

From the **repository root**:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run db:push
```

`npm run db:push` runs `npx supabase db push`.

Use a **staging** project first if the database already has manual SQL from root-level `.sql` files; resolve duplicate policies or objects before pushing.

## Migration order

| File | Description |
|------|-------------|
| `20260212140000_prd_social_and_sharing.sql` | PRD social layer: `context_story`, `playlist_shares` (nullable `shared_with` for public shares), `playlist_reactions`, `friend_activities`, RLS, indexes, compatibility helpers. Conditionally uses `user_follows` only if that table exists. |
| `20260212140100_spotify_credentials.sql` | Drops Spotify OAuth columns from `user_profiles`; creates `spotify_credentials` and `spotify_import_jobs` with RLS and updated-at trigger. |

## Legacy SQL in repo root

Files such as **`fix-database-prd-alignment.sql`**, **`database-migration-critical.sql`**, and **`database-migration-spotify-security.sql`** are **legacy / reference**. Prefer **`supabase/migrations/`** for new deployments so history stays linear and reviewable.

## App alignment

- Types: **`types/database.ts`** includes `spotify_credentials` and `spotify_import_jobs`; `user_profiles` no longer carries Spotify token columns in TypeScript.
- Runtime: **`lib/spotify/database.ts`** reads/writes **`spotify_credentials`** (encrypted). Ensure encryption secrets in production match **`lib/crypto.ts`** expectations.

## Full operations picture

For middleware, public routes, CI, CSP, and the verification script **`apply-critical-migration-simple.js`**, see **[docs/OPERATIONS_AND_SECURITY.md](../docs/OPERATIONS_AND_SECURITY.md)**.
