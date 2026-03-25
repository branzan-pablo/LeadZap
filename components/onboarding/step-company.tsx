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

export type StepCompanyProps = {
  companyName: string
  onCompanyNameChange: (value: string) => void
  error: string | null
  pending: boolean
  onContinue: () => void
}

export function StepCompany({
  companyName,
  onCompanyNameChange,
  error,
  pending,
  onContinue,
}: StepCompanyProps) {
  return (
    <FieldGroup className="gap-4">
      <Field>
        <FieldLabel htmlFor="company-name">Nome da empresa</FieldLabel>
        <Input
          id="company-name"
          name="company-name"
          autoComplete="organization"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          placeholder="Ex.: Minha Empresa Ltda"
          disabled={pending}
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      <Button
        type="button"
        className="w-full"
        onClick={onContinue}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Salvando…
          </>
        ) : (
          "Continuar"
        )}
      </Button>
    </FieldGroup>
  )
}
