"use client"

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { toast } from "sonner"

import { moveLead } from "@/app/(app)/pipeline/actions"
import type { LeadView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { PipelineCardOverlay } from "./pipeline-card"
import { PipelineColumn } from "./pipeline-column"
import { PipelineColumnStatic } from "./pipeline-column-static"

export type PipelineBoardProps = {
  stages: PipelineStageView[]
  leads: LeadView[]
  setLeads: Dispatch<SetStateAction<LeadView[]>>
  onLeadClick: (lead: LeadView) => void
  /** Drag-and-drop off while filters are active (positions must match full server ordering). */
  dragDisabled?: boolean
  whatsappUnreadLeadIds?: ReadonlySet<string>
}

function groupByStage(
  stages: PipelineStageView[],
  leadList: LeadView[]
): Record<string, LeadView[]> {
  const map: Record<string, LeadView[]> = {}
  for (const s of stages) map[s.id] = []
  for (const l of leadList) {
    if (map[l.pipeline_stage_id]) map[l.pipeline_stage_id].push(l)
  }
  for (const s of stages) {
    map[s.id].sort((a, b) => a.position - b.position)
  }
  return map
}

function flattenFromGroups(
  stages: PipelineStageView[],
  map: Record<string, LeadView[]>
): LeadView[] {
  const out: LeadView[] = []
  for (const s of stages) {
    const list = map[s.id] ?? []
    list.forEach((l, index) => {
      out.push({
        ...l,
        pipeline_stage_id: s.id,
        position: index,
      })
    })
  }
  return out
}

export function PipelineBoard({
  stages,
  leads,
  setLeads,
  onLeadClick,
  dragDisabled = false,
  whatsappUnreadLeadIds,
}: PipelineBoardProps) {
  const [active, setActive] = useState<LeadView | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 6 },
    })
  )

  const grouped = useMemo(
    () => groupByStage(stages, leads),
    [stages, leads]
  )

  const findStageOfLead = useCallback(
    (leadId: string) => {
      for (const s of stages) {
        if (grouped[s.id]?.some((l) => l.id === leadId)) return s.id
      }
      return null
    },
    [stages, grouped]
  )

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id)
    const lead = leads.find((l) => l.id === id) ?? null
    setActive(lead)
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    setActive(null)
    const { active, over } = e
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const sourceCol = findStageOfLead(activeId)
    let destCol: string | null = null
    if (overId.startsWith("stage:")) {
      destCol = overId.slice("stage:".length)
    } else {
      destCol = findStageOfLead(overId)
    }
    if (!sourceCol || !destCol) return

    const map = groupByStage(stages, leads)
    const snapshot = leads

    let nextMap: Record<string, LeadView[]>
    let newPosition = 0
    const newStageId = destCol

    if (sourceCol === destCol) {
      const list = [...(map[sourceCol] ?? [])]
      const oldIndex = list.findIndex((l) => l.id === activeId)
      if (oldIndex === -1) return

      let newIndex: number
      if (overId.startsWith("stage:")) {
        newIndex = Math.max(0, list.length - 1)
      } else {
        newIndex = list.findIndex((l) => l.id === overId)
        if (newIndex === -1) newIndex = list.length - 1
      }

      const reordered = arrayMove(list, oldIndex, newIndex)
      nextMap = { ...map, [sourceCol]: reordered }
      newPosition = reordered.findIndex((l) => l.id === activeId)
    } else {
      const sourceList = [...(map[sourceCol] ?? [])].filter(
        (l) => l.id !== activeId
      )
      const moved = map[sourceCol]?.find((l) => l.id === activeId)
      if (!moved) return

      const destList = [...(map[destCol] ?? [])]
      let toIndex: number
      if (overId.startsWith("stage:")) {
        toIndex = destList.length
      } else {
        toIndex = destList.findIndex((l) => l.id === overId)
        if (toIndex === -1) toIndex = destList.length
      }

      destList.splice(toIndex, 0, {
        ...moved,
        pipeline_stage_id: destCol,
      })

      nextMap = { ...map, [sourceCol]: sourceList, [destCol]: destList }
      newPosition = destList.findIndex((l) => l.id === activeId)
    }

    const next = flattenFromGroups(stages, nextMap)
    setLeads(next)

    const res = await moveLead({
      leadId: activeId,
      newStageId,
      newPosition,
    })

    if (!res.ok) {
      setLeads(snapshot)
      toast.error(res.message)
    }
  }

  const columns = dragDisabled ? (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <PipelineColumnStatic
          key={stage.id}
          stage={stage}
          leads={grouped[stage.id] ?? []}
          onLeadClick={onLeadClick}
          whatsappUnreadLeadIds={whatsappUnreadLeadIds}
        />
      ))}
    </div>
  ) : (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <PipelineColumn
          key={stage.id}
          stage={stage}
          leads={grouped[stage.id] ?? []}
          onLeadClick={onLeadClick}
          whatsappUnreadLeadIds={whatsappUnreadLeadIds}
        />
      ))}
    </div>
  )

  if (dragDisabled) {
    return (
      <div>
        <p className="mb-3 text-xs text-zinc-500">
          Com filtros ativos, arrastar cartões está desligado para manter o
          alinhamento com o servidor.
        </p>
        {columns}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={(ev) => void handleDragEnd(ev)}
    >
      {columns}
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="pointer-events-none rotate-1 opacity-95">
            <PipelineCardOverlay lead={active} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
