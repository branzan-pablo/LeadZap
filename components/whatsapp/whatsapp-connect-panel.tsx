"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import {
  disconnectWhatsAppInstance,
  prepareWhatsAppConnection,
  syncWhatsAppInstanceState,
} from "@/app/(app)/settings/whatsapp/actions"
import { Button } from "@/components/ui/button"
import type { WhatsappInstanceDbStatus } from "@/types/evolution"
import { cn } from "@/lib/utils"

export type WhatsAppConnectPanelProps = {
  isAdmin: boolean
  showSkip?: boolean
  onSkip?: () => void
  className?: string
}

function statusDotClass(status: WhatsappInstanceDbStatus | null) {
  if (status === "connected") return "bg-emerald-500"
  if (status === "connecting") return "bg-amber-500"
  return "bg-red-500"
}

export function WhatsAppConnectPanel({
  isAdmin,
  showSkip,
  onSkip,
  className,
}: WhatsAppConnectPanelProps) {
  const [pending, startTransition] = useTransition()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<WhatsappInstanceDbStatus | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshState = useCallback(() => {
    if (!isAdmin) return
    startTransition(async () => {
      const r = await syncWhatsAppInstanceState()
      if (!r.ok) return
      setStatus(r.data.status)
      setPhoneNumber(r.data.phone_number)
      if (r.data.status === "connected") {
        setQrDataUrl(null)
      }
    })
  }, [isAdmin])

  useEffect(() => {
    refreshState()
  }, [refreshState])

  useEffect(() => {
    if (!isAdmin) return
    pollRef.current = setInterval(refreshState, 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isAdmin, refreshState])

  function handleConnect() {
    if (!isAdmin) return
    startTransition(async () => {
      const r = await prepareWhatsAppConnection()
      if (!r.ok) {
        toast.error(r.message)
        return
      }
      setQrDataUrl(r.data.qrDataUrl)
      await syncWhatsAppInstanceState().then((s) => {
        if (s.ok) {
          setStatus(s.data.status)
          setPhoneNumber(s.data.phone_number)
        }
      })
    })
  }

  function handleDisconnect() {
    if (!isAdmin) return
    startTransition(async () => {
      const r = await disconnectWhatsAppInstance()
      if (!r.ok) {
        toast.error(r.message)
        return
      }
      setQrDataUrl(null)
      toast.success("WhatsApp desconectado.")
      refreshState()
    })
  }

  if (!isAdmin) {
    return (
      <div className={cn("rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600", className)}>
        <p>
          Apenas administradores podem conectar o WhatsApp da organização. Peça
          a um admin para acessar{" "}
          <span className="font-medium text-zinc-800">Configurações → WhatsApp</span>
          .
        </p>
      </div>
    )
  }

  const connected = status === "connected"

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <span
          className={cn("size-2 shrink-0 rounded-full", statusDotClass(status))}
          aria-hidden
        />
        <span>
          {connected
            ? "Conectado"
            : status === "connecting"
              ? "Aguardando leitura do QR…"
              : "Desconectado"}
        </span>
        {connected && phoneNumber ? (
          <span className="text-zinc-500">· {phoneNumber}</span>
        ) : null}
      </div>

      {connected ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-emerald-700">
            Conectado ✓
            {phoneNumber ? ` — ${phoneNumber}` : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => handleDisconnect()}
          >
            Desconectar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={pending}
              onClick={() => handleConnect()}
            >
              Conectar WhatsApp
            </Button>
            {showSkip && onSkip ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={onSkip}
              >
                Configurar depois
              </Button>
            ) : null}
          </div>

          {qrDataUrl ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-600">
                Escaneie o QR code com o WhatsApp no celular (Aparelhos
                conectados).
              </p>
              <div className="relative mx-auto w-[200px] overflow-hidden rounded-lg border border-zinc-200 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL do Evolution */}
                <img
                  src={qrDataUrl}
                  alt="QR code WhatsApp"
                  width={200}
                  height={200}
                  className="h-auto w-full"
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {showSkip && onSkip && !connected ? (
        <p className="text-xs text-zinc-500">
          Você pode continuar o cadastro e configurar o WhatsApp depois nas
          configurações.
        </p>
      ) : null}
    </div>
  )
}
