"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  inviteMemberSchema,
  removeMemberSchema,
  revokeInviteSchema,
  updateOrgNameSchema,
} from "@/lib/validations/settings"

// ── Shared types ──────────────────────────────────────

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  organizationId: string
  role: "admin" | "user"
  fullName: string
}

async function requireAdminContext(): Promise<
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

  if (profile.role !== "admin") {
    return { ok: false, message: "Apenas administradores podem fazer isso." }
  }

  return {
    ok: true,
    data: {
      ctx: {
        supabase,
        userId: user.id,
        organizationId: profile.organization_id as string,
        role: "admin",
        fullName: (profile.full_name as string) ?? "Usuário",
      },
    },
  }
}

// ── inviteMember ──────────────────────────────────────

export async function inviteMember(
  raw: unknown
): Promise<ActionResult<{ inviteId: string; token: string }>> {
  const parsed = inviteMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  // Check if email already belongs to a member in this org
  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .eq("organization_id", ctx.organizationId)
    .eq("email", parsed.data.email)
    .maybeSingle()

  if (existingUser) {
    return { ok: false, message: "Este email já pertence a um membro da organização." }
  }

  // Check if there's already a pending invite for this email in this org
  const { data: existingInvite } = await admin
    .from("invites")
    .select("id")
    .eq("organization_id", ctx.organizationId)
    .eq("email", parsed.data.email)
    .is("accepted_at", null)
    .maybeSingle()

  if (existingInvite) {
    return { ok: false, message: "Já existe um convite pendente para este email." }
  }

  // Count current members + pending invites vs plan limit
  const { data: org } = await admin
    .from("organizations")
    .select("max_users")
    .eq("id", ctx.organizationId)
    .single()

  if (!org) {
    return { ok: false, message: "Organização não encontrada." }
  }

  const { count: memberCount } = await admin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", ctx.organizationId)

  const { count: pendingCount } = await admin
    .from("invites")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", ctx.organizationId)
    .is("accepted_at", null)

  const totalSlots = (memberCount ?? 0) + (pendingCount ?? 0)
  if (totalSlots >= (org.max_users as number)) {
    return {
      ok: false,
      message: `Limite de ${org.max_users} usuários atingido. Faça upgrade do plano para convidar mais membros.`,
    }
  }

  // Insert invite
  const { data: invite, error: insertError } = await admin
    .from("invites")
    .insert({
      organization_id: ctx.organizationId,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: ctx.userId,
    })
    .select("id, token")
    .single()

  if (insertError || !invite) {
    return { ok: false, message: "Erro ao criar convite. Tente novamente." }
  }

  revalidatePath("/settings/team")

  return {
    ok: true,
    data: {
      inviteId: invite.id as string,
      token: invite.token as string,
    },
  }
}

// ── revokeInvite ──────────────────────────────────────

export async function revokeInvite(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = revokeInviteSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  const { error } = await admin
    .from("invites")
    .delete()
    .eq("id", parsed.data.inviteId)
    .eq("organization_id", ctx.organizationId)
    .is("accepted_at", null)

  if (error) {
    return { ok: false, message: "Erro ao revogar convite." }
  }

  revalidatePath("/settings/team")
  return { ok: true, data: null }
}

// ── removeMember ──────────────────────────────────────

export async function removeMember(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = removeMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data

  if (parsed.data.userId === ctx.userId) {
    return { ok: false, message: "Você não pode remover a si mesmo da organização." }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from("users")
    .update({ organization_id: null, role: "user" })
    .eq("id", parsed.data.userId)
    .eq("organization_id", ctx.organizationId)

  if (error) {
    return { ok: false, message: "Erro ao remover membro." }
  }

  revalidatePath("/settings/team")
  return { ok: true, data: null }
}

// ── updateOrgName ─────────────────────────────────────

export async function updateOrgName(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = updateOrgNameSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const auth = await requireAdminContext()
  if (!auth.ok) return auth

  const { ctx } = auth.data
  const admin = createAdminClient()

  const { error } = await admin
    .from("organizations")
    .update({ name: parsed.data.name })
    .eq("id", ctx.organizationId)

  if (error) {
    return { ok: false, message: "Erro ao atualizar nome da organização." }
  }

  revalidatePath("/settings")
  return { ok: true, data: null }
}
