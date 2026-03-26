"use client"

import { useRef, useState, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  addStage,
  deleteStage,
  reorderStages,
  updateStageName,
} from "@/app/(app)/settings/pipeline/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { PipelineStageView } from "@/types/pipeline"

type PipelineConfigProps = {
  stages: PipelineStageView[]
}

export function PipelineConfig({ stages: initialStages }: PipelineConfigProps) {
  const [stages, setStages] = useState(initialStages)
  const [addOpen, setAddOpen] = useState(false)
  const [reordering, startReorder] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stages.findIndex((s) => s.id === active.id)
    const newIndex = stages.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(stages, oldIndex, newIndex)
    setStages(reordered)

    startReorder(async () => {
      const result = await reorderStages({
        stageIds: reordered.map((s) => s.id),
      })
      if (!result.ok) {
        toast.error(result.message)
        setStages(initialStages)
      }
    })
  }

  function handleStageAdded(newStage: PipelineStageView) {
    setStages((prev) => [...prev, newStage])
  }

  function handleStageDeleted(stageId: string) {
    setStages((prev) => prev.filter((s) => s.id !== stageId))
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {stages.map((stage) => (
              <SortableStageRow
                key={stage.id}
                stage={stage}
                onDeleted={handleStageDeleted}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {reordering ? (
        <p className="text-xs text-zinc-400">Salvando ordem…</p>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setAddOpen(true)}
        disabled={stages.length >= 7}
      >
        <Plus className="size-3.5" />
        Adicionar etapa
      </Button>

      {stages.length >= 7 ? (
        <p className="text-xs text-zinc-400">Limite de 7 etapas atingido.</p>
      ) : null}

      <AddStageDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        currentCount={stages.length}
        onAdded={handleStageAdded}
      />
    </div>
  )
}

// ── Sortable stage row ────────────────────────────────

function SortableStageRow({
  stage,
  onDeleted,
}: {
  stage: PipelineStageView
  onDeleted: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [name, setName] = useState(stage.name)
  const [saving, startSaving] = useTransition()
  const [deleting, startDeleting] = useTransition()
  const blurRef = useRef(stage.name)

  function handleBlur() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === blurRef.current) return

    startSaving(async () => {
      const result = await updateStageName({ stageId: stage.id, name: trimmed })
      if (result.ok) {
        blurRef.current = trimmed
      } else {
        toast.error(result.message)
        setName(blurRef.current)
      }
    })
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteStage({ stageId: stage.id })
      if (result.ok) {
        toast.success("Etapa removida")
        onDeleted(stage.id)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2",
        isDragging && "z-10 opacity-80 shadow-md"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-zinc-400 hover:text-zinc-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <Input
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur()
        }}
        className="h-8 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
        disabled={saving}
      />

      <div className="flex items-center gap-1.5">
        {stage.is_default ? (
          <Badge variant="secondary" className="text-[10px]">
            Padrão
          </Badge>
        ) : null}
        {stage.is_won ? (
          <Badge variant="secondary" className="bg-green-50 text-[10px] text-green-700">
            Ganho
          </Badge>
        ) : null}
        {stage.is_lost ? (
          <Badge variant="secondary" className="bg-red-50 text-[10px] text-red-700">
            Perdido
          </Badge>
        ) : null}

        {!stage.is_default ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={deleting}
            title="Deletar etapa"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5 text-zinc-400" />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

// ── Add stage dialog ──────────────────────────────────

function AddStageDialog({
  open,
  onOpenChange,
  currentCount,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCount: number
  onAdded: (stage: PipelineStageView) => void
}) {
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    startTransition(async () => {
      const result = await addStage({ name: trimmed })
      if (result.ok) {
        toast.success("Etapa adicionada")
        onAdded({
          id: result.data.id,
          organization_id: "",
          name: trimmed,
          position: currentCount,
          is_default: false,
          is_won: false,
          is_lost: false,
          created_at: new Date().toISOString(),
        })
        setName("")
        onOpenChange(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar etapa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="Nome da etapa"
            autoFocus
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
