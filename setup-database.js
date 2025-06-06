require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabaseSetup() {
  console.log('🔍 Checking database setup...\n');
  
  try {
    // Check user_profiles table
    console.log('📋 Checking user_profiles table...');
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
        
      if (profileError) {
        console.log('❌ user_profiles table issue:', profileError.message);
      } else {
        console.log('✅ user_profiles table exists');
        if (profileData && profileData.length > 0) {
          console.log('🔍 Columns found:', Object.keys(profileData[0]).join(', '));
        } else {
          console.log('📝 Table is empty, checking with insert test...');
          // Test what columns are available by trying to insert with minimal data
          try {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({ id: '00000000-0000-0000-0000-000000000000', username: 'test' });
            console.log('🔍 Insert test error (expected):', insertError?.message);
          } catch (e) {
            console.log('🔍 Insert test failed (expected)');
          }
        }
      }
    } catch (e) {
      console.log('❌ user_profiles table does not exist');
    }
    
    console.log('\n📋 Checking playlists table...');
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .limit(1);
        
      if (playlistError) {
        console.log('❌ playlists table issue:', playlistError.message);
      } else {
        console.log('✅ playlists table exists');
        if (playlistData && playlistData.length > 0) {
          console.log('🔍 Columns found:', Object.keys(playlistData[0]).join(', '));
        }
      }
    } catch (e) {
      console.log('❌ playlists table does not exist');
    }
    
    console.log('\n📋 Checking playlist_likes table...');
    try {
      const { data: likesData, error: likesError } = await supabase
        .from('playlist_likes')
        .select('*')
        .limit(1);
        
      if (likesError) {
        console.log('❌ playlist_likes table issue:', likesError.message);
      } else {
        console.log('✅ playlist_likes table exists');
      }
    } catch (e) {
      console.log('❌ playlist_likes table does not exist');
    }
    
    console.log('\n📋 Checking playlist_plays table...');
    try {
      const { data: playsData, error: playsError } = await supabase
        .from('playlist_plays')
        .select('*')
        .limit(1);
        
      if (playsError) {
        console.log('❌ playlist_plays table issue:', playsError.message);
      } else {
        console.log('✅ playlist_plays table exists');
      }
    } catch (e) {
      console.log('❌ playlist_plays table does not exist');
    }
    
    console.log('\n📋 Checking playlist_tracks table...');
    try {
      const { data: tracksData, error: tracksError } = await supabase
        .from('playlist_tracks')
        .select('*')
        .limit(1);
        
      if (tracksError) {
        console.log('❌ playlist_tracks table issue:', tracksError.message);
      } else {
        console.log('✅ playlist_tracks table exists');
      }
    } catch (e) {
      console.log('❌ playlist_tracks table does not exist');
    }
    
    console.log('\n📋 Checking user_follows table...');
    try {
      const { data: followsData, error: followsError } = await supabase
        .from('user_follows')
        .select('*')
        .limit(1);
        
      if (followsError) {
        console.log('❌ user_follows table issue:', followsError.message);
      } else {
        console.log('✅ user_follows table exists');
      }
    } catch (e) {
      console.log('❌ user_follows table does not exist');
    }
    
  } catch (err) {
    console.error('❌ Database check failed:', err);
  }
}

checkDatabaseSetup(); 