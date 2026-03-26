import Link from "next/link"

import {
  InviteAcceptExisting,
  InviteAcceptSignup,
} from "@/components/auth/invite-accept-form"
import { createAdminClient } from "@/lib/supabase/admin"

type InvitePageProps = {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const admin = createAdminClient()

  // Fetch invite with org name
  const { data: invite, error } = await admin
    .from("invites")
    .select("id, organization_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .single()

  if (error || !invite) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900">
          Convite não encontrado
        </h2>
        <p className="text-sm text-zinc-600">
          Este link de convite é inválido. Verifique com o administrador.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  if (invite.accepted_at) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900">
          Convite já utilizado
        </h2>
        <p className="text-sm text-zinc-600">
          Este convite já foi aceito. Se você já tem uma conta, faça login.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  if (new Date(invite.expires_at as string) < new Date()) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900">
          Convite expirado
        </h2>
        <p className="text-sm text-zinc-600">
          Este convite expirou. Peça um novo ao administrador.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  // Fetch org name for display
  const { data: org } = await admin
    .from("organizations")
    .select("name")
    .eq("id", invite.organization_id)
    .single()

  const orgName = (org?.name as string) ?? "uma organização"
  const inviteEmail = invite.email as string

  // Check if user already exists
  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .eq("email", inviteEmail)
    .maybeSingle()

  if (existingUser) {
    return (
      <InviteAcceptExisting
        token={token}
        email={inviteEmail}
        orgName={orgName}
      />
    )
  }

  return (
    <InviteAcceptSignup
      token={token}
      email={inviteEmail}
      orgName={orgName}
    />
  )
}
