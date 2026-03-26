"use client"

import { useRef, useState, useTransition } from "react"
import { Check, Pencil } from "lucide-react"
import { toast } from "sonner"

import { updateOrgName } from "@/app/(app)/settings/team/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type OrgNameEditorProps = {
  initialName: string
  isAdmin: boolean
}

export function OrgNameEditor({ initialName, isAdmin }: OrgNameEditorProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleEdit() {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === initialName) {
      setName(initialName)
      setEditing(false)
      return
    }

    startTransition(async () => {
      const result = await updateOrgName({ name: trimmed })
      if (result.ok) {
        toast.success("Nome atualizado")
        setEditing(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  if (!isAdmin) {
    return <span className="text-lg font-semibold text-zinc-900">{initialName}</span>
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={handleEdit}
        className="group flex items-center gap-2 text-lg font-semibold text-zinc-900"
      >
        {name}
        <Pencil className="size-3.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave()
          if (e.key === "Escape") {
            setName(initialName)
            setEditing(false)
          }
        }}
        className="h-9 w-64 text-sm"
        disabled={pending}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleSave}
        disabled={pending}
      >
        <Check className="size-4" />
      </Button>
    </div>
  )
}
