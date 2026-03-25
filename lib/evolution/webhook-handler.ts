import type { EvolutionWebhookPayload } from '@/types/evolution'

/**
 * Parse and persist Evolution webhook events (implement in Phase 2+).
 */
export async function handleEvolutionWebhook(_payload: EvolutionWebhookPayload) {
  // validate org by instance name, upsert lead/message, notify assignee
}
