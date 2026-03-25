import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"

import { ConfirmEmailClient } from "@/components/auth/confirm-email-client"

function ConfirmFallback() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Loader2Icon className="size-8 animate-spin text-zinc-400" aria-hidden />
      <p className="text-sm text-zinc-600">Carregando…</p>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmFallback />}>
      <ConfirmEmailClient />
    </Suspense>
  )
}
