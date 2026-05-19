import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from '@supabase/supabase-js';
import { devLog } from "@/lib/auth/dev-log";

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
        // Auto refresh tokens with retry logic
        autoRefreshToken: true,
        // Persist auth state in local storage
        persistSession: true,
        // Handle auth state detection
        detectSessionInUrl: true,
        // Reduce debug logging noise in development
        debug: false
      },
      global: {
        // Add better error handling for network failures
        fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        },
      },
    }
  );

  // One-time cleanup for CORS-related issues (only on first client creation)
  if (typeof window !== 'undefined' && !cleanupPerformed) {
    const corsCleanupFlag = 'supabase-cors-cleanup-done-v2';
    if (!localStorage.getItem(corsCleanupFlag)) {
      devLog('Clearing auth localStorage after CORS configuration fix');
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
  devLog('Created Supabase client singleton');
  
  return client;
}

// Function to clear the instance (useful for testing or auth state resets)
export function clearClientInstance() {
  supabaseInstance = null;
  cleanupPerformed = false;
}
