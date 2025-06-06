import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let cleanupPerformed = false;

export function createClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only when needed
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Auto refresh tokens
        autoRefreshToken: true,
        // Persist auth state in local storage
        persistSession: true,
        // Handle auth state detection
        detectSessionInUrl: true,
        // Reduce debug logging noise in development
        debug: false
      }
    }
  );

  // One-time cleanup for CORS-related issues (only on first client creation)
  if (typeof window !== 'undefined' && !cleanupPerformed) {
    const corsCleanupFlag = 'supabase-cors-cleanup-done-v2';
    if (!localStorage.getItem(corsCleanupFlag)) {
      console.log('🧹 Clearing all auth state due to CORS configuration fix');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(corsCleanupFlag, 'true');
    }
    cleanupPerformed = true;
  }

  // Store the singleton instance
  supabaseInstance = client;
  console.log('🔌 Created Supabase client singleton instance');
  
  return client;
}

// Function to clear the instance (useful for testing or auth state resets)
export function clearClientInstance() {
  supabaseInstance = null;
  cleanupPerformed = false;
}
