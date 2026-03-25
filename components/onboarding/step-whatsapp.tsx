"use client"

import { Button } from "@/components/ui/button"
import { WhatsAppConnectPanel } from "@/components/whatsapp/whatsapp-connect-panel"

export type StepWhatsAppProps = {
  isAdmin: boolean
  onSkip: () => void
  onContinue: () => void
}

export function StepWhatsApp({
  isAdmin,
  onSkip,
  onContinue,
}: StepWhatsAppProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-zinc-600">
        Conecte seu WhatsApp para receber mensagens automaticamente. Você
        poderá configurar isso depois nas configurações da organização.
      </p>
      <WhatsAppConnectPanel isAdmin={isAdmin} />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onSkip}>
          Pular etapa
        </Button>
        <Button type="button" onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
