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
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth"

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const { control, handleSubmit, formState } = form
  const { isSubmitting } = formState

  async function onSubmit(values: ForgotPasswordFormValues) {
    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    const { error } = await supabase.auth.resetPasswordForEmail(
      values.email,
      appUrl ? { redirectTo: `${appUrl}/reset-password` } : undefined
    )

    if (error) {
      form.setError("root", { message: error.message })
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-zinc-900">Email enviado</h2>
        <p className="text-sm leading-relaxed text-zinc-600">
          Se esse email estiver cadastrado, você receberá um link para redefinir
          sua senha.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4"
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
          Recuperar senha
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Enviaremos um link para o email cadastrado.
        </p>
      </div>

      <FieldGroup className="gap-3">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                id="forgot-email"
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
            Enviando…
          </>
        ) : (
          "Enviar link"
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
