export const DEFAULT_PIPELINE_STAGES = [
  'Novo lead',
  'Qualificação',
  'Proposta',
  'Negociação',
  'Fechado',
] as const

export const DEFAULT_TAGS = ['Quente', 'Morno', 'Frio', 'Follow-up'] as const

export const FILE_LIMITS = {
  maxAttachmentsPerLead: 20,
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
} as const

export const PLANS = {
  free: { name: 'Free', maxUsers: 1, maxLeads: 100 },
  pro: { name: 'Pro', maxUsers: 10, maxLeads: 10_000 },
} as const
