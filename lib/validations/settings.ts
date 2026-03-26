import { z } from "zod"

import { emailSchema } from "@/lib/utils/validators"

// ── Team ──────────────────────────────────────────────

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "user"], {
    message: "Selecione o papel do convidado",
  }),
})

export const revokeInviteSchema = z.object({
  inviteId: z.string().uuid(),
})

export const removeMemberSchema = z.object({
  userId: z.string().uuid(),
})

export const updateOrgNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(200, "O nome deve ter no máximo 200 caracteres"),
})

// ── Pipeline config ───────────────────────────────────

export const updateStageNameSchema = z.object({
  stageId: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
})

export const addStageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "O nome é obrigatório")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
})

export const reorderStagesSchema = z.object({
  stageIds: z.array(z.string().uuid()).min(1).max(7),
})

export const deleteStageSchema = z.object({
  stageId: z.string().uuid(),
})

// ── Invite acceptance ─────────────────────────────────

export const acceptInviteSignupSchema = z
  .object({
    token: z.string().min(1),
    full_name: z.string().trim().min(1, "Informe seu nome completo"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const acceptInviteLoginSchema = z.object({
  token: z.string().min(1),
  email: emailSchema,
  password: z.string().min(1, "Informe a senha"),
})

// ── Inferred types ────────────────────────────────────

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type RevokeInviteInput = z.infer<typeof revokeInviteSchema>
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>
export type UpdateOrgNameInput = z.infer<typeof updateOrgNameSchema>
export type UpdateStageNameInput = z.infer<typeof updateStageNameSchema>
export type AddStageInput = z.infer<typeof addStageSchema>
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>
export type DeleteStageInput = z.infer<typeof deleteStageSchema>
export type AcceptInviteSignupInput = z.infer<typeof acceptInviteSignupSchema>
export type AcceptInviteLoginInput = z.infer<typeof acceptInviteLoginSchema>
