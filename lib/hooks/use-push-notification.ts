'use client'

import { useCallback, useState } from 'react'

/**
 * Request notification permission and register `/sw.js` + push subscription.
 */
export function usePushNotification() {
  const [supported, setSupported] = useState(false)

  const register = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    setSupported(true)
    await navigator.serviceWorker.register('/sw.js')
    // subscription + POST /api/push/subscribe
  }, [])

  return { supported, register }
}
