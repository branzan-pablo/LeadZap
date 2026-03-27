"use client"

import { useEffect, useRef } from "react"

import { createClient } from "@/lib/supabase/client"

/**
 * Refetch reminders when the user's rows change (Supabase Realtime).
 */
export function useRealtimeReminders(
  userId: string | null,
  onChange: () => void
) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`reminders-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reminders",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onChangeRef.current()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId])
}
