import { z } from "zod"

import { normalizeBrazilPhoneToE164 } from "@/lib/utils/phone"

export const leadSourceSchema = z.enum([
  "manual",
  "whatsapp",
  "instagram",
  "website",
  "referral",
  "other",
])

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(200, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .min(8, "Telefone inválido")
    .transform((s) => normalizeBrazilPhoneToE164(s))
    .refine((v): v is string => v !== null, "Telefone inválido (use DDD + número ou +55…)"),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  source: leadSourceSchema.default("manual"),
  estimated_value: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().max(20_000).optional().or(z.literal("")),
})

export const updateLeadSchema = z.object({
  id: z.string().uuid("ID inválido"),
  name: z.string().trim().min(1).max(200).optional(),
  phone: z
    .string()
    .trim()
    .min(8)
    .transform((s) => normalizeBrazilPhoneToE164(s))
    .refine((v): v is string => v !== null, "Telefone inválido")
    .optional(),
  email: z.string().trim().email().nullable().optional().or(z.literal("")),
  company: z.string().trim().max(200).nullable().optional().or(z.literal("")),
  source: leadSourceSchema.optional(),
  estimated_value: z.coerce.number().nonnegative().nullable().optional(),
  notes: z.string().max(20_000).nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
})

export const moveLeadSchema = z.object({
  leadId: z.string().uuid(),
  newStageId: z.string().uuid(),
  newPosition: z.coerce.number().int().min(0),
})

export const deleteLeadSchema = z.object({
  leadId: z.string().uuid(),
})

export const addTagToLeadSchema = z.object({
  leadId: z.string().uuid(),
  tagId: z.string().uuid(),
})

export const removeTagFromLeadSchema = z.object({
  leadId: z.string().uuid(),
  tagId: z.string().uuid(),
})

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome da tag obrigatório")
    .max(80, "Nome muito longo"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
})

export const addLeadNoteSchema = z.object({
  leadId: z.string().uuid(),
  text: z.string().trim().min(1, "Digite uma nota").max(10_000, "Nota muito longa"),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type MoveLeadInput = z.infer<typeof moveLeadSchema>
