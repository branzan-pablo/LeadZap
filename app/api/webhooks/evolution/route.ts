import { NextResponse } from 'next/server'
import { handleEvolutionWebhook } from '@/lib/evolution/webhook-handler'
import type { EvolutionWebhookPayload } from '@/types/evolution'

/**
 * Evolution API webhook receiver.
 * Validates secret and delegates to lib/evolution/webhook-handler (Phase 2+).
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret')
    ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!process.env.EVOLUTION_WEBHOOK_SECRET || secret !== process.env.EVOLUTION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await request.json()) as EvolutionWebhookPayload
  await handleEvolutionWebhook(payload)

  return NextResponse.json({ ok: true })
}
