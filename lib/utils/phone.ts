/**
 * Normalizes common Brazilian phone inputs to E.164 (+55 + DDD + number).
 */
export function normalizeBrazilPhoneToE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 0) return null

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`
  }

  return null
}
