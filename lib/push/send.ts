import webpush from "web-push"

import { createAdminClient } from "@/lib/supabase/admin"

import { configureWebPush } from "./vapid"

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Send a Web Push notification to a subscription record from the DB.
 */
export async function sendWebPush(
  subscription: webpush.PushSubscription,
  payload: PushPayload
) {
  configureWebPush()
  const data = JSON.stringify(payload)
  return webpush.sendNotification(subscription, data)
}

/**
 * Sends the payload to every stored subscription for the user.
 * Removes subscriptions that expired (410/404).
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<void> {
  configureWebPush()
  const admin = createAdminClient()

  const { data: rows, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)

  if (error || !rows?.length) return

  for (const row of rows) {
    const subscription: webpush.PushSubscription = {
      endpoint: row.endpoint as string,
      keys: {
        p256dh: row.p256dh as string,
        auth: row.auth as string,
      },
    }
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload))
    } catch (e: unknown) {
      const err = e as { statusCode?: number }
      if (err.statusCode === 410 || err.statusCode === 404) {
        await admin.from("push_subscriptions").delete().eq("id", row.id as string)
      }
    }
  }
}
