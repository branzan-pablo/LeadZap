"use client"

import { cn } from "@/lib/utils"

type WhatsAppStatusProps = {
  /** Placeholder: wire real instance status in later phase */
  connected?: boolean
  className?: string
}

export function WhatsAppStatus({
  connected = false,
  className,
}: WhatsAppStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-zinc-600",
        className
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          connected ? "bg-emerald-500" : "bg-red-500"
        )}
        aria-hidden
      />
      <span>{connected ? "Conectado" : "Desconectado"}</span>
    </div>
  )
}
