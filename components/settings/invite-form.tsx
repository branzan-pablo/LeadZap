"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { inviteMember, revokeInvite } from "@/app/(app)/settings/team/actions"
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils/formatters"
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/validations/settings"
import type { InviteView } from "@/types/settings"

type InviteFormProps = {
  pendingInvites: InviteView[]
  maxUsers: number
  currentMemberCount: number
  pendingInviteCount: number
}

export function InviteForm({
  pendingInvites,
  maxUsers,
  currentMemberCount,
  pendingInviteCount,
}: InviteFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [revoking, startRevoking] = useTransition()

  const limitReached =
    currentMemberCount + pendingInviteCount >= maxUsers

  function handleCopyLink(token: string) {
    const appUrl = (
      typeof window !== "undefined" ? window.location.origin : ""
    ).replace(/\/$/, "")
    const link = `${appUrl}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    toast.success("Link copiado!")
    setTimeout(() => setCopiedToken(null), 2000)
  }

  function handleRevoke(inviteId: string) {
    startRevoking(async () => {
      const result = await revokeInvite({ inviteId })
      if (result.ok) {
        toast.success("Convite revogado")
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-700">Convites</h2>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          disabled={limitReached}
        >
          <Plus className="size-3.5" />
          Convidar membro
        </Button>
      </div>

      {limitReached ? (
        <p className="mb-4 text-xs text-amber-600">
          Limite de {maxUsers} usuários atingido. Faça upgrade do plano para
          convidar mais membros.
        </p>
      ) : null}

      {/* Pending invites list */}
      {pendingInvites.length > 0 ? (
        <div className="space-y-2">
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {invite.email}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Enviado em {formatDate(invite.created_at)} · Expira em{" "}
                    {formatDate(invite.expires_at)}
                  </p>
                </div>
                <Badge
                  variant={invite.role === "admin" ? "default" : "secondary"}
                >
                  {invite.role === "admin" ? "Admin" : "Membro"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopyLink(invite.token)}
                  title="Copiar link do convite"
                >
                  {copiedToken === invite.token ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5 text-zinc-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRevoke(invite.id)}
                  disabled={revoking}
                  title="Revogar convite"
                >
                  <Trash2 className="size-3.5 text-zinc-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Nenhum convite pendente.</p>
      )}

      {/* Invite dialog */}
      <InviteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

// ── Invite Dialog ─────────────────────────────────────

function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "user" },
  })

  const { control, handleSubmit, formState, reset, setError } = form
  const { isSubmitting } = formState

  async function onSubmit(values: InviteMemberInput) {
    const result = await inviteMember(values)
    if (result.ok) {
      toast.success("Convite enviado!")
      // Copy link
      const appUrl = (
        typeof window !== "undefined" ? window.location.origin : ""
      ).replace(/\/$/, "")
      const link = `${appUrl}/invite/${result.data.token}`
      navigator.clipboard.writeText(link)
      toast.success("Link do convite copiado para a área de transferência")
      reset()
      onOpenChange(false)
    } else {
      setError("email", { message: result.message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup className="gap-3">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="membro@empresa.com"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                  <FieldLabel>Papel</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Membro</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                "Convidar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
