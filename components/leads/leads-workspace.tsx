"use client"

import type { ReactNode } from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useRealtimeLeads } from "@/lib/hooks/use-realtime-leads"
import { useRealtimeUnreadWhatsApp } from "@/lib/hooks/use-realtime-unread-whatsapp"
import { formatCurrency, formatInteractionAgo, formatPhone } from "@/lib/utils/formatters"
import { tagBadgeClassName, tagBadgeStyle } from "@/lib/utils/tag-styles"
import { cn } from "@/lib/utils"
import type { LeadView, OrgMemberView, TagView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { LeadDrawer } from "./lead-drawer"
import {
  applyPipelineFilters,
  PipelineFilters,
  type PipelineFilterState,
} from "../pipeline/pipeline-filters"

type SortKey =
  | "name"
  | "phone"
  | "stage"
  | "assignee"
  | "value"
  | "interaction"

export type LeadsWorkspaceProps = {
  organizationId: string
  userId: string
  isAdmin: boolean
  initialLeads: LeadView[]
  stages: PipelineStageView[]
  tags: TagView[]
  members: OrgMemberView[]
  /** Abre o drawer deste lead (ex.: push notification /leads?leadId=). */
  initialOpenLeadId?: string | null
}

export function LeadsWorkspace({
  organizationId,
  userId,
  isAdmin,
  initialLeads,
  stages,
  tags,
  members,
  initialOpenLeadId = null,
}: LeadsWorkspaceProps) {
  const router = useRouter()
  const deepLinkHandled = useRef(false)
  const [leads, setLeads] = useState(initialLeads)
  const [filters, setFilters] = useState<PipelineFilterState>({
    tagIds: [],
    assigneeId: null,
    search: "",
  })
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<LeadView | null>(null)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  useEffect(() => {
    if (!initialOpenLeadId || deepLinkHandled.current) return
    const found = leads.find((l) => l.id === initialOpenLeadId)
    if (found) {
      setSelected(found)
      setDrawerOpen(true)
    }
    deepLinkHandled.current = true
    router.replace("/leads", { scroll: false })
  }, [initialOpenLeadId, leads, router])

  useRealtimeLeads(organizationId, setLeads)

  const { unreadLeadIds, clearUnreadForLead } =
    useRealtimeUnreadWhatsApp(organizationId)

  const assigneeName = useMemo(() => {
    const m = new Map(members.map((x) => [x.id, x.full_name]))
    return (id: string | null) =>
      id ? (m.get(id) ?? "—") : "—"
  }, [members])

  const stageName = useMemo(() => {
    const m = new Map(stages.map((s) => [s.id, s.name]))
    return (id: string) => m.get(id) ?? "—"
  }, [stages])

  const filtered = useMemo(
    () => applyPipelineFilters(leads, filters, { isAdmin }),
    [leads, filters, isAdmin]
  )

  const sorted = useMemo(() => {
    const list = [...filtered]
    const dir = sortDir === "asc" ? 1 : -1
    list.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name, "pt-BR")
          break
        case "phone":
          cmp = a.phone.localeCompare(b.phone)
          break
        case "stage":
          cmp = stageName(a.pipeline_stage_id).localeCompare(
            stageName(b.pipeline_stage_id),
            "pt-BR"
          )
          break
        case "assignee":
          cmp = assigneeName(a.assigned_to).localeCompare(
            assigneeName(b.assigned_to),
            "pt-BR"
          )
          break
        case "value":
          cmp = (a.estimated_value ?? 0) - (b.estimated_value ?? 0)
          break
        case "interaction": {
          const ta = a.last_interaction_at
            ? new Date(a.last_interaction_at).getTime()
            : 0
          const tb = b.last_interaction_at
            ? new Date(b.last_interaction_at).getTime()
            : 0
          cmp = ta - tb
          break
        }
        default:
          break
      }
      return cmp * dir
    })
    return list
  }, [filtered, sortKey, sortDir, stageName, assigneeName])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function SortButton({
    col,
    children,
  }: {
    col: SortKey
    children: ReactNode
  }) {
    const active = sortKey === col
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 font-medium hover:text-zinc-900"
        onClick={() => toggleSort(col)}
      >
        {children}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : null}
      </button>
    )
  }

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Leads</h1>
        <p className="text-sm text-zinc-600">
          Visão em tabela. Clique na linha para abrir detalhes.
        </p>
      </div>

      <PipelineFilters
        tags={tags}
        members={members}
        isAdmin={isAdmin}
        value={filters}
        onChange={setFilters}
      />

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>
                <SortButton col="name">Nome</SortButton>
              </TableHead>
              <TableHead>
                <SortButton col="phone">Telefone</SortButton>
              </TableHead>
              <TableHead>
                <SortButton col="stage">Estágio</SortButton>
              </TableHead>
              <TableHead>
                <SortButton col="assignee">Responsável</SortButton>
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>
                <SortButton col="value">Valor</SortButton>
              </TableHead>
              <TableHead>
                <SortButton col="interaction">Última interação</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-zinc-500">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer"
                  onClick={() => openDrawer(lead)}
                >
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {unreadLeadIds.has(lead.id) ? (
                        <span
                          className="size-2 shrink-0 rounded-full bg-sky-500"
                          title="Nova mensagem no WhatsApp"
                          aria-hidden
                        />
                      ) : null}
                      {lead.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {formatPhone(lead.phone)}
                  </TableCell>
                  <TableCell className="text-zinc-700">
                    {stageName(lead.pipeline_stage_id)}
                  </TableCell>
                  <TableCell className="text-zinc-600">
                    {assigneeName(lead.assigned_to)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lead.tags.slice(0, 3).map((t) => (
                        <Badge
                          key={t.id}
                          variant="outline"
                          className={cn(
                            "text-[0.65rem] font-medium",
                            tagBadgeClassName(t)
                          )}
                          style={tagBadgeStyle(t)}
                        >
                          {t.name}
                        </Badge>
                      ))}
                      {lead.tags.length > 3 ? (
                        <span className="text-xs text-zinc-400">
                          +{lead.tags.length - 3}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-zinc-800">
                    {lead.estimated_value != null
                      ? formatCurrency(lead.estimated_value)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {formatInteractionAgo(lead.last_interaction_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
