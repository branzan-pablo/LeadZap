"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePushNotification } from "@/lib/hooks/use-push-notification"
import { useRealtimeReminders } from "@/lib/hooks/use-realtime-reminders"
import { createClient } from "@/lib/supabase/client"
import { reminderBellCount } from "@/lib/utils/reminder-due-group"
import { cn } from "@/lib/utils"
import type { ReminderListItem } from "@/types/reminder"

type ReminderRow = {
  id: string
  title: string
  due_at: string
  lead_id: string
  leads: { name: string } | { name: string }[] | null
}

function mapRows(rows: ReminderRow[]): ReminderListItem[] {
  return rows.map((row) => {
    const rel = row.leads
    const name =
      rel == null
        ? "—"
        : Array.isArray(rel)
          ? (rel[0]?.name ?? "—")
          : rel.name
    return {
      id: row.id,
      title: row.title,
      due_at: row.due_at,
      lead_id: row.lead_id,
      lead_name: name,
    }
  })
}

export type NotificationBellProps = {
  userId: string | null
  className?: string
}

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const router = useRouter()
  const [items, setItems] = useState<ReminderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const pushSessionRequested = useRef(false)

  const {
    supported,
    permission,
    registering,
    error: pushError,
    register,
  } = usePushNotification()

  const load = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reminders")
      .select(
        `
        id,
        title,
        due_at,
        lead_id,
        leads ( name )
      `
      )
      .eq("user_id", userId)
      .is("completed_at", null)
      .order("due_at", { ascending: true })

    if (!error && data) {
      setItems(mapRows(data as ReminderRow[]))
    } else {
      setItems([])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    let alive = true
    void (async () => {
      await Promise.resolve()
      if (!alive) return
      await load()
    })()
    return () => {
      alive = false
    }
  }, [load])

  useRealtimeReminders(userId, () => {
    void load()
  })

  const now = new Date()
  const count = reminderBellCount(items, now)
  const urgent = [...items]
    .sort(
      (a, b) =>
        new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    )
    .slice(0, 5)

  const handleOpenChange = (open: boolean) => {
    if (
      open &&
      supported &&
      permission !== "denied" &&
      permission !== "unsupported" &&
      !pushSessionRequested.current
    ) {
      pushSessionRequested.current = true
      void register()
    }
    if (open) void load()
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("relative text-zinc-600", className)}
            aria-label="Notificações"
          />
        }
      >
        <Bell className="size-5" />
        <Badge
          variant="secondary"
          className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full p-0 text-[10px] font-medium"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-zinc-900">
          Lembretes urgentes
        </DropdownMenuLabel>
        {registering ? (
          <p className="px-2 py-1.5 text-xs text-zinc-500">
            Ativando notificações…
          </p>
        ) : null}
        {pushError ? (
          <p className="px-2 py-1.5 text-xs text-amber-700">{pushError}</p>
        ) : null}
        {permission === "denied" ? (
          <p className="px-2 py-1.5 text-xs text-zinc-500">
            Notificações bloqueadas no navegador.
          </p>
        ) : null}
        {loading ? (
          <p className="px-2 py-1.5 text-sm text-zinc-500">Carregando…</p>
        ) : urgent.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-zinc-500">
            Nada urgente no momento.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {urgent.map((r) => (
              <DropdownMenuItem
                key={r.id}
                className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
                onClick={() => {
                  router.push(`/leads?leadId=${r.lead_id}`)
                }}
              >
                <span className="font-medium text-zinc-900">{r.title}</span>
                <span className="text-xs text-zinc-500">
                  {r.lead_name} ·{" "}
                  {formatDistanceToNow(new Date(r.due_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            router.push("/reminders")
          }}
        >
          Ver todos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
