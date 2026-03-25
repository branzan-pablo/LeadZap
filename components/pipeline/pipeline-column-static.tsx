"use client"

import { formatCurrency } from "@/lib/utils/formatters"
import type { LeadView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { LeadCardBody } from "./pipeline-card"

export type PipelineColumnStaticProps = {
  stage: PipelineStageView
  leads: LeadView[]
  onLeadClick: (lead: LeadView) => void
  whatsappUnreadLeadIds?: ReadonlySet<string>
}

export function PipelineColumnStatic({
  stage,
  leads,
  onLeadClick,
  whatsappUnreadLeadIds,
}: PipelineColumnStaticProps) {
  const sum = leads.reduce(
    (acc, l) => acc + (l.estimated_value ?? 0),
    0
  )
  const dense = leads.length >= 50

  return (
    <div
      className="flex w-[280px] shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50"
      style={{ minHeight: "calc(100vh - 8rem)" }}
    >
      <div className="border-b border-zinc-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-900">{stage.name}</h2>
          <span className="text-xs font-medium text-zinc-500">
            {leads.length}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-zinc-600">
          {formatCurrency(sum)}
        </p>
      </div>
      <div
        className={
          dense
            ? "flex max-h-[calc(100vh-12rem)] flex-1 flex-col gap-2 overflow-y-auto p-2"
            : "flex flex-1 flex-col gap-2 p-2"
        }
      >
        {leads.length === 0 ? (
          <div className="min-h-24 rounded-md border border-dashed border-zinc-200 bg-white/50" />
        ) : null}
        {leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            onClick={() => onLeadClick(lead)}
            className="flex w-full flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-zinc-300"
          >
            <LeadCardBody
              lead={lead}
              hasUnreadWhatsApp={whatsappUnreadLeadIds?.has(lead.id)}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
