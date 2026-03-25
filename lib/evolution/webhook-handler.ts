import { createAdminClient } from "@/lib/supabase/admin"
import type { EvolutionWebhookPayload } from "@/types/evolution"
import type { ParsedIncomingWhatsappMessage } from "@/types/evolution"

import { normalizeEvolutionWebhookPayload } from "./normalize-webhook-payload"
import { normalizeBrazilPhoneToE164 } from "@/lib/utils/phone"

const ORG_INSTANCE_PREFIX = /^org_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

function parseOrgIdFromInstanceName(instanceName: string): string | null {
  const m = ORG_INSTANCE_PREFIX.exec(instanceName.trim())
  return m?.[1] ?? null
}

function phoneFromRemoteJid(remoteJid: string): string | null {
  const before = remoteJid.split("@")[0] ?? ""
  const digits = before.replace(/\D/g, "")
  if (digits.length < 10) return null
  return normalizeBrazilPhoneToE164(digits)
}

async function ensureLeadForIncomingMessage(params: {
  admin: ReturnType<typeof createAdminClient>
  organizationId: string
  phoneE164: string
  senderName: string | null
  receivedAt: Date
}): Promise<string> {
  const { admin, organizationId, phoneE164, senderName, receivedAt } = params

  const { data: existing } = await admin
    .from("leads")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("phone", phoneE164)
    .is("deleted_at", null)
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const { data: firstStage, error: stageError } = await admin
    .from("pipeline_stages")
    .select("id")
    .eq("organization_id", organizationId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (stageError || !firstStage?.id) {
    throw new Error("Pipeline sem estágio inicial para criar lead via WhatsApp")
  }

  const name =
    senderName && senderName.trim().length > 0
      ? senderName.trim()
      : phoneE164

  const { data: inserted, error: insertError } = await admin
    .from("leads")
    .insert({
      organization_id: organizationId,
      assigned_to: null,
      pipeline_stage_id: firstStage.id as string,
      name,
      phone: phoneE164,
      email: null,
      company: null,
      source: "whatsapp",
      estimated_value: null,
      notes: null,
      position: 0,
      last_interaction_at: receivedAt.toISOString(),
    })
    .select("id")
    .single()

  if (insertError || !inserted?.id) {
    throw new Error(insertError?.message ?? "Falha ao criar lead via WhatsApp")
  }

  await admin.from("activities").insert({
    organization_id: organizationId,
    lead_id: inserted.id as string,
    user_id: null,
    type: "lead_created",
    metadata: { source: "whatsapp", phone: phoneE164 },
  })

  return inserted.id as string
}

async function processIncomingMessage(
  admin: ReturnType<typeof createAdminClient>,
  msg: ParsedIncomingWhatsappMessage
): Promise<void> {
  const organizationId = parseOrgIdFromInstanceName(msg.instanceName)
  if (!organizationId) {
    console.warn(
      "[evolution-webhook] instanceName inválido:",
      msg.instanceName
    )
    return
  }

  const phoneE164 = phoneFromRemoteJid(msg.remoteJid)
  if (!phoneE164) {
    console.warn("[evolution-webhook] remoteJid sem telefone válido:", msg.remoteJid)
    return
  }

  const leadId = await ensureLeadForIncomingMessage({
    admin,
    organizationId,
    phoneE164,
    senderName: msg.senderName,
    receivedAt: msg.receivedAt,
  })

  const { data: insertedMsg, error: msgError } = await admin
    .from("messages")
    .insert({
      organization_id: organizationId,
      lead_id: leadId,
      whatsapp_message_id: msg.whatsappMessageId,
      sender_phone: phoneE164,
      sender_name: msg.senderName,
      content: msg.content,
      media_type: msg.mediaType,
      is_from_lead: true,
      received_at: msg.receivedAt.toISOString(),
    })
    .select("id")
    .single()

  if (msgError) {
    if (msgError.code === "23505") return
    throw new Error(msgError.message)
  }

  const { error: leadUpdError } = await admin
    .from("leads")
    .update({ last_interaction_at: msg.receivedAt.toISOString() })
    .eq("id", leadId)
    .eq("organization_id", organizationId)

  if (leadUpdError) {
    console.error("[evolution-webhook] update lead:", leadUpdError.message)
  }

  await admin.from("activities").insert({
    organization_id: organizationId,
    lead_id: leadId,
    user_id: null,
    type: "message_received",
    metadata: {
      whatsapp_message_id: msg.whatsappMessageId,
      message_id: insertedMsg?.id ?? null,
    },
  })
}

/**
 * Processa payload do webhook Evolution (mensagens recebidas).
 * Usa service role — não expor ao client.
 */
export async function processWebhook(
  payload: EvolutionWebhookPayload
): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[evolution-webhook] SUPABASE_SERVICE_ROLE_KEY ausente")
    return
  }

  const messages = normalizeEvolutionWebhookPayload(payload)
  if (messages.length === 0) return

  const admin = createAdminClient()
  for (const m of messages) {
    try {
      await processIncomingMessage(admin, m)
    } catch (e) {
      console.error("[evolution-webhook] processIncomingMessage:", e)
    }
  }
}
