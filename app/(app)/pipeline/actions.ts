"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  addLeadNoteSchema,
  addTagToLeadSchema,
  createLeadSchema,
  createTagSchema,
  deleteLeadSchema,
  moveLeadSchema,
  removeTagFromLeadSchema,
  updateLeadSchema,
} from "@/lib/validations/pipeline"
import { phoneSchema } from "@/lib/utils/validators"

type ActivityType =
  | "lead_created"
  | "lead_updated"
  | "lead_moved"
  | "lead_deleted"
  | "lead_assigned"
  | "tag_added"
  | "tag_removed"
  | "note_added"
  | "reminder_created"
  | "reminder_completed"
  | "attachment_added"
  | "attachment_removed"
  | "message_received"

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

async function insertActivity(params: {
  organization_id: string
  lead_id: string
  user_id: string | null
  type: ActivityType
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

type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  organizationId: string
  role: "admin" | "user"
  fullName: string
}

async function requireOrgContext(): Promise<
  ActionResult<{ ctx: AuthContext }>
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("organization_id, role, full_name")
    .eq("id", user.id)
    .single()

  if (error || !profile?.organization_id) {
    return {
      ok: false,
      message: "Organização não encontrada. Conclua o onboarding.",
    }
  }

  return {
    ok: true,
    data: {
      ctx: {
        supabase,
        userId: user.id,
        organizationId: profile.organization_id as string,
        role: profile.role === "admin" ? "admin" : "user",
        fullName: (profile.full_name as string) ?? "Usuário",
      },
    },
  }
}

export async function createLead(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createLeadSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const body = parsed.data
  const phoneCheck = phoneSchema.safeParse(body.phone)
  if (!phoneCheck.success) {
    return {
      ok: false,
      message: phoneCheck.error.issues[0]?.message ?? "Telefone inválido",
    }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId } = auth.data.ctx

  const { data: dup } = await supabase
    .from("leads")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("phone", body.phone)
    .is("deleted_at", null)
    .maybeSingle()

  if (dup) {
    return {
      ok: false,
      message: "Já existe um lead com este telefone na organização.",
    }
  }

  const { data: firstStage, error: stageError } = await supabase
    .from("pipeline_stages")
    .select("id")
    .eq("organization_id", organizationId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (stageError || !firstStage) {
    return {
      ok: false,
      message: "Não foi possível localizar o estágio inicial do pipeline.",
    }
  }

  const email =
    body.email && body.email.length > 0 ? body.email.trim() : null
  const company =
    body.company && body.company.length > 0 ? body.company.trim() : null
  const notes =
    body.notes && body.notes.length > 0 ? body.notes.trim() : null

  const { data: inserted, error: insertError } = await supabase
    .from("leads")
    .insert({
      organization_id: organizationId,
      assigned_to: userId,
      pipeline_stage_id: firstStage.id as string,
      name: body.name.trim(),
      phone: body.phone,
      email,
      company,
      source: body.source,
      estimated_value:
        body.estimated_value != null ? body.estimated_value : null,
      notes,
      position: 0,
      last_interaction_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (insertError || !inserted) {
    return {
      ok: false,
      message: insertError?.message ?? "Não foi possível criar o lead.",
    }
  }

  const leadId = inserted.id as string

  await insertActivity({
    organization_id: organizationId,
    lead_id: leadId,
    user_id: userId,
    type: "lead_created",
    metadata: { name: body.name.trim() },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { id: leadId } }
}

export async function updateLead(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateLeadSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const { id, ...patch } = parsed.data
  if (Object.keys(patch).length === 0) {
    return { ok: false, message: "Nenhuma alteração enviada." }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId, role } = auth.data.ctx

  if (patch.assigned_to !== undefined && role !== "admin") {
    return { ok: false, message: "Apenas administradores podem reatribuir leads." }
  }

  const { data: existing, error: loadError } = await supabase
    .from("leads")
    .select("id, phone, organization_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle()

  if (loadError || !existing || existing.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  if (patch.phone) {
    const phoneCheck = phoneSchema.safeParse(patch.phone)
    if (!phoneCheck.success) {
      return {
        ok: false,
        message: phoneCheck.error.issues[0]?.message ?? "Telefone inválido",
      }
    }

    const { data: dup } = await supabase
      .from("leads")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("phone", patch.phone)
      .is("deleted_at", null)
      .neq("id", id)
      .maybeSingle()

    if (dup) {
      return {
        ok: false,
        message: "Já existe outro lead com este telefone.",
      }
    }
  }

  const updateRow: Record<string, unknown> = {
    last_interaction_at: new Date().toISOString(),
  }

  if (patch.name !== undefined) updateRow.name = patch.name.trim()
  if (patch.phone !== undefined) updateRow.phone = patch.phone
  if (patch.email !== undefined) {
    updateRow.email =
      patch.email === null || patch.email === "" ? null : patch.email.trim()
  }
  if (patch.company !== undefined) {
    updateRow.company =
      patch.company === null || patch.company === ""
        ? null
        : patch.company.trim()
  }
  if (patch.source !== undefined) updateRow.source = patch.source
  if (patch.estimated_value !== undefined) {
    updateRow.estimated_value = patch.estimated_value
  }
  if (patch.notes !== undefined) {
    updateRow.notes =
      patch.notes === null ? null : patch.notes
  }
  if (patch.assigned_to !== undefined) {
    updateRow.assigned_to = patch.assigned_to
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update(updateRow)
    .eq("id", id)

  if (updateError) {
    return {
      ok: false,
      message: updateError.message ?? "Não foi possível atualizar o lead.",
    }
  }

  await insertActivity({
    organization_id: organizationId,
    lead_id: id,
    user_id: userId,
    type: "lead_updated",
    metadata: { fields: Object.keys(patch) },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { id } }
}

export async function moveLead(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = moveLeadSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const { leadId, newStageId, newPosition } = parsed.data
  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId } = auth.data.ctx

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, pipeline_stage_id, organization_id")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle()

  if (leadError || !lead || lead.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  const fromStageId = lead.pipeline_stage_id as string

  const { data: stages, error: stagesError } = await supabase
    .from("pipeline_stages")
    .select("id, name, organization_id")
    .in("id", [fromStageId, newStageId])
    .eq("organization_id", organizationId)

  if (stagesError || !stages || stages.length < 1) {
    return { ok: false, message: "Estágio inválido." }
  }

  const fromMeta = stages.find((s) => s.id === fromStageId)
  const toMeta = stages.find((s) => s.id === newStageId)
  if (!toMeta) {
    return { ok: false, message: "Estágio de destino inválido." }
  }

  const { data: oldStageLeads, error: oldErr } = await supabase
    .from("leads")
    .select("id, position")
    .eq("organization_id", organizationId)
    .eq("pipeline_stage_id", fromStageId)
    .is("deleted_at", null)
    .order("position", { ascending: true })

  if (oldErr || !oldStageLeads) {
    return { ok: false, message: "Não foi possível carregar o pipeline." }
  }

  const { data: newStageLeads, error: newErr } = await supabase
    .from("leads")
    .select("id, position")
    .eq("organization_id", organizationId)
    .eq("pipeline_stage_id", newStageId)
    .is("deleted_at", null)
    .order("position", { ascending: true })

  if (newErr || !newStageLeads) {
    return { ok: false, message: "Não foi possível carregar o pipeline." }
  }

  let orderedOld = oldStageLeads.map((r) => r.id as string)
  let orderedNew = newStageLeads.map((r) => r.id as string)

  if (fromStageId === newStageId) {
    if (!orderedOld.includes(leadId)) {
      return { ok: false, message: "Lead inconsistente no estágio." }
    }
    orderedOld = orderedOld.filter((id) => id !== leadId)
    const clamped = Math.min(newPosition, orderedOld.length)
    orderedOld.splice(clamped, 0, leadId)
    for (let i = 0; i < orderedOld.length; i += 1) {
      const id = orderedOld[i]
      const patch: { position: number; last_interaction_at?: string } = {
        position: i,
      }
      if (id === leadId) {
        patch.last_interaction_at = new Date().toISOString()
      }
      const { error } = await supabase.from("leads").update(patch).eq("id", id)
      if (error) {
        return {
          ok: false,
          message: error.message ?? "Falha ao reordenar leads.",
        }
      }
    }
  } else {
    orderedOld = orderedOld.filter((id) => id !== leadId)
    orderedNew = orderedNew.filter((id) => id !== leadId)
    const clamped = Math.min(newPosition, orderedNew.length)
    orderedNew.splice(clamped, 0, leadId)

    for (let i = 0; i < orderedOld.length; i += 1) {
      const { error } = await supabase
        .from("leads")
        .update({ position: i })
        .eq("id", orderedOld[i])
      if (error) {
        return {
          ok: false,
          message: error.message ?? "Falha ao atualizar estágio de origem.",
        }
      }
    }

    for (let i = 0; i < orderedNew.length; i += 1) {
      const id = orderedNew[i]
      const row: {
        position: number
        pipeline_stage_id?: string
        last_interaction_at?: string
      } = { position: i }
      if (id === leadId) {
        row.pipeline_stage_id = newStageId
        row.last_interaction_at = new Date().toISOString()
      }
      const { error } = await supabase.from("leads").update(row).eq("id", id)
      if (error) {
        return {
          ok: false,
          message: error.message ?? "Falha ao mover lead.",
        }
      }
    }
  }

  await insertActivity({
    organization_id: organizationId,
    lead_id: leadId,
    user_id: userId,
    type: "lead_moved",
    metadata: {
      from_stage_name: fromMeta?.name ?? fromStageId,
      to_stage_name: toMeta.name,
    },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { id: leadId } }
}

export async function deleteLead(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = deleteLeadSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  if (auth.data.ctx.role !== "admin") {
    return { ok: false, message: "Apenas administradores podem excluir leads." }
  }

  const { supabase, userId, organizationId } = auth.data.ctx
  const leadId = parsed.data.leadId

  const { data: existing, error: loadError } = await supabase
    .from("leads")
    .select("id, organization_id")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle()

  if (loadError || !existing || existing.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  const { error: delError } = await supabase
    .from("leads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", leadId)

  if (delError) {
    return {
      ok: false,
      message: delError.message ?? "Não foi possível excluir o lead.",
    }
  }

  await insertActivity({
    organization_id: organizationId,
    lead_id: leadId,
    user_id: userId,
    type: "lead_deleted",
    metadata: null,
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { id: leadId } }
}

export async function addTagToLead(
  raw: unknown
): Promise<ActionResult<{ leadId: string; tagId: string }>> {
  const parsed = addTagToLeadSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId } = auth.data.ctx
  const { leadId, tagId } = parsed.data

  const { data: tag } = await supabase
    .from("tags")
    .select("id, organization_id, name")
    .eq("id", tagId)
    .maybeSingle()

  if (!tag || tag.organization_id !== organizationId) {
    return { ok: false, message: "Tag inválida." }
  }

  const { error } = await supabase.from("lead_tags").insert({
    lead_id: leadId,
    tag_id: tagId,
  })

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Esta tag já está no lead." }
    }
    return {
      ok: false,
      message: error.message ?? "Não foi possível adicionar a tag.",
    }
  }

  await supabase
    .from("leads")
    .update({ last_interaction_at: new Date().toISOString() })
    .eq("id", leadId)

  await insertActivity({
    organization_id: organizationId,
    lead_id: leadId,
    user_id: userId,
    type: "tag_added",
    metadata: { tag_id: tagId, tag_name: tag.name },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { leadId, tagId } }
}

export async function removeTagFromLead(
  raw: unknown
): Promise<ActionResult<{ leadId: string; tagId: string }>> {
  const parsed = removeTagFromLeadSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId } = auth.data.ctx
  const { leadId, tagId } = parsed.data

  const { error } = await supabase
    .from("lead_tags")
    .delete()
    .eq("lead_id", leadId)
    .eq("tag_id", tagId)

  if (error) {
    return {
      ok: false,
      message: error.message ?? "Não foi possível remover a tag.",
    }
  }

  const { data: tag } = await supabase
    .from("tags")
    .select("name")
    .eq("id", tagId)
    .maybeSingle()

  await supabase
    .from("leads")
    .update({ last_interaction_at: new Date().toISOString() })
    .eq("id", leadId)

  await insertActivity({
    organization_id: organizationId,
    lead_id: leadId,
    user_id: userId,
    type: "tag_removed",
    metadata: { tag_id: tagId, tag_name: tag?.name ?? null },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { leadId, tagId } }
}

export async function createTag(
  raw: unknown
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  const parsed = createTagSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, organizationId } = auth.data.ctx

  const { data: inserted, error } = await supabase
    .from("tags")
    .insert({
      organization_id: organizationId,
      name: parsed.data.name,
      color: parsed.data.color,
    })
    .select("id, name, color")
    .single()

  if (error || !inserted) {
    if (error?.code === "23505") {
      return { ok: false, message: "Já existe uma tag com este nome." }
    }
    return {
      ok: false,
      message: error?.message ?? "Não foi possível criar a tag.",
    }
  }

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return {
    ok: true,
    data: {
      id: inserted.id as string,
      name: inserted.name as string,
      color: inserted.color as string,
    },
  }
}

export async function addLeadNote(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = addLeadNoteSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId, fullName } = auth.data.ctx
  const { leadId, text } = parsed.data

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, organization_id")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle()

  if (leadErr || !lead || lead.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      message:
        "Servidor sem SUPABASE_SERVICE_ROLE_KEY — não é possível registrar a nota.",
    }
  }

  const admin = createAdminClient()
  const { data: inserted, error } = await admin
    .from("activities")
    .insert({
      organization_id: organizationId,
      lead_id: leadId,
      user_id: userId,
      type: "note_added",
      metadata: { text, author_name: fullName },
    })
    .select("id")
    .single()

  if (error || !inserted) {
    return {
      ok: false,
      message: error?.message ?? "Não foi possível salvar a nota.",
    }
  }

  await supabase
    .from("leads")
    .update({ last_interaction_at: new Date().toISOString() })
    .eq("id", leadId)

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { id: inserted.id as string } }
}

export async function listLeadNotes(
  leadId: string
): Promise<ActionResult<import("@/types/lead").LeadNoteView[]>> {
  const idParse = z.string().uuid().safeParse(leadId)
  if (!idParse.success) {
    return { ok: false, message: "Lead inválido." }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, organizationId } = auth.data.ctx

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, organization_id")
    .eq("id", leadId)
    .is("deleted_at", null)
    .maybeSingle()

  if (leadErr || !lead || lead.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  const { data: rows, error } = await supabase
    .from("activities")
    .select("id, metadata, created_at")
    .eq("lead_id", leadId)
    .eq("type", "note_added")
    .order("created_at", { ascending: false })

  if (error || !rows) {
    return {
      ok: false,
      message: error?.message ?? "Não foi possível carregar as notas.",
    }
  }

  type Row = {
    id: string
    metadata: unknown
    created_at: string
  }

  const notes = (rows as Row[]).map((r) => {
    const meta =
      r.metadata && typeof r.metadata === "object" && r.metadata !== null
        ? (r.metadata as Record<string, unknown>)
        : {}
    const text = typeof meta.text === "string" ? meta.text : ""
    const authorFromMeta =
      typeof meta.author_name === "string" ? meta.author_name : null
    return {
      id: r.id,
      text,
      created_at: r.created_at,
      author_name: authorFromMeta,
    }
  })

  return { ok: true, data: notes }
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_ATTACHMENTS_PER_LEAD = 5

export type AttachmentView = {
  id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  uploaded_by: string
  created_at: string
}

export async function uploadAttachment(
  formData: FormData
): Promise<ActionResult<AttachmentView>> {
  const file = formData.get("file")
  const leadId = formData.get("leadId")

  if (!(file instanceof File) || !file.name) {
    return { ok: false, message: "Arquivo inválido." }
  }

  const leadIdParse = z.string().uuid().safeParse(leadId)
  if (!leadIdParse.success) {
    return { ok: false, message: "Lead inválido." }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: "Tipo de arquivo não permitido. Use imagens (JPG, PNG, WebP) ou PDF.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, message: "Arquivo excede o limite de 5 MB." }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId } = auth.data.ctx

  // Verify lead belongs to org
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, organization_id")
    .eq("id", leadIdParse.data)
    .is("deleted_at", null)
    .maybeSingle()

  if (leadErr || !lead || lead.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  // Check attachment count
  const { count, error: countErr } = await supabase
    .from("attachments")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadIdParse.data)

  if (countErr) {
    return { ok: false, message: "Erro ao verificar anexos existentes." }
  }

  if ((count ?? 0) >= MAX_ATTACHMENTS_PER_LEAD) {
    return {
      ok: false,
      message: `Limite de ${MAX_ATTACHMENTS_PER_LEAD} anexos por lead atingido.`,
    }
  }

  // Sanitize file name: timestamp + original name
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const storagePath = `org_${organizationId}/leads/${leadIdParse.data}/${safeName}`

  // Upload to Supabase Storage using admin client (bypasses storage RLS for server actions)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, message: "Servidor sem SUPABASE_SERVICE_ROLE_KEY." }
  }

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadErr } = await admin.storage
    .from("attachments")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadErr) {
    return {
      ok: false,
      message: uploadErr.message ?? "Falha no upload do arquivo.",
    }
  }

  // Create DB record
  const { data: inserted, error: insertErr } = await admin
    .from("attachments")
    .insert({
      organization_id: organizationId,
      lead_id: leadIdParse.data,
      uploaded_by: userId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
    })
    .select("id, file_name, file_type, file_size, storage_path, uploaded_by, created_at")
    .single()

  if (insertErr || !inserted) {
    // Rollback storage
    await admin.storage.from("attachments").remove([storagePath])
    return {
      ok: false,
      message: insertErr?.message ?? "Falha ao registrar o anexo.",
    }
  }

  await insertActivity({
    organization_id: organizationId,
    lead_id: leadIdParse.data,
    user_id: userId,
    type: "attachment_added",
    metadata: { file_name: file.name },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return {
    ok: true,
    data: {
      id: inserted.id as string,
      file_name: inserted.file_name as string,
      file_type: inserted.file_type as string,
      file_size: inserted.file_size as number,
      storage_path: inserted.storage_path as string,
      uploaded_by: inserted.uploaded_by as string,
      created_at: inserted.created_at as string,
    },
  }
}

const deleteAttachmentSchema = z.object({
  attachmentId: z.string().uuid(),
  leadId: z.string().uuid(),
})

export async function deleteAttachment(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = deleteAttachmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, userId, organizationId, role } = auth.data.ctx

  const { data: att, error: attErr } = await supabase
    .from("attachments")
    .select("id, storage_path, uploaded_by, file_name, lead_id, organization_id")
    .eq("id", parsed.data.attachmentId)
    .maybeSingle()

  if (attErr || !att) {
    return { ok: false, message: "Anexo não encontrado." }
  }

  if (att.organization_id !== organizationId) {
    return { ok: false, message: "Anexo não encontrado." }
  }

  if (att.uploaded_by !== userId && role !== "admin") {
    return { ok: false, message: "Apenas quem fez upload ou admin pode remover." }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, message: "Servidor sem SUPABASE_SERVICE_ROLE_KEY." }
  }

  const admin = createAdminClient()

  // Delete from storage
  await admin.storage.from("attachments").remove([att.storage_path as string])

  // Delete DB record
  const { error: delErr } = await admin
    .from("attachments")
    .delete()
    .eq("id", parsed.data.attachmentId)

  if (delErr) {
    return { ok: false, message: delErr.message ?? "Falha ao remover o anexo." }
  }

  await insertActivity({
    organization_id: organizationId,
    lead_id: parsed.data.leadId,
    user_id: userId,
    type: "attachment_removed",
    metadata: { file_name: att.file_name },
  })

  revalidatePath("/pipeline")
  revalidatePath("/leads")

  return { ok: true, data: { id: parsed.data.attachmentId } }
}

export async function getAttachmentSignedUrl(
  attachmentId: string
): Promise<ActionResult<{ url: string }>> {
  const idParse = z.string().uuid().safeParse(attachmentId)
  if (!idParse.success) {
    return { ok: false, message: "ID inválido." }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, organizationId } = auth.data.ctx

  const { data: att, error } = await supabase
    .from("attachments")
    .select("storage_path, organization_id")
    .eq("id", idParse.data)
    .maybeSingle()

  if (error || !att || att.organization_id !== organizationId) {
    return { ok: false, message: "Anexo não encontrado." }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, message: "Servidor sem SUPABASE_SERVICE_ROLE_KEY." }
  }

  const admin = createAdminClient()
  const { data: signed, error: signErr } = await admin.storage
    .from("attachments")
    .createSignedUrl(att.storage_path as string, 60 * 5) // 5 min expiry

  if (signErr || !signed?.signedUrl) {
    return { ok: false, message: "Não foi possível gerar URL de download." }
  }

  return { ok: true, data: { url: signed.signedUrl } }
}

export async function listAttachments(
  leadId: string
): Promise<ActionResult<AttachmentView[]>> {
  const idParse = z.string().uuid().safeParse(leadId)
  if (!idParse.success) {
    return { ok: false, message: "Lead inválido." }
  }

  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  const { supabase, organizationId } = auth.data.ctx

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, organization_id")
    .eq("id", idParse.data)
    .is("deleted_at", null)
    .maybeSingle()

  if (leadErr || !lead || lead.organization_id !== organizationId) {
    return { ok: false, message: "Lead não encontrado." }
  }

  const { data: rows, error } = await supabase
    .from("attachments")
    .select("id, file_name, file_type, file_size, storage_path, uploaded_by, created_at")
    .eq("lead_id", idParse.data)
    .order("created_at", { ascending: false })

  if (error || !rows) {
    return {
      ok: false,
      message: error?.message ?? "Não foi possível carregar os anexos.",
    }
  }

  return {
    ok: true,
    data: rows.map((r) => ({
      id: r.id as string,
      file_name: r.file_name as string,
      file_type: r.file_type as string,
      file_size: r.file_size as number,
      storage_path: r.storage_path as string,
      uploaded_by: r.uploaded_by as string,
      created_at: r.created_at as string,
    })),
  }
}
