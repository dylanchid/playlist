require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing columns to user_profiles table
    const alterQueries = [
      'ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS display_name varchar(50);',
      'ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;',
      'ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;'
    ];
    
    for (const query of alterQueries) {
      console.log(`Executing: ${query}`);
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error('❌ Error executing query:', error);
      } else {
        console.log('✅ Query executed successfully');
      }
    }
    
    console.log('🎉 Database schema update complete!');
    
  } catch (err) {
    console.error('❌ Schema update failed:', err);
  }
}

fixDatabaseSchema(); 