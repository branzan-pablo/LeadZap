'use client'

/**
 * Subscribe to `messages` for a lead (implement with Supabase Realtime).
 */
export function useRealtimeMessages(_leadId: string | null) {
  return { messages: [] as unknown[] }
}
