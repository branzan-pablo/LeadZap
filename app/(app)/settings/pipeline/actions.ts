"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext, type ActionResult } from "@/lib/auth/require-context"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  addStageSchema,
  deleteStageSchema,
  reorderStagesSchema,
  updateStageNameSchema,
} from "@/lib/validations/settings"

function revalidatePipeline() {
  revalidatePath("/settings/pipeline")
  revalidatePath("/pipeline")
}

// ── updateStageName ───────────────────────────────────

export async function updateStageName(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = updateStageNameSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  const { error } = await admin
    .from("pipeline_stages")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.stageId)
    .eq("organization_id", ctx.organizationId)

  if (error) {
    return { ok: false, message: "Erro ao renomear etapa." }
  }

  revalidatePipeline()
  return { ok: true, data: null }
}

// ── addStage ──────────────────────────────────────────

export async function addStage(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = addStageSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  // Count existing stages
  const { count } = await admin
    .from("pipeline_stages")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", ctx.organizationId)

  if ((count ?? 0) >= 7) {
    return { ok: false, message: "Limite de 7 etapas atingido." }
  }

  // Get max position
  const { data: maxRow } = await admin
    .from("pipeline_stages")
    .select("position")
    .eq("organization_id", ctx.organizationId)
    .order("position", { ascending: false })
    .limit(1)
    .single()

  const nextPosition = maxRow ? (maxRow.position as number) + 1 : 0

  const { data: stage, error } = await admin
    .from("pipeline_stages")
    .insert({
      organization_id: ctx.organizationId,
      name: parsed.data.name,
      position: nextPosition,
      is_default: false,
      is_won: false,
      is_lost: false,
    })
    .select("id")
    .single()

  if (error || !stage) {
    return { ok: false, message: "Erro ao adicionar etapa." }
  }

  revalidatePipeline()
  return { ok: true, data: { id: stage.id } }
}

// ── reorderStages ─────────────────────────────────────

export async function reorderStages(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = reorderStagesSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  // Verify all stages belong to this org
  const { data: stages } = await admin
    .from("pipeline_stages")
    .select("id")
    .eq("organization_id", ctx.organizationId)

  const orgStageIds = new Set((stages ?? []).map((s) => s.id as string))
  for (const id of parsed.data.stageIds) {
    if (!orgStageIds.has(id)) {
      return { ok: false, message: "Etapa não encontrada." }
    }
  }

  // Update positions — use offset to avoid unique constraint conflicts
  // First set all to high values, then set final positions
  for (let i = 0; i < parsed.data.stageIds.length; i++) {
    await admin
      .from("pipeline_stages")
      .update({ position: 1000 + i })
      .eq("id", parsed.data.stageIds[i])
  }

  for (let i = 0; i < parsed.data.stageIds.length; i++) {
    await admin
      .from("pipeline_stages")
      .update({ position: i })
      .eq("id", parsed.data.stageIds[i])
  }

  revalidatePipeline()
  return { ok: true, data: null }
}

// ── deleteStage ───────────────────────────────────────

export async function deleteStage(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = deleteStageSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  // Verify the stage exists, belongs to org, and is not default
  const { data: stage } = await admin
    .from("pipeline_stages")
    .select("id, is_default")
    .eq("id", parsed.data.stageId)
    .eq("organization_id", ctx.organizationId)
    .single()

  if (!stage) {
    return { ok: false, message: "Etapa não encontrada." }
  }

  if (stage.is_default) {
    return { ok: false, message: "Etapas padrão não podem ser deletadas." }
  }

  // Check if any leads are in this stage
  const { count: leadCount } = await admin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("pipeline_stage_id", parsed.data.stageId)
    .is("deleted_at", null)

  if ((leadCount ?? 0) > 0) {
    return {
      ok: false,
      message: "Esta etapa possui leads. Mova-os antes de deletar.",
    }
  }

  const { error } = await admin
    .from("pipeline_stages")
    .delete()
    .eq("id", parsed.data.stageId)

  if (error) {
    return { ok: false, message: "Erro ao deletar etapa." }
  }

  revalidatePipeline()
  return { ok: true, data: null }
}
