"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-zinc-900">
          Algo deu errado
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => unstable_retry()}>
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </div>
      </div>
    </div>
  )
}
