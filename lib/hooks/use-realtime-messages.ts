"use client"

import {
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react"

import { createClient } from "@/lib/supabase/client"
import type { MessageView } from "@/types/message"

type MessageRow = {
  id: string
  content: string | null
  media_type: string | null
  received_at: string
  organization_id?: string
}

function rowToView(row: MessageRow): MessageView {
  const mt = row.media_type
  const mediaOk =
    mt === "image" || mt === "audio" || mt === "video" || mt === "document"
      ? mt
      : null
  return {
    id: row.id,
    content: row.content,
    media_type: mediaOk,
    received_at: row.received_at,
  }
}

export function useRealtimeMessages(
  leadId: string | null,
  organizationId: string | null,
  setMessages: Dispatch<SetStateAction<MessageView[]>>,
  scrollRef: RefObject<HTMLDivElement | null>
) {
  const setRef = useRef(setMessages)
  useEffect(() => {
    setRef.current = setMessages
  })

  useEffect(() => {
    if (!leadId || !organizationId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages-lead-${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow
          if (
            row.organization_id != null &&
            row.organization_id !== organizationId
          ) {
            return
          }
          setRef.current((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [...prev, rowToView(row)]
          })
          requestAnimationFrame(() => {
            const el = scrollRef.current
            if (el) {
              el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
            }
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [leadId, organizationId, scrollRef])
}
