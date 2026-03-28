import QRCode from "qrcode"

import type {
  EvolutionConnectionStateResponse,
  EvolutionCreateInstanceResponse,
  EvolutionQrResponse,
  WhatsappInstanceDbStatus,
} from "@/types/evolution"

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  )
}

const base = () => {
  const url = process.env.EVOLUTION_API_URL
  if (!url) throw new Error("EVOLUTION_API_URL is not set")
  return url.replace(/\/$/, "")
}

const evolutionHeaders = () => {
  const key = process.env.EVOLUTION_API_KEY
  if (!key) throw new Error("EVOLUTION_API_KEY is not set")
  return {
    apikey: key,
    "Content-Type": "application/json",
  } as Record<string, string>
}

function instanceNameForOrg(orgId: string): string {
  return `org_${orgId}`
}

/**
 * Cria instância na Evolution API para a organização (`org_{uuid}`).
 * Se EVOLUTION_WEBHOOK_CALLBACK_URL e EVOLUTION_WEBHOOK_SECRET estiverem definidos,
 * configura o webhook automaticamente para receber mensagens.
 */
export async function createInstance(
  orgId: string
): Promise<EvolutionCreateInstanceResponse> {
  const name = instanceNameForOrg(orgId)

  const body: Record<string, unknown> = {
    instanceName: name,
    qrcode: true,
    integration: "WHATSAPP-BAILEYS",
  }

  const callbackUrl = process.env.EVOLUTION_WEBHOOK_CALLBACK_URL?.replace(/\/$/, "")
  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET
  if (callbackUrl && webhookSecret) {
    body.webhook = {
      url: `${callbackUrl}/api/webhooks/evolution`,
      events: ["MESSAGES_UPSERT"],
      headers: { "x-webhook-secret": webhookSecret },
      base64: false,
    }
  }

  const res = await fetchWithTimeout(
    `${base()}/instance/create`,
    {
      method: "POST",
      headers: evolutionHeaders(),
      body: JSON.stringify(body),
    },
    15_000
  )
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Evolution createInstance failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<EvolutionCreateInstanceResponse>
}

/** Nome da instância Evolution para uma org (único por organização). */
export { instanceNameForOrg }

/**
 * Obtém QR code (base64) para conectar o WhatsApp.
 */
export async function getQRCode(
  instanceName: string
): Promise<EvolutionQrResponse> {
  const res = await fetchWithTimeout(
    `${base()}/instance/connect/${instanceName}`,
    { headers: evolutionHeaders() },
    10_000
  )
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Evolution connect/QR failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<EvolutionQrResponse>
}

/**
 * Estado da conexão na Evolution (`open` | `close` | `connecting` em geral).
 */
export async function getConnectionStatus(
  instanceName: string
): Promise<EvolutionConnectionStateResponse> {
  const res = await fetchWithTimeout(
    `${base()}/instance/connectionState/${instanceName}`,
    { headers: evolutionHeaders() },
    10_000
  )
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      `Evolution connectionState failed: ${res.status} ${text}`
    )
  }
  return res.json() as Promise<EvolutionConnectionStateResponse>
}

export async function logoutInstance(
  instanceName: string
): Promise<unknown> {
  const res = await fetchWithTimeout(
    `${base()}/instance/logout/${instanceName}`,
    { method: "DELETE", headers: evolutionHeaders() },
    15_000
  )
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Evolution logout failed: ${res.status} ${text}`)
  }
  return res.json().catch(() => ({}))
}

export async function deleteInstance(
  instanceName: string
): Promise<unknown> {
  const res = await fetchWithTimeout(
    `${base()}/instance/delete/${instanceName}`,
    { method: "DELETE", headers: evolutionHeaders() },
    15_000
  )
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Evolution deleteInstance failed: ${res.status} ${text}`)
  }
  return res.json().catch(() => ({}))
}

/**
 * Extrai ou gera data URL do QR a partir do JSON de `/instance/connect`.
 *
 * Evolution API v2 retorna `{ pairingCode, code, count }` onde `code` é o
 * conteúdo bruto do QR (não base64 de imagem). Versões anteriores retornavam
 * `base64` ou `qrcode.base64` com a imagem pronta.
 */
export async function extractQrDataUrl(raw: EvolutionQrResponse): Promise<string | null> {
  const r = raw as Record<string, unknown>

  // v1 / algumas configs: base64 da imagem pronta
  const direct = r.base64
  if (typeof direct === "string" && direct.length > 0) {
    return direct.startsWith("data:") ? direct : `data:image/png;base64,${direct}`
  }
  const qrcode = r.qrcode
  if (qrcode && typeof qrcode === "object") {
    const q = qrcode as Record<string, unknown>
    const b = q.base64
    if (typeof b === "string" && b.length > 0) {
      return b.startsWith("data:") ? b : `data:image/png;base64,${b}`
    }
  }

  // v2: `code` é o conteúdo bruto do QR — gerar imagem
  const code = r.code
  if (typeof code === "string" && code.length > 0) {
    try {
      return await QRCode.toDataURL(code, { width: 256, margin: 2 })
    } catch {
      return null
    }
  }

  return null
}

/**
 * Mapeia resposta Evolution para status do banco.
 */
export function mapConnectionResponseToDbStatus(
  raw: EvolutionConnectionStateResponse
): WhatsappInstanceDbStatus {
  const r = raw as Record<string, unknown>
  const instance = r.instance
  let state: string | undefined
  if (instance && typeof instance === "object") {
    const i = instance as Record<string, unknown>
    state =
      typeof i.state === "string"
        ? i.state
        : typeof i.connectionStatus === "string"
          ? i.connectionStatus
          : undefined
  }
  if (!state && typeof r.state === "string") state = r.state
  if (!state && typeof r.connectionState === "string")
    state = r.connectionState

  const s = (state ?? "").toLowerCase()
  if (s === "open") return "connected"
  if (s === "connecting") return "connecting"
  return "disconnected"
}

/**
 * Número conectado quando disponível na resposta de estado.
 */
export function extractConnectedPhone(
  raw: EvolutionConnectionStateResponse
): string | null {
  const r = raw as Record<string, unknown>
  const instance = r.instance
  if (instance && typeof instance === "object") {
    const i = instance as Record<string, unknown>
    const wuid = i.wuid
    if (typeof wuid === "string") {
      const digits = wuid.replace(/\D/g, "")
      if (digits.length >= 10) {
        const e164 =
          digits.startsWith("55") && digits.length >= 12
            ? `+${digits}`
            : `+55${digits}`
        return e164
      }
    }
    const pn = i.profilePictureUrl
    if (typeof pn === "string") {
      /* ignore */
    }
  }
  return null
}
