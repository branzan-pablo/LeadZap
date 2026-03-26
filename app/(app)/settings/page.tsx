import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutGrid, MessageCircle, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { OrgNameEditor } from "@/components/settings/org-name-editor"
import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/lib/utils/constants"

const settingsLinks = [
  {
    href: "/settings/team",
    label: "Equipe",
    description: "Gerencie membros e convites da organização",
    icon: Users,
  },
  {
    href: "/settings/pipeline",
    label: "Pipeline",
    description: "Personalize as etapas do seu funil de vendas",
    icon: LayoutGrid,
  },
  {
    href: "/settings/whatsapp",
    label: "WhatsApp",
    description: "Conexão e configuração do WhatsApp",
    icon: MessageCircle,
  },
]

export default async function SettingsPage() {
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

  const { data: org } = await supabase
    .from("organizations")
    .select("name, plan")
    .eq("id", profile.organization_id)
    .single()

  if (!org) redirect("/onboarding")

  const plan = org.plan as keyof typeof PLANS
  const planName = PLANS[plan]?.name ?? org.plan

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Gerencie sua organização e preferências.
      </p>

      <div className="mt-8 max-w-2xl space-y-8">
        {/* Org info */}
        <div className="space-y-4">
          <h2 className="text-base font-medium">Organização</h2>
          <div className="flex items-center gap-3">
            <OrgNameEditor
              initialName={org.name as string}
              isAdmin={profile.role === "admin"}
            />
            <Badge variant="secondary">{planName}</Badge>
          </div>
        </div>

        {/* Navigation cards */}
        <div className="space-y-4">
          <h2 className="text-base font-medium">Configurações</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {settingsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <link.icon className="size-5 text-zinc-500 transition-colors group-hover:text-zinc-700" />
                <span className="text-sm font-medium text-zinc-900">
                  {link.label}
                </span>
                <span className="text-xs text-zinc-500">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
