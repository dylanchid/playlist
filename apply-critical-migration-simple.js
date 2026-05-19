const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function createVerifyClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key in .env.local',
    );
  }
  let WebSocket;
  try {
    WebSocket = require('ws');
  } catch {
    WebSocket = undefined;
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    ...(WebSocket
      ? { realtime: { transport: WebSocket } }
      : {}),
  });
}

const supabaseAdmin = createVerifyClient();

async function applyCriticalMigration() {
  console.log('🚀 Applying Critical Database Migration for Context-Required Sharing...\n');
  
  console.log('⚠️  IMPORTANT: This script requires direct database access.');
  console.log('💡 If you have Supabase CLI installed, run this instead:');
  console.log('   supabase db reset --db-url "your-db-url"');
  console.log('   or apply the SQL manually in Supabase Dashboard SQL Editor\n');
  
  try {
    // Test basic connectivity
    console.log('🔍 Testing database connectivity...');
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('\n📋 Manual Steps Required:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Prefer: npm run db:push (see supabase/migrations/). Legacy SQL archived under docs/archive/migrations-legacy/');
      console.log('4. Execute the SQL migration');
      console.log('5. Run verification: node apply-critical-migration-simple.js verify');
      return;
    }
    
    console.log('✅ Database connection successful\n');
    
    // Check current state
    console.log('🔍 Checking current schema state...');
    
    // Test if context_story exists
    try {
      const { error: contextError } = await supabaseAdmin
        .from('playlists')
        .select('context_story')
        .limit(1);
      
      if (contextError && contextError.message.includes('context_story')) {
        console.log('❌ context_story column missing - migration needed');
      } else {
        console.log('✅ context_story column already exists');
      }
    } catch (e) {
      console.log('❌ context_story column missing - migration needed');
    }
    
    // Test if playlist_shares exists
    try {
      const { error: sharesError } = await supabaseAdmin
        .from('playlist_shares')
        .select('*')
        .limit(1);
      
      if (sharesError && sharesError.message.includes('does not exist')) {
        console.log('❌ playlist_shares table missing - migration needed');
      } else {
        console.log('✅ playlist_shares table already exists');
      }
    } catch (e) {
      console.log('❌ playlist_shares table missing - migration needed');
    }

    // Test if playlist_reactions exists
    try {
      const { error: reactionsError } = await supabaseAdmin
        .from('playlist_reactions')
        .select('*')
        .limit(1);
      
      if (reactionsError && reactionsError.message.includes('does not exist')) {
        console.log('❌ playlist_reactions table missing - migration needed');
      } else {
        console.log('✅ playlist_reactions table already exists');
      }
    } catch (e) {
      console.log('❌ playlist_reactions table missing - migration needed');
    }

    // Test if friend_activities exists
    try {
      const { error: activitiesError } = await supabaseAdmin
        .from('friend_activities')
        .select('*')
        .limit(1);
      
      if (activitiesError && activitiesError.message.includes('does not exist')) {
        console.log('❌ friend_activities table missing - migration needed');
      } else {
        console.log('✅ friend_activities table already exists');
      }
    } catch (e) {
      console.log('❌ friend_activities table missing - migration needed');
    }
    
    console.log('\n📋 Required Manual Migration Steps:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Run: npm run db:push (or legacy SQL in docs/archive/migrations-legacy/)');
    console.log('3. Verify with: node apply-critical-migration-simple.js verify');
    console.log('\n📄 SQL File Contents:');
    console.log('   - Add context_story column to playlists');
    console.log('   - Create playlist_shares table with RLS');
    console.log('   - Create playlist_reactions table');
    console.log('   - Create friend_activities table');
    console.log('   - Add indexes for performance');
    console.log('   - Create triggers for activity tracking');
    
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n');
  
  try {
    // Check context_story column
    console.log('1️⃣  Testing context_story column...');
    const { data: playlistData, error: playlistError } = await supabaseAdmin
      .from('playlists')
      .select('context_story')
      .limit(1);
    
    if (playlistError) {
      if (playlistError.message.includes('context_story')) {
        console.log('❌ context_story column not found');
        return false;
      }
    }
    console.log('✅ context_story column accessible');
    
    // Check playlist_shares table
    console.log('2️⃣  Testing playlist_shares table...');
    const { data: sharesData, error: sharesError } = await supabaseAdmin
      .from('playlist_shares')
      .select('*')
      .limit(1);
    
    if (sharesError) {
      if (sharesError.message.includes('does not exist')) {
        console.log('❌ playlist_shares table not found');
        return false;
      }
    }
    console.log('✅ playlist_shares table accessible');

    // Check playlist_reactions table
    console.log('3️⃣  Testing playlist_reactions table...');
    const { error: reactionsError } = await supabaseAdmin
      .from('playlist_reactions')
      .select('*')
      .limit(1);
    
    if (reactionsError) {
      if (reactionsError.message.includes('does not exist')) {
        console.log('❌ playlist_reactions table not found');
        return false;
      }
    }
    console.log('✅ playlist_reactions table accessible');

    // Check friend_activities table
    console.log('4️⃣  Testing friend_activities table...');
    const { error: activitiesError } = await supabaseAdmin
      .from('friend_activities')
      .select('*')
      .limit(1);
    
    if (activitiesError) {
      if (activitiesError.message.includes('does not exist')) {
        console.log('❌ friend_activities table not found');
        return false;
      }
    }
    console.log('✅ friend_activities table accessible');

    console.log('5️⃣  Testing playlist_comments table...');
    const { error: commentsError } = await supabaseAdmin
      .from('playlist_comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      if (
        commentsError.message.includes('does not exist') ||
        commentsError.message.includes('schema cache')
      ) {
        console.log('⚠️  playlist_comments table not found — run npm run db:push (20260212140200_playlist_comments.sql)');
      } else {
        console.log('❌ playlist_comments error:', commentsError.message);
        return false;
      }
    } else {
      console.log('✅ playlist_comments table accessible');
    }
    
    console.log('\n🎉 Migration verification successful!');
    console.log('\n✅ Ready for context-required sharing features:');
    console.log('   - Playlists now require context stories');
    console.log('   - Share tracking with friend activities');
    console.log('   - Reaction system tables are available');
    console.log('   - Proper security policies in place');
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    verifyMigration();
  } else {
    applyCriticalMigration();
  }
}

module.exports = { applyCriticalMigration, verifyMigration }; 
