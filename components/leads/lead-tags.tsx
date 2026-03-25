"use client"

import { CheckIcon, PlusIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  addTagToLead,
  createTag,
  removeTagFromLead,
} from "@/app/(app)/pipeline/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TAG_CREATE_COLOR_OPTIONS } from "@/lib/utils/tag-constants"
import { tagBadgeClassName, tagBadgeStyle } from "@/lib/utils/tag-styles"
import { cn } from "@/lib/utils"
import type { TagView } from "@/types/lead"

export type LeadTagsProps = {
  leadId: string
  tagsOnLead: TagView[]
  orgTags: TagView[]
  onTagsChange: (tags: TagView[]) => void
}

export function LeadTags({
  leadId,
  tagsOnLead,
  orgTags,
  onTagsChange,
}: LeadTagsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState<string>(
    TAG_CREATE_COLOR_OPTIONS[0]
  )
  const [pending, startTransition] = useTransition()

  const onRemove = (tagId: string) => {
    startTransition(async () => {
      const res = await removeTagFromLead({ leadId, tagId })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      onTagsChange(tagsOnLead.filter((t) => t.id !== tagId))
    })
  }

  const onAdd = (tag: TagView) => {
    startTransition(async () => {
      const res = await addTagToLead({ leadId, tagId: tag.id })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      if (!tagsOnLead.some((t) => t.id === tag.id)) {
        onTagsChange([...tagsOnLead, tag])
      }
      setOpen(false)
    })
  }

  const onCreate = () => {
    const name = newName.trim()
    if (!name) return
    startTransition(async () => {
      const res = await createTag({ name, color: newColor })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      const tag: TagView = {
        id: res.data.id,
        name: res.data.name,
        color: res.data.color,
      }
      const addRes = await addTagToLead({ leadId, tagId: tag.id })
      if (!addRes.ok) {
        toast.error(addRes.message)
        return
      }
      onTagsChange([...tagsOnLead, tag])
      setNewName("")
      setCreateOpen(false)
      setOpen(false)
      router.refresh()
    })
  }

  const available = orgTags.filter(
    (t) => !tagsOnLead.some((x) => x.id === t.id)
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tagsOnLead.map((t) => (
          <Badge
            key={t.id}
            variant="outline"
            className={cn("gap-1 pr-1 font-medium", tagBadgeClassName(t))}
            style={tagBadgeStyle(t)}
          >
            {t.name}
            <button
              type="button"
              disabled={pending}
              className="rounded p-0.5 hover:bg-black/5"
              aria-label={`Remover tag ${t.name}`}
              onClick={() => onRemove(t.id)}
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-7"
              disabled={pending}
              aria-label="Adicionar tag"
            >
              <PlusIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar tag…" />
              <CommandList>
                <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                <CommandGroup heading="Tags da organização">
                  {available.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={t.name}
                      onSelect={() => onAdd(t)}
                    >
                      <CheckIcon className="mr-2 size-4 opacity-0" />
                      {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="border-t border-zinc-200 p-2">
              <Popover open={createOpen} onOpenChange={setCreateOpen}>
                <PopoverTrigger>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    Criar nova tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 space-y-3" align="start">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-tag-name">Nome</Label>
                    <Input
                      id="new-tag-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex.: Follow-up"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cor</Label>
                    <Select
                      value={newColor}
                      onValueChange={(v) => {
                        if (v) setNewColor(v)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_CREATE_COLOR_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="flex items-center gap-2">
                              <span
                                className="size-3 rounded-full border border-zinc-200"
                                style={{ backgroundColor: c }}
                              />
                              {c}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={pending || !newName.trim()}
                    onClick={onCreate}
                  >
                    Criar e aplicar
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
