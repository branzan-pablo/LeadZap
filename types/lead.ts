export type LeadSource =
  | 'manual'
  | 'whatsapp'
  | 'instagram'
  | 'website'
  | 'referral'
  | 'other'

export type Lead = {
  id: string
  organization_id: string
  assigned_to: string | null
  pipeline_stage_id: string
  name: string
  phone: string
  email: string | null
  value: number | null
  source: LeadSource
  created_at: string
  updated_at: string
  last_interaction_at: string | null
  deleted_at: string | null
}
