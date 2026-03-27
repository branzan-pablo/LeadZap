import { timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

import { sendPushNotification } from "@/lib/push/send"
import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/utils/logger"

function tokenMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

const UNAUTHORIZED = NextResponse.json({ error: "Unauthorized" }, { status: 401 })

/**
 * Vercel Cron: schedule in vercel.json. Expects Authorization: Bearer CRON_SECRET.
 * Fail-closed: if CRON_SECRET is not configured, returns 401 (not 500) to avoid leaking config state.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    logger.error("[api/cron/reminders] CRON_SECRET not configured — rejecting request")
    return UNAUTHORIZED
  }

  const auth = request.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ") || !tokenMatch(auth.slice(7), secret)) {
    return UNAUTHORIZED
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: rows, error } = await admin
    .from("reminders")
    .select("id, user_id, title, lead_id")
    .lte("due_at", now)
    .is("completed_at", null)
    .eq("push_sent", false)

  if (error) {
    logger.error("[api/cron/reminders] DB query failed", { error: error.message })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "")

  let processed = 0
  for (const row of rows ?? []) {
    const userId = row.user_id
    const leadId = row.lead_id
    const title = row.title
    const id = row.id

    const path = `/leads?leadId=${leadId}`
    const url = baseUrl ? `${baseUrl}${path}` : path

    try {
      await sendPushNotification(userId, {
        title: "Lembrete",
        body: title,
        url,
        tag: id,
      })
    } catch {
      // VAPID misconfig etc.; still mark sent to avoid infinite retries (documented in fase-06)
    }

    const { error: updErr } = await admin
      .from("reminders")
      .update({ push_sent: true })
      .eq("id", id)

    if (!updErr) processed += 1
  }

  return NextResponse.json({ ok: true, processed })
}
