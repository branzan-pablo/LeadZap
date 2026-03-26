"use client"

import { ExternalLinkIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  deleteLead,
  updateLead,
} from "@/app/(app)/pipeline/actions"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeadSource, LeadView, OrgMemberView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { ReminderForm } from "@/components/reminders/reminder-form"

import { LeadActivity } from "./lead-activity"
import { LeadAttachments } from "./lead-attachments"
import { LeadMessages } from "./lead-messages"
import { LeadNotes } from "./lead-notes"
import { LeadTags } from "./lead-tags"

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "website", label: "Site" },
  { value: "referral", label: "Indicação" },
  { value: "other", label: "Outro" },
]

function waDigits(phone: string) {
  return phone.replace(/\D/g, "")
}

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

  const saveField = (payload: Record<string, unknown>) => {
    startTransition(async () => {
      const res = await updateLead({ id: lead.id, ...payload })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      onLeadUpdated({ ...lead, ...payload, updated_at: new Date().toISOString() } as LeadView)
      router.refresh()
    })
  }

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
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ld-name">Nome</Label>
                  <Input
                    id="ld-name"
                    defaultValue={lead.name}
                    key={`name-${lead.id}-${lead.updated_at}`}
                    disabled={pending}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && v !== lead.name) saveField({ name: v })
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ld-phone">Telefone</Label>
                  <Input
                    id="ld-phone"
                    defaultValue={lead.phone}
                    key={`phone-${lead.id}-${lead.updated_at}`}
                    disabled={pending}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && v !== lead.phone) saveField({ phone: v })
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ld-email">E-mail</Label>
                  <Input
                    id="ld-email"
                    type="email"
                    defaultValue={lead.email ?? ""}
                    key={`email-${lead.id}-${lead.updated_at}`}
                    disabled={pending}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      const next = v === "" ? null : v
                      if (next !== lead.email) saveField({ email: next })
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ld-company">Empresa</Label>
                  <Input
                    id="ld-company"
                    defaultValue={lead.company ?? ""}
                    key={`company-${lead.id}-${lead.updated_at}`}
                    disabled={pending}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      const next = v === "" ? null : v
                      if (next !== lead.company) saveField({ company: next })
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Origem</Label>
                  <Select
                    value={lead.source}
                    onValueChange={(v) => {
                      if (v == null) return
                      saveField({ source: v as LeadSource })
                    }}
                    disabled={pending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ld-value">Valor estimado (R$)</Label>
                  <Input
                    id="ld-value"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={
                      lead.estimated_value != null
                        ? String(lead.estimated_value)
                        : ""
                    }
                    key={`val-${lead.id}-${lead.updated_at}`}
                    disabled={pending}
                    onBlur={(e) => {
                      const raw = e.target.value.trim()
                      const num =
                        raw === "" ? null : Number.parseFloat(raw.replace(",", "."))
                      if (num !== null && Number.isNaN(num)) return
                      if (num !== lead.estimated_value) {
                        saveField({ estimated_value: num })
                      }
                    }}
                  />
                </div>

                <div className="space-y-2 border-t border-zinc-100 pt-4">
                  <Label>Tags</Label>
                  <LeadTags
                    leadId={lead.id}
                    tagsOnLead={lead.tags}
                    orgTags={orgTags}
                    onTagsChange={(tags) => {
                      onLeadUpdated({ ...lead, tags })
                    }}
                  />
                </div>

                <div className="space-y-1.5 border-t border-zinc-100 pt-4">
                  <Label>Anexos</Label>
                  <LeadAttachments
                    leadId={lead.id}
                    userId={userId}
                    isAdmin={isAdmin}
                  />
                </div>

                <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setReminderOpen(true)}
                  >
                    Criar lembrete
                  </Button>
                  <a
                    href={`https://wa.me/${waDigits(lead.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "inline-flex gap-1.5"
                    )}
                  >
                    <ExternalLinkIcon className="size-4" />
                    Abrir no WhatsApp
                  </a>
                </div>

                {isAdmin ? (
                  <div className="space-y-1.5 border-t border-zinc-100 pt-4">
                    <Label>Responsável</Label>
                    <Select
                      value={lead.assigned_to ?? "unassigned"}
                      onValueChange={(v) => {
                        if (v == null) return
                        const next = v === "unassigned" ? null : v
                        saveField({ assigned_to: next })
                      }}
                      disabled={pending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Não atribuído</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {isAdmin ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2Icon className="size-4" />
                    Excluir lead
                  </Button>
                ) : null}
              </div>
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
