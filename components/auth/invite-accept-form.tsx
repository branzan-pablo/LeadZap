"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import {
  acceptInviteExistingUser,
  acceptInviteNewUser,
} from "@/app/(auth)/invite/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  acceptInviteLoginSchema,
  acceptInviteSignupSchema,
  type AcceptInviteLoginInput,
  type AcceptInviteSignupInput,
} from "@/lib/validations/settings"

// ── Existing user — login to accept ───────────────────

type ExistingProps = {
  token: string
  email: string
  orgName: string
}

export function InviteAcceptExisting({ token, email, orgName }: ExistingProps) {
  const router = useRouter()
  const [rootError, setRootError] = useState<string | null>(null)

  const form = useForm<AcceptInviteLoginInput>({
    resolver: zodResolver(acceptInviteLoginSchema),
    defaultValues: { token, email, password: "" },
  })

  const { control, handleSubmit, formState } = form
  const { isSubmitting } = formState

  async function onSubmit(values: AcceptInviteLoginInput) {
    setRootError(null)
    const result = await acceptInviteExistingUser(values)
    if (result.ok) {
      router.push("/pipeline")
    } else {
      setRootError(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Aceitar convite
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Você foi convidado para <strong>{orgName}</strong>. Faça login para
          aceitar.
        </p>
      </div>

      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            type="email"
            value={email}
            disabled
            className="bg-zinc-50"
          />
        </Field>

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="invite-password">Senha</FieldLabel>
              <Input
                id="invite-password"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                aria-invalid={!!fieldState.error}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      {rootError ? (
        <p className="text-sm text-red-500" role="alert">
          {rootError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Entrando…
          </>
        ) : (
          "Entrar e aceitar convite"
        )}
      </Button>
    </form>
  )
}

// ── New user — signup to accept ───────────────────────

type SignupProps = {
  token: string
  email: string
  orgName: string
}

export function InviteAcceptSignup({ token, email, orgName }: SignupProps) {
  const router = useRouter()
  const [rootError, setRootError] = useState<string | null>(null)

  const form = useForm<AcceptInviteSignupInput>({
    resolver: zodResolver(acceptInviteSignupSchema),
    defaultValues: {
      token,
      full_name: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { control, handleSubmit, formState } = form
  const { isSubmitting } = formState

  async function onSubmit(values: AcceptInviteSignupInput) {
    setRootError(null)
    const result = await acceptInviteNewUser(values)
    if (result.ok) {
      router.push("/pipeline")
    } else {
      setRootError(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Aceitar convite
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Você foi convidado para <strong>{orgName}</strong>. Crie sua conta
          para começar.
        </p>
      </div>

      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            type="email"
            value={email}
            disabled
            className="bg-zinc-50"
          />
        </Field>

        <Controller
          name="full_name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="invite-full_name">Nome completo</FieldLabel>
              <Input
                id="invite-full_name"
                autoComplete="name"
                placeholder="Seu nome"
                aria-invalid={!!fieldState.error}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="invite-password">Senha</FieldLabel>
              <Input
                id="invite-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                aria-invalid={!!fieldState.error}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="invite-confirmPassword">
                Confirmar senha
              </FieldLabel>
              <Input
                id="invite-confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!fieldState.error}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      {rootError ? (
        <p className="text-sm text-red-500" role="alert">
          {rootError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Criando conta…
          </>
        ) : (
          "Criar conta e aceitar convite"
        )}
      </Button>
    </form>
  )
}
