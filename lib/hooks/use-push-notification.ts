"use client"

import { useCallback, useEffect, useState } from "react"

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function browserSupportsPush(): boolean {
  if (typeof window === "undefined") return false
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export type UsePushNotificationResult = {
  supported: boolean
  permission: NotificationPermission | "unsupported"
  registering: boolean
  error: string | null
  register: () => Promise<boolean>
}

/**
 * Request notification permission and register `/sw.js` + push subscription.
 */
export function usePushNotification(): UsePushNotificationResult {
  const [supported, setSupported] = useState(false)

  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default")

  useEffect(() => {
    const ok = browserSupportsPush()
    setSupported(ok)
    if (!ok) {
      setPermission("unsupported")
      return
    }
    setPermission(Notification.permission)
  }, [])
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = useCallback(async (): Promise<boolean> => {
    if (!browserSupportsPush()) {
      setError("Push não suportado neste navegador.")
      return false
    }

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapid?.trim()) {
      setError("Chave VAPID não configurada.")
      return false
    }

    setError(null)
    setRegistering(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") {
        setError("Permissão de notificação negada.")
        return false
      }

      const reg = await navigator.serviceWorker.register("/sw.js")
      await reg.update()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      })

      const json = sub.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        setError("Subscription inválida.")
        return false
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: {
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          },
        }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        setError(body?.error ?? `Erro ${res.status}`)
        return false
      }

      return true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao registrar push."
      setError(msg)
      return false
    } finally {
      setRegistering(false)
    }
  }, [])

  return {
    supported,
    permission: supported ? permission : "unsupported",
    registering,
    error,
    register,
  }
}
