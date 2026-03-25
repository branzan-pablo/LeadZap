'use client'

import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'

function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster richColors closeButton position="top-right" />
      <ServiceWorkerRegistration />
    </ThemeProvider>
  )
}
