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

export function formatRelativeTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}
