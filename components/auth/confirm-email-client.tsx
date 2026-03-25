"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

type Status = "loading" | "error"

export function ConfirmEmailClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) {
      setStatus("error")
      setMessage(
        "Link inválido ou incompleto. Abra o link enviado por email ou solicite um novo cadastro."
      )
      return
    }

    let cancelled = false

    void (async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (cancelled) return

      if (error) {
        setStatus("error")
        setMessage(
          "Não foi possível confirmar seu email. O link pode ter expirado — tente cadastrar-se novamente ou peça um novo email de confirmação."
        )
        return
      }

      await supabase.auth.signOut()
      router.replace("/login?confirmed=1")
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2Icon className="size-8 animate-spin text-zinc-400" aria-hidden />
        <p className="text-sm text-zinc-600">Confirmando seu email…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-zinc-900">
        Confirmação de email
      </h2>
      <p className="text-sm text-red-500" role="alert">
        {message}
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline underline-offset-4"
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="text-zinc-600 underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </div>
    </div>
  )
}
