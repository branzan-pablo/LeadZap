import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { toLeadView, type LeadRowDb } from "@/lib/mappers/lead"
import type { LeadView, OrgMemberView, TagView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

export type OrgPipelineData = {
  organizationId: string
  userId: string
  isAdmin: boolean
  stages: PipelineStageView[]
  leads: LeadView[]
  tags: TagView[]
  members: OrgMemberView[]
}

export async function getOrgPipelineData(): Promise<OrgPipelineData | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  const organizationId = profile?.organization_id as string | undefined
  if (!organizationId) {
    return null
  }

  const isAdmin = profile?.role === "admin"

  const { data: stages, error: stErr } = await supabase
    .from("pipeline_stages")
    .select(
      "id, organization_id, name, position, is_default, is_won, is_lost, created_at"
    )
    .eq("organization_id", organizationId)
    .order("position", { ascending: true })

  if (stErr || !stages) {
    throw new Error(stErr?.message ?? "Falha ao carregar estágios")
  }

  const { data: rawLeads, error: ldErr } = await supabase
    .from("leads")
    .select(
      `
      id,
      organization_id,
      assigned_to,
      pipeline_stage_id,
      name,
      phone,
      email,
      company,
      source,
      estimated_value,
      notes,
      position,
      last_interaction_at,
      created_at,
      updated_at,
      lead_tags (
        tags (
          id,
          name,
          color
        )
      )
    `
    )
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("position", { ascending: true })

  if (ldErr) {
    throw new Error(ldErr.message ?? "Falha ao carregar leads")
  }

  const { data: rawTags, error: tgErr } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true })

  if (tgErr || !rawTags) {
    throw new Error(tgErr?.message ?? "Falha ao carregar tags")
  }

  const { data: rawMembers, error: mbErr } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true })

  if (mbErr || !rawMembers) {
    throw new Error(mbErr?.message ?? "Falha ao carregar equipe")
  }

  const leads = (rawLeads ?? []).map((row) =>
    toLeadView(row as unknown as LeadRowDb)
  )

  const tags: TagView[] = rawTags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }))

  const members: OrgMemberView[] = rawMembers.map((m) => ({
    id: m.id,
    full_name: m.full_name,
    email: m.email,
  }))

  return {
    organizationId,
    userId: user.id,
    isAdmin,
    stages: stages as PipelineStageView[],
    leads,
    tags,
    members,
  }
}
