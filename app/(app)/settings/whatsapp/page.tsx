import Link from "next/link"
import { redirect } from "next/navigation"

import { WhatsAppConnectPanel } from "@/components/whatsapp/whatsapp-connect-panel"
import { createClient } from "@/lib/supabase/server"
export default async function SettingsWhatsAppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) {
    redirect("/onboarding")
  }

  const isAdmin = profile.role === "admin"

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">WhatsApp</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Conexão via Evolution API (somente leitura). Mensagens recebidas
        aparecem nos leads automaticamente.
      </p>

      <div className="mt-6 max-w-lg">
        <WhatsAppConnectPanel isAdmin={isAdmin} />
      </div>

      {!isAdmin ? (
        <Link
          href="/pipeline"
          className="mt-4 inline-block text-sm font-medium text-zinc-700 underline-offset-4 hover:underline"
        >
          Voltar ao pipeline
        </Link>
      ) : null}
    </div>
  )
}
