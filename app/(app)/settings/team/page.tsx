import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { InviteForm } from "@/components/settings/invite-form"
import { TeamMembers } from "@/components/settings/team-members"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { InviteView, MemberView } from "@/types/settings"

export default async function SettingsTeamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) redirect("/onboarding")
  if (profile.role !== "admin") redirect("/pipeline")

  const admin = createAdminClient()

  // Fetch org info
  const { data: org } = await admin
    .from("organizations")
    .select("max_users")
    .eq("id", profile.organization_id)
    .single()

  // Fetch members
  const { data: membersRaw } = await admin
    .from("users")
    .select("id, full_name, email, role, avatar_url, created_at")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: true })

  const members: MemberView[] = (membersRaw ?? []).map((m) => ({
    id: m.id as string,
    full_name: m.full_name as string,
    email: m.email as string,
    role: m.role === "admin" ? "admin" : "user",
    avatar_url: (m.avatar_url as string | null) ?? null,
    created_at: m.created_at as string,
  }))

  // Fetch pending invites
  const { data: invitesRaw } = await admin
    .from("invites")
    .select("id, email, role, token, created_at, expires_at")
    .eq("organization_id", profile.organization_id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })

  const invites: InviteView[] = (invitesRaw ?? []).map((i) => ({
    id: i.id as string,
    email: i.email as string,
    role: i.role === "admin" ? "admin" : "user",
    token: i.token as string,
    created_at: i.created_at as string,
    expires_at: i.expires_at as string,
  }))

  const maxUsers = (org?.max_users as number) ?? 1
  const totalSlots = members.length + invites.length

  return (
    <div className="p-6">
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="size-3.5" />
        Configurações
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie membros e convites da sua organização.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {members.length}/{maxUsers} membros
        </Badge>
      </div>

      <div className="mt-8 max-w-3xl space-y-10">
        {/* Invite section */}
        <InviteForm
          pendingInvites={invites}
          maxUsers={maxUsers}
          currentMemberCount={members.length}
          pendingInviteCount={invites.length}
        />

        {/* Members table */}
        <TeamMembers
          members={members}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
