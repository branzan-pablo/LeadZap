"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth"

type LoginFormProps = {
  emailConfirmed?: boolean
  sessionExpired?: boolean
}

export function LoginForm({ emailConfirmed, sessionExpired }: LoginFormProps) {
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { control, handleSubmit, setError, formState } = form
  const { isSubmitting } = formState

  async function onSubmit(values: LoginFormValues) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setError("root", {
        message: "Email ou senha incorretos",
      })
      return
    }

    router.push("/pipeline")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Entrar</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Acesse sua conta com email e senha.
        </p>
      </div>

      {emailConfirmed ? (
        <p
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
          role="status"
        >
          Email confirmado. Faça login para continuar.
        </p>
      ) : null}

      {sessionExpired ? (
        <p className="text-sm text-red-500" role="alert">
          Sua sessão expirou. Faça login novamente.
        </p>
      ) : null}

      <FieldGroup className="gap-3">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
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
              <div className="flex w-full items-center justify-between gap-2">
                <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
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
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <p className="text-center text-sm text-zinc-600">
        Não tem conta?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline underline-offset-4"
        >
          Criar conta
        </Link>
      </p>
    </form>
  )
}
