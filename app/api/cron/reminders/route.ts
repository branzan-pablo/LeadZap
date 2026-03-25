import { NextResponse } from "next/server"

import { sendPushNotification } from "@/lib/push/send"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Vercel Cron: schedule in vercel.json. Expects Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    )
  }

  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "")

  let processed = 0
  for (const row of rows ?? []) {
    const userId = row.user_id as string
    const leadId = row.lead_id as string
    const title = row.title as string
    const id = row.id as string

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
