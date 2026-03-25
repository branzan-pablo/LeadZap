import { redirect } from "next/navigation"

import { PipelineWorkspace } from "@/components/pipeline/pipeline-workspace"
import { getOrgPipelineData } from "@/lib/data/org-pipeline-data"

export default async function PipelinePage() {
  const data = await getOrgPipelineData()
  if (!data) {
    redirect("/onboarding")
  }

  return (
    <PipelineWorkspace
      organizationId={data.organizationId}
      isAdmin={data.isAdmin}
      initialLeads={data.leads}
      stages={data.stages}
      tags={data.tags}
      members={data.members}
    />
  )
}
