import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

function ResetFallback() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Loader2Icon className="size-8 animate-spin text-zinc-400" aria-hidden />
      <p className="text-sm text-zinc-600">Carregando…</p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
