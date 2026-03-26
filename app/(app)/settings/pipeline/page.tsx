import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PipelineConfig } from "@/components/settings/pipeline-config"
import { createClient } from "@/lib/supabase/server"
import type { PipelineStageView } from "@/types/pipeline"

export default async function SettingsPipelinePage() {
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

  const { data: stagesRaw } = await supabase
    .from("pipeline_stages")
    .select("id, organization_id, name, position, is_default, is_won, is_lost, created_at")
    .eq("organization_id", profile.organization_id)
    .order("position", { ascending: true })

  const stages: PipelineStageView[] = (stagesRaw ?? []).map((s) => ({
    id: s.id as string,
    organization_id: s.organization_id as string,
    name: s.name as string,
    position: s.position as number,
    is_default: s.is_default as boolean,
    is_won: s.is_won as boolean,
    is_lost: s.is_lost as boolean,
    created_at: s.created_at as string,
  }))

  return (
    <div className="p-6">
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="size-3.5" />
        Configurações
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Personalize as etapas do seu funil de vendas. Arraste para reordenar.
      </p>

      <div className="mt-6 max-w-xl">
        <PipelineConfig stages={stages} />
      </div>
    </div>
  )
}
