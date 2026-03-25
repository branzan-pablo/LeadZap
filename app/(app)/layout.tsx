import { redirect } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select(
      "full_name, email, avatar_url, role, organization_id, onboarding_completed"
    )
    .eq("id", user.id)
    .single()

  const organizationId =
    (profile?.organization_id as string | null | undefined) ?? null

  const role = profile?.role === "admin" ? "admin" : "user"
  const fullName = profile?.full_name ?? user.email ?? "Usuário"
  const email = profile?.email ?? user.email ?? ""

  return (
    <AppShell
      userId={user.id}
      email={email}
      fullName={fullName}
      avatarUrl={profile?.avatar_url ?? null}
      organizationId={organizationId}
      role={role}
    >
      {children}
    </AppShell>
  )
}
