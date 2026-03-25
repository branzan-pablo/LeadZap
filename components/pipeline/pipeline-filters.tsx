"use client"

import { CheckIcon, SearchIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"

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
import { cn } from "@/lib/utils"
import type { LeadView, OrgMemberView, TagView } from "@/types/lead"

export type PipelineFilterState = {
  tagIds: string[]
  assigneeId: string | null
  search: string
}

export function applyPipelineFilters(
  leads: LeadView[],
  filters: PipelineFilterState,
  options: { isAdmin: boolean }
): LeadView[] {
  let out = leads

  const q = filters.search.trim().toLowerCase()
  if (q.length > 0) {
    const digits = q.replace(/\D/g, "")
    out = out.filter((l) => {
      const nameMatch = l.name.toLowerCase().includes(q)
      const phoneDigits = l.phone.replace(/\D/g, "")
      const phoneMatch =
        digits.length > 0 ? phoneDigits.includes(digits) : false
      return nameMatch || phoneMatch
    })
  }

  if (filters.tagIds.length > 0) {
    out = out.filter((l) =>
      filters.tagIds.every((tid) => l.tags.some((t) => t.id === tid))
    )
  }

  if (options.isAdmin && filters.assigneeId) {
    out = out.filter((l) => l.assigned_to === filters.assigneeId)
  }

  return out
}

export function filtersAreActive(f: PipelineFilterState, isAdmin: boolean) {
  if (f.search.trim().length > 0) return true
  if (f.tagIds.length > 0) return true
  if (isAdmin && f.assigneeId) return true
  return false
}

export type PipelineFiltersProps = {
  tags: TagView[]
  members: OrgMemberView[]
  isAdmin: boolean
  value: PipelineFilterState
  onChange: (next: PipelineFilterState) => void
}

export function PipelineFilters({
  tags,
  members,
  isAdmin,
  value,
  onChange,
}: PipelineFiltersProps) {
  const [tagOpen, setTagOpen] = useState(false)

  const selectedTagSet = useMemo(() => new Set(value.tagIds), [value.tagIds])

  function toggleTag(id: string) {
    const next = new Set(value.tagIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange({ ...value, tagIds: [...next] })
  }

  function clearAll() {
    onChange({ tagIds: [], assigneeId: null, search: "" })
  }

  const hasActive = filtersAreActive(value, isAdmin)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            placeholder="Buscar por nome ou telefone…"
            value={value.search}
            onChange={(e) =>
              onChange({ ...value, search: e.target.value })
            }
            className="rounded-lg pl-9"
          />
        </div>

        <Popover open={tagOpen} onOpenChange={setTagOpen}>
          <PopoverTrigger>
            <Button variant="outline" type="button" className="min-w-[140px]">
              Tags
              {value.tagIds.length > 0 ? (
                <Badge variant="secondary" className="ml-1">
                  {value.tagIds.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar tag…" />
              <CommandList>
                <CommandEmpty>Nenhuma tag.</CommandEmpty>
                <CommandGroup>
                  {tags.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={t.name}
                      onSelect={() => toggleTag(t.id)}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          selectedTagSet.has(t.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {isAdmin ? (
          <Select
            value={value.assigneeId ?? "all"}
            onValueChange={(v) => {
              if (v == null) return
              onChange({
                ...value,
                assigneeId: v === "all" ? null : v,
              })
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {hasActive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-zinc-600"
            onClick={clearAll}
          >
            Limpar filtros
          </Button>
        ) : null}
      </div>

      {value.tagIds.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.tagIds.map((id) => {
            const t = tags.find((x) => x.id === id)
            if (!t) return null
            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-1 font-normal"
              >
                {t.name}
                <button
                  type="button"
                  className="rounded p-0.5 hover:bg-zinc-200"
                  aria-label={`Remover filtro ${t.name}`}
                  onClick={() => toggleTag(id)}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
