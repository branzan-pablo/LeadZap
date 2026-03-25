import { z } from "zod"

import { phoneSchema } from "@/lib/utils/validators"

export const organizationNameSchema = z
  .string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(120, "Nome muito longo")

export type OrganizationNameInput = z.infer<typeof organizationNameSchema>

export const firstLeadPlaceholderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome")
    .max(200, "Nome muito longo"),
  phone: phoneSchema,
})

export type FirstLeadPlaceholderInput = z.infer<
  typeof firstLeadPlaceholderSchema
>
