"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth"

type ExchangeState = "idle" | "loading" | "ready" | "error"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [exchangeState, setExchangeState] = useState<ExchangeState>("idle")
  const [exchangeError, setExchangeError] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { control, handleSubmit, formState, setError } = form
  const { isSubmitting } = formState

  const runExchange = useCallback(async () => {
    const code = searchParams.get("code")
    if (!code) {
      setExchangeState("error")
      setExchangeError(
        "Link inválido ou expirado. Solicite um novo email de recuperação."
      )
      return
    }

    setExchangeState("loading")
    setExchangeError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      setExchangeState("error")
      setExchangeError(
        "Não foi possível validar o link. Ele pode ter expirado — peça um novo."
      )
      return
    }

    setExchangeState("ready")
  }, [searchParams])

  useEffect(() => {
    void runExchange()
  }, [runExchange])

  async function onSubmit(values: ResetPasswordFormValues) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      setError("root", { message: error.message })
      return
    }

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (exchangeState === "idle" || exchangeState === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2Icon className="size-8 animate-spin text-zinc-400" aria-hidden />
        <p className="text-sm text-zinc-600">Validando link…</p>
      </div>
    )
  }

  if (exchangeState === "error") {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-900">
          Redefinir senha
        </h2>
        <p className="text-sm text-red-500" role="alert">
          {exchangeError}
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Solicitar novo link
        </Link>
        <Link
          href="/login"
          className="text-sm text-zinc-600 underline underline-offset-4"
        >
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">
          Nova senha
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Escolha uma senha forte com pelo menos 8 caracteres.
        </p>
      </div>

      <FieldGroup className="gap-3">
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="reset-password">Nova senha</FieldLabel>
              <Input
                id="reset-password"
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
              <FieldLabel htmlFor="reset-confirmPassword">
                Confirmar nova senha
              </FieldLabel>
              <Input
                id="reset-confirmPassword"
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

      {formState.errors.root ? (
        <p className="text-sm text-red-500" role="alert">
          {formState.errors.root.message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            Salvando…
          </>
        ) : (
          "Salvar senha"
        )}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline underline-offset-4"
        >
          Voltar ao login
        </Link>
      </p>
    </form>
  )
}
