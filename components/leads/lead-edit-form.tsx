"use client"

import { ExternalLinkIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import { updateLead } from "@/app/(app)/pipeline/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { LeadSource, LeadView, OrgMemberView, TagView } from "@/types/lead"
import type { PipelineStageView } from "@/types/pipeline"

import { LeadAttachments } from "./lead-attachments"
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

export type LeadEditFormProps = {
  lead: LeadView
  stages: PipelineStageView[]
  members: OrgMemberView[]
  orgTags: TagView[]
  isAdmin: boolean
  userId: string
  organizationId: string
  onLeadUpdated: (lead: LeadView) => void
  onCreateReminder: () => void
  onDeleteClick: () => void
}

export function LeadEditForm({
  lead,
  members,
  orgTags,
  isAdmin,
  userId,
  onLeadUpdated,
  onCreateReminder,
  onDeleteClick,
}: LeadEditFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

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

  return (
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
            lead.estimated_value != null ? String(lead.estimated_value) : ""
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
        <LeadAttachments leadId={lead.id} userId={userId} isAdmin={isAdmin} />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCreateReminder}
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
          onClick={onDeleteClick}
        >
          <Trash2Icon className="size-4" />
          Excluir lead
        </Button>
      ) : null}
    </div>
  )
}
