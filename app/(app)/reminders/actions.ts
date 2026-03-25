"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type ReminderActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string }

const createReminderSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().trim().min(1, "Informe o título").max(200, "Título muito longo"),
  dueAt: z.string().min(1, "Informe data e hora"),
})

export async function createReminder(
  raw: unknown
): Promise<ReminderActionResult<{ id: string }>> {
  const parsed = createReminderSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.organization_id) {
    return { ok: false, message: "Organização não encontrada." }
  }

  const organizationId = profile.organization_id as string
  const due = new Date(parsed.data.dueAt)
  if (Number.isNaN(due.getTime())) {
    return { ok: false, message: "Data inválida." }
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, organization_id")
    .eq("id", parsed.data.leadId)
    .is("deleted_at", null)
    .maybeSingle()

  if (leadError || !lead || lead.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  const { data: inserted, error } = await supabase
    .from("reminders")
    .insert({
      organization_id: organizationId,
      user_id: user.id,
      lead_id: parsed.data.leadId,
      title: parsed.data.title,
      due_at: due.toISOString(),
    })
    .select("id")
    .single()

  if (error || !inserted) {
    return {
      ok: false,
      message: error?.message ?? "Não foi possível criar o lembrete.",
    }
  }

  revalidatePath("/reminders")

  return { ok: true, data: { id: inserted.id as string } }
}
