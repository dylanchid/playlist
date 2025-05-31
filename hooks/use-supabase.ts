'use client'

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export function useSupabase() {
  return createClient()
} 