import { redirect } from "next/navigation"

import { LeadsWorkspace } from "@/components/leads/leads-workspace"
import { getOrgPipelineData } from "@/lib/data/org-pipeline-data"

export default async function LeadsPage() {
  const data = await getOrgPipelineData()
  if (!data) {
    redirect("/onboarding")
  }

  return (
    <LeadsWorkspace
      organizationId={data.organizationId}
      isAdmin={data.isAdmin}
      initialLeads={data.leads}
      stages={data.stages}
      tags={data.tags}
      members={data.members}
    />
  )
}
