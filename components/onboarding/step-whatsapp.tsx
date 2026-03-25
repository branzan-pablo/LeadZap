"use client"

import { Button } from "@/components/ui/button"

export type StepWhatsAppProps = {
  onSkip: () => void
  onContinue: () => void
}

export function StepWhatsApp({ onSkip, onContinue }: StepWhatsAppProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-zinc-600">
        Conecte seu WhatsApp para receber mensagens automaticamente. Você
        poderá configurar isso depois nas configurações da organização.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onSkip}>
          Configurar depois
        </Button>
        <Button type="button" onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
