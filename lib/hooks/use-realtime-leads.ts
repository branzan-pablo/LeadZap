'use client'

/**
 * Subscribe to `leads` for the current organization (implement with Supabase Realtime).
 */
export function useRealtimeLeads(_organizationId: string | null) {
  return { leads: [] as unknown[] }
}
