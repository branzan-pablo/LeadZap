import { z } from 'zod'

/** Brazilian mobile/landline in E.164: +55 + DDD + number */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+55\d{10,11}$/, 'Telefone deve estar no formato +5511999999999')

export const emailSchema = z.string().trim().email('E-mail inválido')
