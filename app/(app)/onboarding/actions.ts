"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  firstLeadPlaceholderSchema,
  organizationNameSchema,
} from "@/lib/validations/onboarding"
import { slugify } from "@/lib/utils/slug"
import { toUserFacingError } from "@/lib/utils/server-error"

export type CreateOrganizationSuccess = {
  ok: true
  organization: { id: string; name: string; slug: string }
}

export type ActionError = {
  ok: false
  message: string
}

export type CreateOrganizationResult =
  | CreateOrganizationSuccess
  | ActionError

export type CompleteOnboardingResult =
  | { ok: true }
  | ActionError

export type CreateLeadPlaceholderResult =
  | { ok: true }
  | ActionError

async function uniqueSlug(admin: ReturnType<typeof createAdminClient>, base: string) {
  let candidate = base
  for (let i = 0; i < 12; i += 1) {
    const { data: existing } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle()

    if (!existing) {
      return candidate
    }

    const suffix = crypto.randomUUID().slice(0, 8)
    candidate = `${base}-${suffix}`
  }

  return `${base}-${crypto.randomUUID()}`
}

export async function createOrganization(
  rawName: unknown
): Promise<CreateOrganizationResult> {
  const parsed = organizationNameSchema.safeParse(rawName)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  const name = parsed.data
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { ok: false, message: toUserFacingError({ profileError, userId: user.id }, "Não foi possível carregar seu perfil.") }
  }

  if (profile.organization_id) {
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("id, name, slug")
      .eq("id", profile.organization_id)
      .single()

    if (orgError || !org) {
      return { ok: false, message: "Organização não encontrada." }
    }

    return {
      ok: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      message:
        "Configuração do servidor incompleta (SUPABASE_SERVICE_ROLE_KEY).",
    }
  }

  const baseSlug = slugify(name)
  const slug = await uniqueSlug(admin, baseSlug)

  const { data: inserted, error: insertError } = await admin
    .from("organizations")
    .insert({
      name,
      slug,
      plan: "starter",
      max_users: 1,
      onboarding_completed: false,
    })
    .select("id, name, slug")
    .single()

  if (insertError || !inserted) {
    return { ok: false, message: toUserFacingError(insertError, "Não foi possível criar a organização.") }
  }

  const { error: updateError } = await admin
    .from("users")
    .update({
      organization_id: inserted.id,
      role: "admin",
    })
    .eq("id", user.id)

  if (updateError) {
    // Compensating delete — avoid orphaned organization row with no admin user
    await admin.from("organizations").delete().eq("id", inserted.id)
    console.error("[createOrganization] user update failed, org rolled back:", updateError)
    return { ok: false, message: "Não foi possível vincular sua conta." }
  }

  return {
    ok: true,
    organization: {
      id: inserted.id,
      name: inserted.name,
      slug: inserted.slug,
    },
  }
}

export async function completeOnboarding(): Promise<CompleteOnboardingResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { error } = await supabase
    .from("users")
    .update({ onboarding_completed: true })
    .eq("id", user.id)

  if (error) {
    return {
      ok: false,
      message: error.message ?? "Não foi possível concluir o onboarding.",
    }
  }

  return { ok: true }
}

export async function createLeadPlaceholder(
  raw: unknown
): Promise<CreateLeadPlaceholderResult> {
  const parsed = firstLeadPlaceholderSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos"
    return { ok: false, message: msg }
  }

  return { ok: true }
}
