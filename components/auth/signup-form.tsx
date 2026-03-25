"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
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
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth"

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("already") || lower.includes("registered")) {
    return "Este email já possui uma conta. Faça login ou recupere sua senha."
  }
  return message
}

export function SignupForm() {
  const [done, setDone] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { control, handleSubmit, formState } = form
  const { isSubmitting } = formState

  async function onSubmit(values: SignupFormValues) {
    setRootError(null)
    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name },
        ...(appUrl ? { emailRedirectTo: `${appUrl}/confirm` } : {}),
      },
    })

    if (error) {
      setRootError(mapSignUpError(error.message))
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900">Quase lá</h2>
        <p className="text-sm leading-relaxed text-zinc-600">
          Verifique seu email para confirmar sua conta. Depois você poderá
          entrar com email e senha.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Criar conta</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Preencha os dados para começar no LeadZap.
        </p>
      </div>

      <FieldGroup className="gap-3">
        <Controller
          name="full_name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="signup-full_name">Nome completo</FieldLabel>
              <Input
                id="signup-full_name"
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
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
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
              <FieldLabel htmlFor="signup-password">Senha</FieldLabel>
              <Input
                id="signup-password"
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
              <FieldLabel htmlFor="signup-confirmPassword">
                Confirmar senha
              </FieldLabel>
              <Input
                id="signup-confirmPassword"
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
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            Cadastrando…
          </>
        ) : (
          "Cadastrar"
        )}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline underline-offset-4"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
