"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export type StepFirstLeadProps = {
  leadName: string
  leadPhone: string
  onLeadNameChange: (value: string) => void
  onLeadPhoneChange: (value: string) => void
  error: string | null
  pending: boolean
  onCreateLead: () => void
  onSkip: () => void
}

export function StepFirstLead({
  leadName,
  leadPhone,
  onLeadNameChange,
  onLeadPhoneChange,
  error,
  pending,
  onCreateLead,
  onSkip,
}: StepFirstLeadProps) {
  return (
    <FieldGroup className="gap-4">
      <p className="text-sm text-zinc-600">
        Opcional: cadastre um primeiro contato. Na próxima fase isso será
        integrado ao pipeline.
      </p>
      <Field>
        <FieldLabel htmlFor="lead-name">Nome</FieldLabel>
        <Input
          id="lead-name"
          value={leadName}
          onChange={(e) => onLeadNameChange(e.target.value)}
          placeholder="Nome do contato"
          disabled={pending}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lead-phone">Telefone</FieldLabel>
        <Input
          id="lead-phone"
          value={leadPhone}
          onChange={(e) => onLeadPhoneChange(e.target.value)}
          placeholder="+5511999999999"
          inputMode="tel"
          autoComplete="tel"
          disabled={pending}
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onSkip}
          disabled={pending}
        >
          Pular
        </Button>
        <Button type="button" onClick={onCreateLead} disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Criando…
            </>
          ) : (
            "Criar lead"
          )}
        </Button>
      </div>
    </FieldGroup>
  )
}
