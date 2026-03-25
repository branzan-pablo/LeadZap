"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import {
  completeReminder,
  deleteReminder,
} from "@/app/(app)/reminders/actions"
import { Button } from "@/components/ui/button"
import type { ReminderDueGroup } from "@/lib/utils/reminder-due-group"
import { reminderDueGroup } from "@/lib/utils/reminder-due-group"
import type { ReminderListItem } from "@/types/reminder"
import { cn } from "@/lib/utils"

export type ReminderListProps = {
  initialItems: ReminderListItem[]
  className?: string
}

const GROUP_LABEL: Record<ReminderDueGroup, string> = {
  overdue: "Atrasados",
  today: "Hoje",
  upcoming: "Próximos",
}

const GROUP_BORDER: Record<ReminderDueGroup, string> = {
  overdue: "border-red-200",
  today: "border-amber-200",
  upcoming: "border-zinc-200",
}

const GROUP_TITLE: Record<ReminderDueGroup, string> = {
  overdue: "text-red-700",
  today: "text-amber-800",
  upcoming: "text-zinc-800",
}

export function ReminderList({ initialItems, className }: ReminderListProps) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const grouped = useMemo(() => {
    const clock = new Date()
    const order: ReminderDueGroup[] = ["overdue", "today", "upcoming"]
    const map: Record<ReminderDueGroup, ReminderListItem[]> = {
      overdue: [],
      today: [],
      upcoming: [],
    }
    const sorted = [...items].sort(
      (a, b) =>
        new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    )
    for (const row of sorted) {
      map[reminderDueGroup(new Date(row.due_at), clock)].push(row)
    }
    return { map, order }
  }, [items])

  const onComplete = (id: string) => {
    startTransition(async () => {
      const res = await completeReminder({ reminderId: id })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      setItems((prev) => prev.filter((x) => x.id !== id))
      router.refresh()
    })
  }

  const onDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteReminder({ reminderId: id })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      setItems((prev) => prev.filter((x) => x.id !== id))
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Nenhum lembrete pendente. Crie um a partir do detalhe de um lead.
      </p>
    )
  }

  return (
    <div className={cn("space-y-8", className)}>
      {grouped.order.map((key) => {
        const list = grouped.map[key]
        if (list.length === 0) return null
        return (
          <section
            key={key}
            className={cn(
              "rounded-lg border bg-white p-4",
              GROUP_BORDER[key]
            )}
          >
            <h2
              className={cn(
                "mb-3 text-sm font-semibold tracking-tight",
                GROUP_TITLE[key]
              )}
            >
              {GROUP_LABEL[key]}
            </h2>
            <ul className="space-y-3">
              {list.map((row) => {
                const due = new Date(row.due_at)
                return (
                  <li
                    key={row.id}
                    className="flex items-start gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                  >
                    <input
                      type="checkbox"
                      disabled={pending}
                      className="mt-1 size-4 shrink-0 rounded border border-zinc-300 accent-primary"
                      aria-label={`Concluir: ${row.title}`}
                      onChange={(e) => {
                        if (e.target.checked) onComplete(row.id)
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900">{row.title}</p>
                      <p className="text-sm text-zinc-600">
                        <Link
                          href={`/leads?leadId=${row.lead_id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {row.lead_name}
                        </Link>
                        <span className="text-zinc-400"> · </span>
                        {format(due, "PPp", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-zinc-500"
                      disabled={pending}
                      onClick={() => onDelete(row.id)}
                    >
                      Excluir
                    </Button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
