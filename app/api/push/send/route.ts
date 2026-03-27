import { timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"
import { z } from "zod"

import { sendPushNotification } from "@/lib/push/send"
import { logger } from "@/lib/utils/logger"

const bodySchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().url().optional(),
  tag: z.string().max(100).optional(),
})

function tokenMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 })

/**
 * Internal/cron use. Requires PUSH_SEND_SECRET — fail-closed.
 */
export async function POST(request: Request) {
  const secret = process.env.PUSH_SEND_SECRET
  if (!secret) {
    logger.error("[api/push/send] PUSH_SEND_SECRET not configured — rejecting request")
    return UNAUTHORIZED
  }

  const auth = request.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ") || !tokenMatch(auth.slice(7), secret)) {
    return UNAUTHORIZED
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  try {
    await sendPushNotification(parsed.data.userId, {
      title: parsed.data.title,
      body: parsed.data.body,
      url: parsed.data.url,
      tag: parsed.data.tag,
    })
  } catch (e: unknown) {
    logger.error("[api/push/send] notification failed", { error: e instanceof Error ? e.message : String(e) })
    return NextResponse.json({ error: "Send failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
