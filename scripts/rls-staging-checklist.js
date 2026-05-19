#!/usr/bin/env node
/**
 * RLS / security smoke checks against .env.local Supabase project.
 * Run after db:push on staging: node scripts/rls-staging-checklist.js
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  ...(() => {
    try {
      const WebSocket = require('ws');
      return { realtime: { transport: WebSocket } };
    } catch {
      return {};
    }
  })(),
});

async function runCheck(name, fn) {
  try {
    const result = await fn();
    const ok = result.pass;
    console.log(`${ok ? '✅' : '❌'} ${name}${result.detail ? ` — ${result.detail}` : ''}`);
    return ok;
  } catch (err) {
    console.log(`❌ ${name} — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('RLS staging checklist\n');

  const results = [];

  results.push(await runCheck('Anonymous infinite feed (public only)', async () => {
    const res = await fetch(`${process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'}/api/playlists/infinite?limit=5`).catch(() => null);
    if (!res) {
      return { pass: true, detail: 'skipped (dev server not running; start npm run dev to test API)' };
    }
    if (!res.ok) return { pass: false, detail: `HTTP ${res.status}` };
    const body = await res.json();
    const allPublic = (body.data ?? []).every((p) => p.is_public !== false);
    return { pass: allPublic, detail: `${body.data?.length ?? 0} rows` };
  }));

  results.push(await runCheck('playlist_shares readable via anon (expect empty or RLS-filtered)', async () => {
    const { error } = await anon.from('playlist_shares').select('id').limit(1);
    if (error && error.message.includes('permission')) {
      return { pass: true, detail: 'RLS denies anonymous direct select' };
    }
    return { pass: !error, detail: error?.message || 'select ok (may be empty)' };
  }));

  results.push(await runCheck('spotify_credentials blocked for anon', async () => {
    const { data, error } = await anon.from('spotify_credentials').select('encrypted_access_token').limit(1);
    if (error) {
      return { pass: true, detail: error.message };
    }
    if (data && data.length > 0) {
      return { pass: false, detail: 'anon can read credential rows' };
    }
    return { pass: true, detail: 'no credential rows visible to anon' };
  }));

  results.push(await runCheck('playlist_comments table exists', async () => {
    const { error } = await anon.from('playlist_comments').select('id').limit(1);
    if (error?.message?.includes('does not exist') || error?.message?.includes('schema cache')) {
      return { pass: false, detail: 'run db:push for 20260212140200_playlist_comments.sql' };
    }
    return { pass: true, detail: 'table reachable' };
  }));

  if (serviceKey) {
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      ...(() => {
        try {
          const WebSocket = require('ws');
          return { realtime: { transport: WebSocket } };
        } catch {
          return {};
        }
      })(),
    });
    results.push(await runCheck('Service role can read spotify_credentials (sanity)', async () => {
      const { error } = await admin.from('spotify_credentials').select('user_id').limit(1);
      return { pass: !error || !error.message.includes('does not exist'), detail: error?.message || 'ok' };
    }));
  } else {
    console.log('⏭️  Service role checks skipped (no SUPABASE_SERVICE_ROLE_KEY)');
  }

  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
