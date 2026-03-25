import { redirect } from "next/navigation"

import { ReminderList } from "@/components/reminders/reminder-list"
import { createClient } from "@/lib/supabase/server"
import type { ReminderListItem } from "@/types/reminder"

type ReminderRow = {
  id: string
  title: string
  due_at: string
  lead_id: string
  leads: { name: string } | { name: string }[] | null
}

export default async function RemindersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

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
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("due_at", { ascending: true })

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Lembretes</h1>
        <p className="mt-2 text-sm text-red-600">
          Não foi possível carregar os lembretes.
        </p>
      </div>
    )
  }

  const rows = (data ?? []) as ReminderRow[]
  const items: ReminderListItem[] = rows.map((row) => {
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

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-zinc-900">Lembretes</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Tarefas e follow-ups vinculados aos seus leads.
      </p>
      <div className="mt-6">
        <ReminderList initialItems={items} />
      </div>
    </div>
  )
}
