/**
 * Returns a safe, generic error message for the client while logging the
 * real error server-side. Prevents internal DB/API error details from
 * leaking to the browser.
 *
 * Server-side only — do not import from client components.
 */
import { logger } from "@/lib/utils/logger"

export function toUserFacingError(err: unknown, fallback: string): string {
  logger.error(`[server-action] ${fallback}`, { error: err instanceof Error ? err.message : String(err) })
  return fallback
}
