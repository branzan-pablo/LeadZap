"use client"

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"

import { createClient } from "@/lib/supabase/client"
import type { LeadView } from "@/types/lead"

type RealtimePayload = {
  id: string
  organization_id?: string
  assigned_to?: string | null
  pipeline_stage_id?: string
  name?: string
  phone?: string
  email?: string | null
  company?: string | null
  source?: LeadView["source"]
  estimated_value?: number | string | null
  notes?: string | null
  position?: number
  last_interaction_at?: string | null
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function rowToLeadView(
  row: RealtimePayload,
  previous: LeadView | undefined
): LeadView | null {
  if (!row.id) return null
  const tags = previous?.tags ?? []
  return {
    id: row.id,
    organization_id:
      row.organization_id ?? previous?.organization_id ?? "",
    assigned_to:
      row.assigned_to !== undefined
        ? row.assigned_to
        : (previous?.assigned_to ?? null),
    pipeline_stage_id:
      row.pipeline_stage_id ?? previous?.pipeline_stage_id ?? "",
    name: row.name ?? previous?.name ?? "",
    phone: row.phone ?? previous?.phone ?? "",
    email: row.email !== undefined ? row.email : (previous?.email ?? null),
    company:
      row.company !== undefined ? row.company : (previous?.company ?? null),
    source: row.source ?? previous?.source ?? "manual",
    estimated_value:
      row.estimated_value !== undefined
        ? parseNumeric(row.estimated_value)
        : (previous?.estimated_value ?? null),
    notes: row.notes !== undefined ? row.notes : (previous?.notes ?? null),
    position: row.position ?? previous?.position ?? 0,
    last_interaction_at:
      row.last_interaction_at !== undefined
        ? row.last_interaction_at
        : (previous?.last_interaction_at ?? null),
    created_at: row.created_at ?? previous?.created_at ?? "",
    updated_at: row.updated_at ?? previous?.updated_at ?? "",
    tags,
  }
}

export function useRealtimeLeads(
  organizationId: string | null,
  setLeads: Dispatch<SetStateAction<LeadView[]>>
) {
  const setRef = useRef(setLeads)
  setRef.current = setLeads

  useEffect(() => {
    if (!organizationId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`leads-org-${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as RealtimePayload
            if (row.deleted_at) return
            setRef.current((prev) => {
              if (prev.some((l) => l.id === row.id)) return prev
              const mapped = rowToLeadView(row, undefined)
              if (!mapped || !mapped.organization_id) return prev
              return [...prev, { ...mapped, tags: [] }]
            })
            return
          }

          if (payload.eventType === "UPDATE") {
            const row = payload.new as RealtimePayload
            setRef.current((prev) => {
              if (row.deleted_at) {
                return prev.filter((l) => l.id !== row.id)
              }
              const idx = prev.findIndex((l) => l.id === row.id)
              if (idx === -1) {
                const mapped = rowToLeadView(row, undefined)
                return mapped && mapped.organization_id
                  ? [...prev, { ...mapped, tags: [] }]
                  : prev
              }
              const mapped = rowToLeadView(row, prev[idx])
              if (!mapped) return prev
              const next = [...prev]
              next[idx] = { ...mapped, tags: prev[idx].tags }
              return next
            })
            return
          }

          if (payload.eventType === "DELETE") {
            const row = payload.old as { id?: string }
            if (!row.id) return
            setRef.current((prev) => prev.filter((l) => l.id !== row.id))
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [organizationId])
}
