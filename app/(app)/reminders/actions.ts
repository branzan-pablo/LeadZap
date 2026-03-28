"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireOrgContext, type ActionResult } from "@/lib/auth/require-context"
import { createAdminClient } from "@/lib/supabase/admin"
import { toUserFacingError } from "@/lib/utils/server-error"


const createReminderSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().trim().min(1, "Informe o título").max(200, "Título muito longo"),
  dueAt: z.string().min(1, "Informe data e hora"),
})

const reminderIdSchema = z.object({
  reminderId: z.string().uuid(),
})

async function insertReminderActivity(params: {
  organization_id: string
  lead_id: string
  user_id: string
  type: "reminder_created" | "reminder_completed"
  metadata?: Record<string, unknown> | null
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return
  const admin = createAdminClient()
  await admin.from("activities").insert({
    organization_id: params.organization_id,
    lead_id: params.lead_id,
    user_id: params.user_id,
    type: params.type,
    metadata: params.metadata ?? null,
  })
}

function revalidateReminderPaths() {
  revalidatePath("/reminders")
  revalidatePath("/pipeline")
  revalidatePath("/leads")
}

export async function createReminder(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createReminderSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId } = auth.data.ctx
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
      user_id: userId,
      lead_id: parsed.data.leadId,
      title: parsed.data.title,
      due_at: due.toISOString(),
    })
    .select("id")
    .single()

  if (error || !inserted) {
    return { ok: false, message: toUserFacingError(error, "Não foi possível criar o lembrete.") }
  }

  const reminderId = inserted.id

  await insertReminderActivity({
    organization_id: organizationId,
    lead_id: parsed.data.leadId,
    user_id: userId,
    type: "reminder_created",
    metadata: {
      reminder_id: reminderId,
      title: parsed.data.title,
      due_at: due.toISOString(),
    },
  })

  revalidateReminderPaths()

  return { ok: true, data: { id: reminderId } }
}

export async function completeReminder(
  raw: unknown
): Promise<ActionResult<void>> {
  const parsed = reminderIdSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId } = auth.data.ctx

  const { data: row, error: fetchError } = await supabase
    .from("reminders")
    .select("id, user_id, lead_id, organization_id, title, completed_at")
    .eq("id", parsed.data.reminderId)
    .maybeSingle()

  if (fetchError || !row) {
    return { ok: false, message: "Lembrete não encontrado." }
  }

  if (row.user_id !== userId) {
    return { ok: false, message: "Você não pode concluir este lembrete." }
  }

  if (row.completed_at != null) {
    return { ok: false, message: "Lembrete já concluído." }
  }

  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from("reminders")
    .update({ completed_at: now })
    .eq("id", parsed.data.reminderId)

  if (updateError) {
    return { ok: false, message: toUserFacingError(updateError, "Não foi possível concluir o lembrete.") }
  }

  await insertReminderActivity({
    organization_id: row.organization_id,
    lead_id: row.lead_id,
    user_id: userId,
    type: "reminder_completed",
    metadata: {
      reminder_id: row.id,
      title: row.title,
    },
  })

  revalidateReminderPaths()

  return { ok: true, data: undefined }
}

export async function deleteReminder(
  raw: unknown
): Promise<ActionResult<void>> {
  const parsed = reminderIdSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, role } = auth.data.ctx
  const isAdmin = role === "admin"

  const { data: row, error: fetchError } = await supabase
    .from("reminders")
    .select("id, user_id")
    .eq("id", parsed.data.reminderId)
    .maybeSingle()

  if (fetchError || !row) {
    return { ok: false, message: "Lembrete não encontrado." }
  }

  if (row.user_id !== userId && !isAdmin) {
    return { ok: false, message: "Você não pode excluir este lembrete." }
  }

  const { error: deleteError } = await supabase
    .from("reminders")
    .delete()
    .eq("id", parsed.data.reminderId)

  if (deleteError) {
    return { ok: false, message: toUserFacingError(deleteError, "Não foi possível excluir o lembrete.") }
  }

  revalidateReminderPaths()

  return { ok: true, data: undefined }
}
