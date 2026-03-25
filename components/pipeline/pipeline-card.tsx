"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatInteractionAgo, formatPhone } from "@/lib/utils/formatters"
import { tagBadgeClassName, tagBadgeStyle } from "@/lib/utils/tag-styles"
import type { LeadView } from "@/types/lead"

export function LeadCardBody({ lead }: { lead: LeadView }) {
  const primaryTag = lead.tags[0]
  const valueLabel =
    lead.estimated_value != null
      ? formatCurrency(lead.estimated_value)
      : "—"

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-zinc-900">{lead.name}</span>
        {primaryTag ? (
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-xs font-medium",
              tagBadgeClassName(primaryTag)
            )}
            style={tagBadgeStyle(primaryTag)}
          >
            {primaryTag.name}
          </Badge>
        ) : null}
      </div>
      <p className="text-xs text-zinc-500">{formatPhone(lead.phone)}</p>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-zinc-700">{valueLabel}</span>
        <span className="text-zinc-400">
          {formatInteractionAgo(lead.last_interaction_at)}
        </span>
      </div>
    </>
  )
}

export type PipelineCardProps = {
  lead: LeadView
  onOpen: (lead: LeadView) => void
}

export function PipelineCard({ lead, onOpen }: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(lead)}
      className={cn(
        "flex w-full flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-zinc-300",
        isDragging && "z-10 cursor-grabbing opacity-90 shadow-lg"
      )}
    >
      <LeadCardBody lead={lead} />
    </button>
  )
}

/** Visual-only clone for `DragOverlay` (no sortable registration). */
export function PipelineCardOverlay({ lead }: { lead: LeadView }) {
  return (
    <div className="flex w-[252px] flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-lg">
      <LeadCardBody lead={lead} />
    </div>
  )
}
