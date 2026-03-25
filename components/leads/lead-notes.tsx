"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { addLeadNote, listLeadNotes } from "@/app/(app)/pipeline/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils/formatters"
import type { LeadNoteView } from "@/types/lead"

export type LeadNotesProps = {
  leadId: string
}

export function LeadNotes({ leadId }: LeadNotesProps) {
  const [notes, setNotes] = useState<LeadNoteView[]>([])
  const [text, setText] = useState("")
  const [loadPending, setLoadPending] = useState(true)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoadPending(true)
      const res = await listLeadNotes(leadId)
      if (cancelled) return
      if (res.ok) setNotes(res.data)
      else toast.error(res.message)
      setLoadPending(false)
    })()
    return () => {
      cancelled = true
    }
  }, [leadId])

  const save = () => {
    const t = text.trim()
    if (!t) return
    startTransition(async () => {
      const res = await addLeadNote({ leadId, text: t })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      const reload = await listLeadNotes(leadId)
      if (reload.ok) setNotes(reload.data)
      setText("")
      toast.success("Nota salva")
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Escreva uma nota…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          disabled={pending}
          className="resize-none rounded-lg"
        />
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={pending || !text.trim()}
        >
          Salvar nota
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-500">Histórico</p>
        {loadPending ? (
          <p className="text-sm text-zinc-500">Carregando…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma nota ainda.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 text-sm"
              >
                <p className="whitespace-pre-wrap text-zinc-800">{n.text}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {n.author_name ?? "Usuário"} ·{" "}
                  {formatDate(n.created_at, "dd/MM/yyyy HH:mm")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
