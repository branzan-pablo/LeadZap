"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteLead } from "@/app/(app)/pipeline/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeadView, OrgMemberView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { ReminderForm } from "@/components/reminders/reminder-form"

import { LeadActivity } from "./lead-activity"
import { LeadEditForm } from "./lead-edit-form"
import { LeadMessages } from "./lead-messages"
import { LeadNotes } from "./lead-notes"

export type LeadDrawerProps = {
  lead: LeadView | null
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  userId: string
  /** Ao abrir a aba Mensagens, remove o indicador de nova mensagem no card. */
  onWhatsAppMessagesViewed?: (leadId: string) => void
  stages: PipelineStageView[]
  orgTags: import("@/types/lead").TagView[]
  members: OrgMemberView[]
  isAdmin: boolean
  onLeadUpdated: (lead: LeadView) => void
  onLeadDeleted: (leadId: string) => void
}

export function LeadDrawer({
  lead,
  open,
  onOpenChange,
  organizationId,
  userId,
  onWhatsAppMessagesViewed,
  stages,
  orgTags,
  members,
  isAdmin,
  onLeadUpdated,
  onLeadDeleted,
}: LeadDrawerProps) {
  const router = useRouter()
  const [reminderOpen, setReminderOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!lead) return null

  const stage = stages.find((s) => s.id === lead.pipeline_stage_id)

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deleteLead({ leadId: lead.id })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      onLeadDeleted(lead.id)
      setDeleteOpen(false)
      onOpenChange(false)
      toast.success("Lead excluído")
      router.refresh()
    })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex w-full flex-col border-zinc-200 p-0 sm:max-w-[480px]"
        >
          <SheetHeader className="border-b border-zinc-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 pr-8">
              <SheetTitle className="text-lg">{lead.name}</SheetTitle>
              {stage ? (
                <Badge variant="secondary" className="font-normal">
                  {stage.name}
                </Badge>
              ) : null}
            </div>
          </SheetHeader>

          <Tabs
            defaultValue="dados"
            className="flex flex-1 flex-col min-h-0"
            onValueChange={(v) => {
              if (v === "mensagens") onWhatsAppMessagesViewed?.(lead.id)
            }}
          >
            <TabsList variant="line" className="mx-4 mt-2 w-auto shrink-0">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="notas">Notas</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
            </TabsList>

            <TabsContent
              value="dados"
              className="flex-1 overflow-y-auto px-4 pb-6"
            >
              <LeadEditForm
                lead={lead}
                stages={stages}
                members={members}
                orgTags={orgTags}
                isAdmin={isAdmin}
                userId={userId}
                organizationId={organizationId}
                onLeadUpdated={onLeadUpdated}
                onCreateReminder={() => setReminderOpen(true)}
                onDeleteClick={() => setDeleteOpen(true)}
              />
            </TabsContent>

            <TabsContent
              value="mensagens"
              className="flex-1 overflow-y-auto px-4 pb-6"
            >
              <LeadMessages
                leadId={lead.id}
                organizationId={organizationId}
              />
            </TabsContent>

            <TabsContent
              value="notas"
              className="flex-1 overflow-y-auto px-4 pb-6"
            >
              <div className="mt-4">
                <LeadNotes leadId={lead.id} />
              </div>
            </TabsContent>

            <TabsContent
              value="atividades"
              className="flex-1 overflow-y-auto px-4 pb-6"
            >
              <LeadActivity leadId={lead.id} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo lembrete</DialogTitle>
          </DialogHeader>
          <ReminderForm
            leadId={lead.id}
            onSuccess={() => {
              setReminderOpen(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir lead?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            Esta ação marca o lead como excluído. Não pode ser desfeita pelo
            app.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
