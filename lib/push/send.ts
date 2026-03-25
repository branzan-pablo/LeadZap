import webpush from 'web-push'
import { configureWebPush } from './vapid'

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Send a Web Push notification to a subscription record from the DB.
 */
export async function sendWebPush(subscription: webpush.PushSubscription, payload: PushPayload) {
  configureWebPush()
  const data = JSON.stringify(payload)
  return webpush.sendNotification(subscription, data)
}
