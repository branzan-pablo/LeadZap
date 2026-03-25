"use client"

import { useEffect, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { useRealtimeMessages } from "@/lib/hooks/use-realtime-messages"
import { cn } from "@/lib/utils"
import { formatMessageTimestamp } from "@/lib/utils/formatters"
import type { MessageView } from "@/types/message"

function mediaPlaceholder(mediaType: MessageView["media_type"]): string {
  switch (mediaType) {
    case "image":
      return "[Imagem recebida]"
    case "audio":
      return "[Áudio recebido]"
    case "video":
      return "[Vídeo recebido]"
    case "document":
      return "[Documento recebido]"
    default:
      return "[Mídia recebida]"
  }
}

export type LeadMessagesProps = {
  leadId: string
  organizationId: string
}

export function LeadMessages({ leadId, organizationId }: LeadMessagesProps) {
  const [messages, setMessages] = useState<MessageView[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, media_type, received_at")
        .eq("lead_id", leadId)
        .order("received_at", { ascending: true })

      if (cancelled) return
      if (error) {
        setMessages([])
        setLoading(false)
        return
      }

      const rows = (data ?? []) as {
        id: string
        content: string | null
        media_type: string | null
        received_at: string
      }[]

      setMessages(
        rows.map((r) => {
          const mt = r.media_type
          const mediaOk =
            mt === "image" || mt === "audio" || mt === "video" || mt === "document"
              ? mt
              : null
          return {
            id: r.id,
            content: r.content,
            media_type: mediaOk,
            received_at: r.received_at,
          }
        })
      )
      setLoading(false)
      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (el) el.scrollTop = el.scrollHeight
      })
    })()

    return () => {
      cancelled = true
    }
  }, [leadId])

  useRealtimeMessages(leadId, organizationId, setMessages, scrollRef)

  if (loading) {
    return (
      <p className="mt-4 text-sm text-zinc-500">Carregando mensagens…</p>
    )
  }

  if (messages.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-600">
        Nenhuma mensagem do WhatsApp ainda
      </p>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="mt-4 flex max-h-[min(360px,50vh)] flex-col gap-2 overflow-y-auto pr-1"
    >
      {messages.map((m) => {
        const text =
          m.media_type != null
            ? mediaPlaceholder(m.media_type)
            : (m.content ?? "")
        return (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] self-start rounded-2xl rounded-tl-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            )}
          >
            <p className="whitespace-pre-wrap break-words">{text}</p>
            <p className="mt-1 text-[10px] text-zinc-400">
              {formatMessageTimestamp(m.received_at)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
