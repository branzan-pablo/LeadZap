"use server"

import { revalidatePath } from "next/cache"

import {
  createInstance,
  extractConnectedPhone,
  extractQrDataUrl,
  getConnectionStatus,
  getQRCode,
  instanceNameForOrg,
  logoutInstance,
  mapConnectionResponseToDbStatus,
} from "@/lib/evolution/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { WhatsappInstanceDbStatus } from "@/types/evolution"

export type WhatsappActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  organizationId: string
  role: "admin" | "user"
}

async function requireOrgContext(): Promise<
  WhatsappActionResult<{ ctx: AuthContext }>
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (error || !profile?.organization_id) {
    return {
      ok: false,
      message: "Organização não encontrada. Conclua o onboarding.",
    }
  }

  return {
    ok: true,
    data: {
      ctx: {
        supabase,
        userId: user.id,
        organizationId: profile.organization_id as string,
        role: profile.role === "admin" ? "admin" : "user",
      },
    },
  }
}

function assertEvolutionConfigured(): void {
  if (!process.env.EVOLUTION_API_URL?.trim() || !process.env.EVOLUTION_API_KEY?.trim()) {
    throw new Error(
      "Evolution API não configurada. Defina EVOLUTION_API_URL e EVOLUTION_API_KEY."
    )
  }
}

/**
 * Garante linha em `whatsapp_instances`, cria instância na Evolution se necessário e retorna QR.
 */
export async function prepareWhatsAppConnection(): Promise<
  WhatsappActionResult<{ qrDataUrl: string }>
> {
  const auth = await requireOrgContext()
  if (!auth.ok) return auth
  if (auth.data.ctx.role !== "admin") {
    return { ok: false, message: "Apenas administradores podem conectar o WhatsApp." }
  }

  const { supabase, organizationId } = auth.data.ctx
  const instanceName = instanceNameForOrg(organizationId)

  try {
    assertEvolutionConfigured()
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Configuração inválida.",
    }
  }

  const { data: existing } = await supabase
    .from("whatsapp_instances")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (!existing) {
    const { error: insErr } = await supabase.from("whatsapp_instances").insert({
      organization_id: organizationId,
      instance_name: instanceName,
      status: "connecting",
    })
    if (insErr) {
      return {
        ok: false,
        message: insErr.message ?? "Não foi possível registrar a instância.",
      }
    }

    try {
      await createInstance(organizationId)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!/409|already|exist/i.test(msg)) {
        console.warn("[prepareWhatsAppConnection] createInstance:", msg)
      }
    }
  }

  let qrRaw: unknown
  try {
    qrRaw = await getQRCode(instanceName)
  } catch {
    try {
      await createInstance(organizationId)
      qrRaw = await getQRCode(instanceName)
    } catch (e2) {
      return {
        ok: false,
        message:
          e2 instanceof Error
            ? e2.message
            : "Não foi possível obter o QR code.",
      }
    }
  }

  const qrDataUrl = await extractQrDataUrl(
    qrRaw as Parameters<typeof extractQrDataUrl>[0]
  )
  if (!qrDataUrl) {
    return {
      ok: false,
      message: "Resposta da Evolution sem QR code. Tente novamente.",
    }
  }

  await supabase
    .from("whatsapp_instances")
    .update({ status: "connecting", updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId)

  revalidatePath("/settings/whatsapp")
  return { ok: true, data: { qrDataUrl } }
}

/**
 * Consulta Evolution, atualiza `whatsapp_instances` e devolve estado atual.
 */
export async function syncWhatsAppInstanceState(): Promise<
  WhatsappActionResult<{
    status: WhatsappInstanceDbStatus
    phone_number: string | null
  }>
> {
  const auth = await requireOrgContext()
  if (!auth.ok) return auth
  if (auth.data.ctx.role !== "admin") {
    return { ok: false, message: "Apenas administradores." }
  }

  const { supabase, organizationId } = auth.data.ctx

  try {
    assertEvolutionConfigured()
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Configuração inválida.",
    }
  }

  const { data: row } = await supabase
    .from("whatsapp_instances")
    .select("instance_name")
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (!row?.instance_name) {
    return {
      ok: true,
      data: { status: "disconnected", phone_number: null },
    }
  }

  let raw: unknown
  try {
    raw = await getConnectionStatus(row.instance_name as string)
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Falha ao consultar status.",
    }
  }

  const status = mapConnectionResponseToDbStatus(
    raw as Parameters<typeof mapConnectionResponseToDbStatus>[0]
  )
  const phone = extractConnectedPhone(
    raw as Parameters<typeof extractConnectedPhone>[0]
  )

  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === "connected") {
    if (phone) patch.phone_number = phone
    patch.last_connected_at = new Date().toISOString()
  }
  if (status === "disconnected") {
    patch.phone_number = null
  }

  await supabase
    .from("whatsapp_instances")
    .update(patch)
    .eq("organization_id", organizationId)

  const { data: fresh } = await supabase
    .from("whatsapp_instances")
    .select("status, phone_number")
    .eq("organization_id", organizationId)
    .single()

  revalidatePath("/settings/whatsapp")

  return {
    ok: true,
    data: {
      status: (fresh?.status as WhatsappInstanceDbStatus) ?? status,
      phone_number: (fresh?.phone_number as string | null) ?? phone,
    },
  }
}

export async function disconnectWhatsAppInstance(): Promise<
  WhatsappActionResult<null>
> {
  const auth = await requireOrgContext()
  if (!auth.ok) return auth
  if (auth.data.ctx.role !== "admin") {
    return { ok: false, message: "Apenas administradores." }
  }

  const { supabase, organizationId } = auth.data.ctx

  try {
    assertEvolutionConfigured()
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Configuração inválida.",
    }
  }

  const { data: row } = await supabase
    .from("whatsapp_instances")
    .select("instance_name")
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (row?.instance_name) {
    try {
      await logoutInstance(row.instance_name as string)
    } catch (e) {
      console.warn("[disconnectWhatsAppInstance] logout:", e)
    }
  }

  await supabase
    .from("whatsapp_instances")
    .update({
      status: "disconnected",
      phone_number: null,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)

  revalidatePath("/settings/whatsapp")
  return { ok: true, data: null }
}

/** Qualquer membro da org: leitura do status (service role, sem expor API key). */
export async function getWhatsAppHeaderStatus(): Promise<
  WhatsappActionResult<{
    status: WhatsappInstanceDbStatus | null
    phone_number: string | null
  }>
> {
  const auth = await requireOrgContext()
  if (!auth.ok) return auth

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: true,
      data: { status: null, phone_number: null },
    }
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from("whatsapp_instances")
    .select("status, phone_number")
    .eq("organization_id", auth.data.ctx.organizationId)
    .maybeSingle()

  return {
    ok: true,
    data: {
      status: (data?.status as WhatsappInstanceDbStatus | null) ?? null,
      phone_number: (data?.phone_number as string | null) ?? null,
    },
  }
}
