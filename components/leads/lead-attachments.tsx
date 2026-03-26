"use client"

import { FileIcon, ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import {
  deleteAttachment,
  getAttachmentSignedUrl,
  listAttachments,
  type AttachmentView,
} from "@/app/(app)/pipeline/actions"
import { Button } from "@/components/ui/button"

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_ATTACHMENTS = 5

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

type LeadAttachmentsProps = {
  leadId: string
  userId: string
  isAdmin: boolean
}

export function LeadAttachments({ leadId, userId, isAdmin }: LeadAttachmentsProps) {
  const [attachments, setAttachments] = useState<AttachmentView[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchAttachments = useCallback(async () => {
    const res = await listAttachments(leadId)
    if (res.ok) {
      setAttachments(res.data)
    }
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    fetchAttachments()
  }, [fetchAttachments])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = ""

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Tipo não permitido. Use imagens (JPG, PNG, WebP) ou PDF.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo excede o limite de 5 MB.")
      return
    }

    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Limite de ${MAX_ATTACHMENTS} anexos atingido.`)
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("leadId", leadId)

    const { uploadAttachment } = await import("@/app/(app)/pipeline/actions")
    const res = await uploadAttachment(formData)

    setUploading(false)

    if (!res.ok) {
      toast.error(res.message)
      return
    }

    setAttachments((prev) => [res.data, ...prev])
    toast.success("Arquivo enviado")
  }

  const handleDownload = (att: AttachmentView) => {
    startTransition(async () => {
      const res = await getAttachmentSignedUrl(att.id)
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      window.open(res.data.url, "_blank", "noopener,noreferrer")
    })
  }

  const handleDelete = (att: AttachmentView) => {
    startTransition(async () => {
      const res = await deleteAttachment({
        attachmentId: att.id,
        leadId,
      })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      setAttachments((prev) => prev.filter((a) => a.id !== att.id))
      toast.success("Anexo removido")
    })
  }

  const canDelete = (att: AttachmentView) =>
    att.uploaded_by === userId || isAdmin

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-zinc-400">
        <Loader2Icon className="size-4 animate-spin" />
        Carregando anexos…
      </div>
    )
  }

  const atLimit = attachments.length >= MAX_ATTACHMENTS

  return (
    <div className="space-y-3">
      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              {isImage(att.file_type) ? (
                <ImageIcon className="size-4 shrink-0 text-zinc-500" />
              ) : (
                <FileIcon className="size-4 shrink-0 text-zinc-500" />
              )}

              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                disabled={pending}
                onClick={() => handleDownload(att)}
              >
                <p className="truncate text-sm font-medium text-zinc-900">
                  {att.file_name}
                </p>
                <p className="text-xs text-zinc-400">
                  {formatFileSize(att.file_size)}
                </p>
              </button>

              {canDelete(att) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-8 shrink-0 p-0 text-zinc-400 hover:text-red-500"
                  disabled={pending}
                  onClick={() => handleDelete(att)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {atLimit ? (
        <p className="text-xs text-zinc-400">
          Limite de {MAX_ATTACHMENTS} anexos atingido.
        </p>
      ) : (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || pending}
            className="gap-1.5"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <UploadIcon className="size-4" />
            )}
            {uploading ? "Enviando…" : "Adicionar arquivo"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      )}
    </div>
  )
}
