"use client"

import { useEffect, useMemo, useState } from "react"

import dynamic from "next/dynamic"

import { useRealtimeLeads } from "@/lib/hooks/use-realtime-leads"
import { useRealtimeUnreadWhatsApp } from "@/lib/hooks/use-realtime-unread-whatsapp"
import type { LeadView, OrgMemberView, TagView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

const LeadDrawer = dynamic(
  () => import("../leads/lead-drawer").then((m) => m.LeadDrawer),
  { ssr: false }
)

const PipelineBoard = dynamic(
  () => import("./pipeline-board").then((m) => m.PipelineBoard),
  { ssr: false }
)
import {
  applyPipelineFilters,
  filtersAreActive,
  PipelineFilters,
  type PipelineFilterState,
} from "./pipeline-filters"

export type PipelineWorkspaceProps = {
  organizationId: string
  userId: string
  isAdmin: boolean
  initialLeads: LeadView[]
  stages: PipelineStageView[]
  tags: TagView[]
  members: OrgMemberView[]
}

export function PipelineWorkspace({
  organizationId,
  userId,
  isAdmin,
  initialLeads,
  stages,
  tags,
  members,
}: PipelineWorkspaceProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [filters, setFilters] = useState<PipelineFilterState>({
    tagIds: [],
    assigneeId: null,
    search: "",
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<LeadView | null>(null)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  useRealtimeLeads(organizationId, setLeads)

  const { unreadLeadIds, clearUnreadForLead } =
    useRealtimeUnreadWhatsApp(organizationId)

  const filtered = useMemo(
    () => applyPipelineFilters(leads, filters, { isAdmin }),
    [leads, filters, isAdmin]
  )

  const dragDisabled = filtersAreActive(filters, isAdmin)

  function openDrawer(lead: LeadView) {
    setSelected(lead)
    setDrawerOpen(true)
  }

  function mergeLead(updated: LeadView) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    setSelected((s) => (s?.id === updated.id ? updated : s))
  }

  function removeLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id))
    setSelected((s) => (s?.id === id ? null : s))
  }

  const hasLeads = leads.length > 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Pipeline</h1>
        <p className="text-sm text-zinc-600">
          {hasLeads
            ? "Arraste os cartões entre colunas. Clique para ver detalhes."
            : "Seu pipeline está vazio. Crie um lead para começar."}
        </p>
      </div>

      {hasLeads ? (
          <PipelineFilters
          tags={tags}
          members={members}
          isAdmin={isAdmin}
          value={filters}
          onChange={setFilters}
        />
      ) : null}

      <PipelineBoard
        stages={stages}
        leads={dragDisabled ? filtered : leads}
        setLeads={setLeads}
        onLeadClick={openDrawer}
        dragDisabled={dragDisabled}
        whatsappUnreadLeadIds={unreadLeadIds}
      />

      {selected ? (
        <LeadDrawer
          lead={selected}
          open={drawerOpen}
          onOpenChange={(v) => {
            setDrawerOpen(v)
            if (!v) setSelected(null)
          }}
          organizationId={organizationId}
          userId={userId}
          onWhatsAppMessagesViewed={clearUnreadForLead}
          stages={stages}
          orgTags={tags}
          members={members}
          isAdmin={isAdmin}
          onLeadUpdated={mergeLead}
          onLeadDeleted={removeLead}
        />
      ) : null}
    </div>
  )
}
