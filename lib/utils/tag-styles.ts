import type { CSSProperties } from "react"

import type { TagView } from "@/types/lead"

const PRESET_BY_NAME: Record<string, { bg: string; text: string }> = {
  quente: { bg: "bg-red-100", text: "text-red-600" },
  frio: { bg: "bg-blue-100", text: "text-blue-600" },
  indeciso: { bg: "bg-amber-100", text: "text-amber-600" },
  vip: { bg: "bg-violet-100", text: "text-violet-600" },
}

export function tagBadgeClassName(tag: TagView) {
  const preset = PRESET_BY_NAME[tag.name.trim().toLowerCase()]
  if (preset) {
    return `${preset.bg} ${preset.text} border-transparent`
  }
  return "border-zinc-200"
}

export function tagBadgeStyle(tag: TagView): CSSProperties | undefined {
  const preset = PRESET_BY_NAME[tag.name.trim().toLowerCase()]
  if (preset) return undefined
  const hex = tag.color?.startsWith("#") ? tag.color : `#${tag.color}`
  return {
    backgroundColor: `${hex}26`,
    color: hex,
    borderColor: `${hex}40`,
  }
}
