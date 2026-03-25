"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { getWhatsAppHeaderStatus } from "@/app/(app)/settings/whatsapp/actions"
import { cn } from "@/lib/utils"
import type { WhatsappInstanceDbStatus } from "@/types/evolution"

export type WhatsAppStatusProps = {
  organizationId: string | null
  role: "admin" | "user"
  className?: string
}

export function WhatsAppStatus({
  organizationId,
  role,
  className,
}: WhatsAppStatusProps) {
  const [status, setStatus] = useState<WhatsappInstanceDbStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!organizationId) {
        if (!cancelled) setStatus(null)
        return
      }
      const r = await getWhatsAppHeaderStatus()
      if (!cancelled && r.ok) {
        setStatus(r.data.status)
      }
    }

    void load()
    const interval = setInterval(() => void load(), 30_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [organizationId])

  const connected = status === "connected"

  const inner = (
    <>
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          connected ? "bg-emerald-500" : "bg-red-500"
        )}
        aria-hidden
      />
      <span>
        {connected ? "WhatsApp conectado" : "Desconectado"}
      </span>
    </>
  )

  const baseClass = cn(
    "flex items-center gap-2 text-sm text-zinc-600",
    role === "admin" && organizationId
      ? "rounded-md outline-offset-2 hover:text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
      : null,
    className
  )

  if (role === "admin" && organizationId) {
    return (
      <Link href="/settings/whatsapp" className={baseClass} title="Configurar WhatsApp">
        {inner}
      </Link>
    )
  }

  return <div className={baseClass}>{inner}</div>
}
