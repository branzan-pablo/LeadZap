"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  acceptInviteLoginSchema,
  acceptInviteSignupSchema,
} from "@/lib/validations/settings"

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

type InviteRow = {
  id: string
  organization_id: string
  email: string
  role: string
  expires_at: string
  accepted_at: string | null
}

async function fetchAndValidateInvite(
  token: string
): Promise<ActionResult<{ invite: InviteRow }>> {
  const admin = createAdminClient()

  const { data: invite, error } = await admin
    .from("invites")
    .select("id, organization_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .single()

  if (error || !invite) {
    return { ok: false, message: "Convite não encontrado." }
  }

  const inv = invite as InviteRow

  if (inv.accepted_at) {
    return { ok: false, message: "Este convite já foi utilizado." }
  }

  if (new Date(inv.expires_at) < new Date()) {
    return {
      ok: false,
      message: "Este convite expirou. Peça um novo ao administrador.",
    }
  }

  return { ok: true, data: { invite: inv } }
}

// ── Accept invite — new user (signup) ─────────────────

export async function acceptInviteNewUser(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = acceptInviteSignupSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    }
  }

  const inviteResult = await fetchAndValidateInvite(parsed.data.token)
  if (!inviteResult.ok) return inviteResult

  const { invite } = inviteResult.data
  const admin = createAdminClient()

  // Create auth user via server client (sets session cookies)
  const supabase = await createClient()
  const { error: signUpError } = await supabase.auth.signUp({
    email: invite.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/confirm`,
    },
  })

  if (signUpError) {
    return {
      ok: false,
      message: signUpError.message.includes("already")
        ? "Este email já possui uma conta. Use a opção de login."
        : `Erro ao criar conta: ${signUpError.message}`,
    }
  }

  // The DB trigger handle_new_user() creates the users row.
  // Now update the user profile with org and role via admin client.
  // We need to wait briefly for the trigger to fire, then update.
  const { data: newUser } = await admin
    .from("users")
    .select("id")
    .eq("email", invite.email)
    .single()

  if (newUser) {
    await admin
      .from("users")
      .update({
        organization_id: invite.organization_id,
        role: invite.role,
        onboarding_completed: true,
      })
      .eq("id", newUser.id)
  }

  // Mark invite as accepted
  await admin
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id)

  // Sign in to set session
  await supabase.auth.signInWithPassword({
    email: invite.email,
    password: parsed.data.password,
  })

  return { ok: true, data: null }
}

// ── Accept invite — existing user (login) ─────────────

export async function acceptInviteExistingUser(
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = acceptInviteLoginSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    }
  }

  const inviteResult = await fetchAndValidateInvite(parsed.data.token)
  if (!inviteResult.ok) return inviteResult

  const { invite } = inviteResult.data

  // Verify the email matches
  if (parsed.data.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      ok: false,
      message: "O email informado não corresponde ao convite.",
    }
  }

  // Sign in to verify credentials
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (signInError) {
    return { ok: false, message: "Email ou senha incorretos." }
  }

  const admin = createAdminClient()

  // Update user profile with new org and role
  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .eq("email", invite.email)
    .single()

  if (existingUser) {
    await admin
      .from("users")
      .update({
        organization_id: invite.organization_id,
        role: invite.role,
        onboarding_completed: true,
      })
      .eq("id", existingUser.id)
  }

  // Mark invite as accepted
  await admin
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id)

  return { ok: true, data: null }
}
