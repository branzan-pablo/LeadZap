import { timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

import { processWebhook } from "@/lib/evolution/webhook-handler"
import type { EvolutionWebhookPayload } from "@/types/evolution"
import { logger } from "@/lib/utils/logger"

function tokenMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 })

/**
 * Evolution API webhook receiver.
 * Valida secret; após autenticação responde sempre 200 para evitar retries em falha interna.
 * Fail-closed: se EVOLUTION_WEBHOOK_SECRET não estiver configurado, rejeita todas as requisições.
 */
export async function POST(request: Request) {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET
  if (!expected) {
    logger.error("[api/webhooks/evolution] EVOLUTION_WEBHOOK_SECRET not configured — rejecting request")
    return UNAUTHORIZED
  }

  const secret =
    request.headers.get("x-webhook-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null

  if (!secret || !tokenMatch(secret, expected)) {
    return UNAUTHORIZED
  }

  try {
    const body = (await request.json()) as EvolutionWebhookPayload
    await processWebhook(body)
  } catch (e) {
    logger.error("[api/webhooks/evolution] processWebhook failed", { error: String(e) })
  }

  return NextResponse.json({ ok: true })
}
