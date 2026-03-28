export type LeadSource =
  | "manual"
  | "whatsapp"
  | "instagram"
  | "website"
  | "referral"
  | "other"

export type TagView = {
  id: string
  name: string
  color: string
}

/** Lead row as used in pipeline / list UI (matches DB + joined tags). */
export type LeadView = {
  id: string
  organization_id: string
  assigned_to: string | null
  pipeline_stage_id: string
  name: string
  phone: string
  email: string | null
  company: string | null
  source: LeadSource
  estimated_value: number | null
  notes: string | null
  position: number
  last_interaction_at: string | null
  created_at: string
  updated_at: string
  tags: TagView[]
}

export type OrgMemberView = {
  id: string
  full_name: string
  email: string
}

export type LeadNoteView = {
  id: string
  text: string
  created_at: string
  author_name: string | null
}

export type AttachmentView = {
  id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  uploaded_by: string
  created_at: string
}
