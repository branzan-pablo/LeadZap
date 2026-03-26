"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { removeMember } from "@/app/(app)/settings/team/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils/formatters"
import type { MemberView } from "@/types/settings"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

type TeamMembersProps = {
  members: MemberView[]
  currentUserId: string
}

export function TeamMembers({ members, currentUserId }: TeamMembersProps) {
  const [confirmRemove, setConfirmRemove] = useState<MemberView | null>(null)
  const [pending, startTransition] = useTransition()

  function handleRemove() {
    if (!confirmRemove) return

    startTransition(async () => {
      const result = await removeMember({ userId: confirmRemove.id })
      if (result.ok) {
        toast.success("Membro removido da organização")
        setConfirmRemove(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-zinc-700">Membros</h2>

      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url} alt="" />
                      ) : null}
                      <AvatarFallback>
                        {initials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-zinc-900">
                      {member.full_name}
                      {member.id === currentUserId ? (
                        <span className="ml-1.5 text-xs text-zinc-400">
                          (você)
                        </span>
                      ) : null}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500">
                  {member.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.role === "admin" ? "default" : "secondary"}
                  >
                    {member.role === "admin" ? "Admin" : "Membro"}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500">
                  {formatDate(member.created_at)}
                </TableCell>
                <TableCell>
                  {member.id !== currentUserId ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setConfirmRemove(member)}
                      title="Remover membro"
                    >
                      <Trash2 className="size-3.5 text-zinc-400" />
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm remove dialog */}
      <Dialog
        open={!!confirmRemove}
        onOpenChange={(open) => {
          if (!open) setConfirmRemove(null)
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover membro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            Tem certeza que deseja remover{" "}
            <strong>{confirmRemove?.full_name}</strong> da organização? Esta ação
            não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRemove(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Remover"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
