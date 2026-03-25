import { NextResponse } from "next/server"
import { z } from "zod"

import { sendPushNotification } from "@/lib/push/send"

const bodySchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.string().optional(),
  tag: z.string().optional(),
})

/**
 * Internal/cron use. Protect with PUSH_SEND_SECRET when set.
 */
export async function POST(request: Request) {
  const token = process.env.PUSH_SEND_SECRET
  const auth = request.headers.get("authorization")
  if (token && auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid body"
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  try {
    await sendPushNotification(parsed.data.userId, {
      title: parsed.data.title,
      body: parsed.data.body,
      url: parsed.data.url,
      tag: parsed.data.tag,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Send failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
