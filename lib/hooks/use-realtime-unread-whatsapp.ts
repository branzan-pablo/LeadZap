"use client"

import { useCallback, useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

/**
 * IDs de leads com nova mensagem WhatsApp (memória de sessão).
 * Realtime INSERT em `messages` por organização.
 */
export function useRealtimeUnreadWhatsApp(organizationId: string | null) {
  const [unreadLeadIds, setUnreadLeadIds] = useState(() => new Set<string>())

  useEffect(() => {
    if (!organizationId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages-unread-org-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const row = payload.new as { lead_id?: string }
          if (typeof row.lead_id !== "string") return
          setUnreadLeadIds((prev) => {
            if (prev.has(row.lead_id!)) return prev
            const next = new Set(prev)
            next.add(row.lead_id!)
            return next
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [organizationId])

  const clearUnreadForLead = useCallback((leadId: string) => {
    setUnreadLeadIds((prev) => {
      if (!prev.has(leadId)) return prev
      const next = new Set(prev)
      next.delete(leadId)
      return next
    })
  }, [])

  return { unreadLeadIds, clearUnreadForLead }
}
