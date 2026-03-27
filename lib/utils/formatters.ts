import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/** Expects E.164 style e.g. +5511999999999 */
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 12 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const rest = digits.slice(4)
    const main = rest.length === 9 ? `${rest.slice(0, 5)}-${rest.slice(5)}` : rest
    return `+55 (${ddd}) ${main}`
  }
  return phone
}

export function formatDate(value: Date | string, pattern = 'dd/MM/yyyy') {
  const date = typeof value === 'string' ? new Date(value) : value
  return format(date, pattern, { locale: ptBR })
}

/** Data e hora curtas para balões de chat (WhatsApp). */
export function formatMessageTimestamp(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function formatRelativeTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}

/** Converts numeric-like values (number | string | null | undefined) to number | null. */
export function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Short relative labels for last interaction (pipeline cards). */
export function formatInteractionAgo(value: Date | string | null | undefined) {
  if (value == null) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return "agora"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 14) return `há ${days} ${days === 1 ? "dia" : "dias"}`
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}
