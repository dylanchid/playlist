'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export function useSupabase() {
  // Memoize the client to prevent unnecessary re-creation
  const client = useMemo(() => createClient(), [])
  return client
} 