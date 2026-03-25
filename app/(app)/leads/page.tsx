import { redirect } from "next/navigation"
import { z } from "zod"

import { LeadsWorkspace } from "@/components/leads/leads-workspace"
import { getOrgPipelineData } from "@/lib/data/org-pipeline-data"

const leadIdParamSchema = z.string().uuid()

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>
}) {
  const data = await getOrgPipelineData()
  if (!data) {
    redirect("/onboarding")
  }

  const sp = await searchParams
  const initialOpenLeadId =
    sp.leadId != null && leadIdParamSchema.safeParse(sp.leadId).success
      ? sp.leadId
      : null

  return (
    <LeadsWorkspace
      organizationId={data.organizationId}
      isAdmin={data.isAdmin}
      initialLeads={data.leads}
      stages={data.stages}
      tags={data.tags}
      members={data.members}
      initialOpenLeadId={initialOpenLeadId}
    />
  )
}
