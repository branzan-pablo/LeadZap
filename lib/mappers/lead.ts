import type { LeadSource, LeadView } from "@/types/lead"

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export type LeadRowDb = {
  id: string
  organization_id: string
  assigned_to: string | null
  pipeline_stage_id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  source: LeadSource
  estimated_value: unknown
  notes: string | null
  position: number
  last_interaction_at: string | null
  created_at: string
  updated_at: string
  lead_tags:
    | {
        tags: { id: string; name: string; color: string } | null
      }[]
    | null
}

export function toLeadView(row: LeadRowDb): LeadView {
  const tagRows = row.lead_tags ?? []
  const tags = tagRows
    .map((lt) => lt.tags)
    .filter((t): t is { id: string; name: string; color: string } => t != null)

  return {
    id: row.id,
    organization_id: row.organization_id,
    assigned_to: row.assigned_to,
    pipeline_stage_id: row.pipeline_stage_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    source: row.source,
    estimated_value: parseNumeric(row.estimated_value),
    notes: row.notes,
    position: row.position,
    last_interaction_at: row.last_interaction_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags,
  }
}
