import { NextResponse } from "next/server"

import { processWebhook } from "@/lib/evolution/webhook-handler"
import type { EvolutionWebhookPayload } from "@/types/evolution"

/**
 * Evolution API webhook receiver.
 * Valida secret; após autenticação responde sempre 200 para evitar retries em falha interna.
 */
export async function POST(request: Request) {
  const secret =
    request.headers.get("x-webhook-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null

  if (
    !process.env.EVOLUTION_WEBHOOK_SECRET ||
    secret !== process.env.EVOLUTION_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as EvolutionWebhookPayload
    await processWebhook(body)
  } catch (e) {
    console.error("[api/webhooks/evolution]", e)
  }

  return NextResponse.json({ ok: true })
}
