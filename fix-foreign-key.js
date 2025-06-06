const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixForeignKey() {
  console.log('🔧 Fixing foreign key relationship...');
  
  try {
    // First, check current constraints
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_name', 'playlists')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (constraintError) {
      console.log('ℹ️ Could not check constraints (normal for anon key)');
    } else {
      console.log('📋 Current constraints:', constraints);
    }
    
    // Try to run the foreign key fix SQL
    const fixSQL = `
      -- Drop existing foreign key if it exists
      DO $$ 
      BEGIN
          -- Try to drop the constraint if it exists
          IF EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'playlists_user_id_fkey' 
              AND table_name = 'playlists'
          ) THEN
              ALTER TABLE public.playlists DROP CONSTRAINT playlists_user_id_fkey;
          END IF;
      EXCEPTION
          WHEN OTHERS THEN
              -- Ignore errors if constraint doesn't exist
              NULL;
      END $$;
      
      -- Add proper foreign key constraint to user_profiles
      ALTER TABLE public.playlists 
      ADD CONSTRAINT playlists_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL });
    
    if (error) {
      console.log('❌ Could not run SQL directly:', error.message);
      console.log('\n📝 Please run this SQL manually in your Supabase SQL Editor:');
      console.log('----------------------------------------');
      console.log(fixSQL);
      console.log('----------------------------------------');
    } else {
      console.log('✅ Foreign key constraint added successfully!');
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('\n📝 Please run the fix-database-simple.sql file manually in your Supabase SQL Editor');
  }
}

fixForeignKey().catch(console.error); 