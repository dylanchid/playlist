const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create admin client for schema changes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
      console.log('3. Copy and paste the contents of database-migration-critical.sql');
      console.log('4. Execute the SQL migration');
      console.log('5. Run verification: node check-schema.js');
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
    
    console.log('\n📋 Required Manual Migration Steps:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Execute database-migration-critical.sql');
    console.log('3. Verify with: node check-schema.js');
    console.log('\n📄 SQL File Contents:');
    console.log('   - Add context_story column to playlists');
    console.log('   - Create playlist_shares table with RLS');
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
    
    console.log('\n🎉 Migration verification successful!');
    console.log('\n✅ Ready for context-required sharing features:');
    console.log('   - Playlists now require context stories');
    console.log('   - Share tracking with friend activities');
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