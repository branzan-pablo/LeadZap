"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/formatters"
import type { LeadView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { PipelineCard } from "./pipeline-card"

export type PipelineColumnProps = {
  stage: PipelineStageView
  leads: LeadView[]
  onLeadClick: (lead: LeadView) => void
  whatsappUnreadLeadIds?: ReadonlySet<string>
}

export function PipelineColumn({
  stage,
  leads,
  onLeadClick,
  whatsappUnreadLeadIds,
}: PipelineColumnProps) {
  const droppableId = `stage:${stage.id}`
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: "column", stageId: stage.id },
  })

  const ids = leads.map((l) => l.id)
  const sum = leads.reduce(
    (acc, l) => acc + (l.estimated_value ?? 0),
    0
  )
  const dense = leads.length >= 50

  const header = (
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
  )

  const listClass = cn(
    "flex flex-1 flex-col gap-2 p-2",
    dense && "max-h-[calc(100vh-12rem)] overflow-y-auto"
  )

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50",
        isOver && "ring-2 ring-zinc-300 ring-offset-2"
      )}
      style={{ minHeight: "calc(100vh - 8rem)" }}
    >
      {header}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={listClass}>
          {leads.length === 0 ? (
            <div className="min-h-24 rounded-md border border-dashed border-zinc-200 bg-white/50" />
          ) : null}
          {leads.map((lead) => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              onOpen={onLeadClick}
              hasUnreadWhatsApp={whatsappUnreadLeadIds?.has(lead.id)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
