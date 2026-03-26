"use client"

import { AlertCircleIcon } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AppError({
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
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <AlertCircleIcon className="mx-auto size-10 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-900">
          Erro ao carregar
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Não foi possível carregar esta página. Tente novamente.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => unstable_retry()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  )
}
