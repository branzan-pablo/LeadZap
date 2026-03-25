import type {
  EvolutionWebhookPayload,
  ParsedIncomingWhatsappMessage,
} from "@/types/evolution"

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

function parseMediaType(
  messageType: string,
  message: Record<string, unknown> | null
): ParsedIncomingWhatsappMessage["mediaType"] {
  const t = messageType.toLowerCase()
  if (t.includes("image")) return "image"
  if (t.includes("audio") || t.includes("ptt")) return "audio"
  if (t.includes("video")) return "video"
  if (t.includes("document") || t.includes("sticker")) return "document"
  if (message) {
    if (message.imageMessage) return "image"
    if (message.audioMessage || message.pttMessage) return "audio"
    if (message.videoMessage) return "video"
    if (message.documentMessage) return "document"
  }
  return null
}

function extractTextContent(
  message: Record<string, unknown> | null
): string | null {
  if (!message) return null
  const conv = message.conversation
  if (typeof conv === "string" && conv.length > 0) return conv
  const ext = message.extendedTextMessage
  if (isRecord(ext)) {
    const t = ext.text
    if (typeof t === "string" && t.length > 0) return t
  }
  return null
}

function toDate(ts: unknown): Date {
  if (typeof ts === "number" && Number.isFinite(ts)) {
    const ms = ts < 1e12 ? ts * 1000 : ts
    return new Date(ms)
  }
  if (typeof ts === "string") {
    const n = Number(ts)
    if (Number.isFinite(n)) {
      const ms = n < 1e12 ? n * 1000 : n
      return new Date(ms)
    }
  }
  return new Date()
}

function parseOneUpsert(
  instanceName: string,
  item: unknown
): ParsedIncomingWhatsappMessage | null {
  if (!isRecord(item)) return null

  const key = item.key
  if (!isRecord(key)) return null

  const remoteJid = key.remoteJid
  if (typeof remoteJid !== "string" || !remoteJid.includes("@")) return null

  if (remoteJid.endsWith("@g.us")) return null

  const fromMe = key.fromMe === true
  if (fromMe) return null

  const msgId = key.id
  if (typeof msgId !== "string" || msgId.length === 0) return null

  const message = isRecord(item.message) ? item.message : null

  let messageType =
    typeof item.messageType === "string" ? item.messageType : "unknown"
  if (message && messageType === "unknown") {
    if (message.conversation || message.extendedTextMessage)
      messageType = "conversation"
    else if (message.imageMessage) messageType = "imageMessage"
    else if (message.audioMessage || message.pttMessage)
      messageType = "audioMessage"
    else if (message.videoMessage) messageType = "videoMessage"
    else if (message.documentMessage) messageType = "documentMessage"
  }

  const content = extractTextContent(message)
  const mediaType = parseMediaType(messageType, message)

  const pushName = item.pushName
  const senderName =
    typeof pushName === "string" && pushName.length > 0 ? pushName : null

  const receivedAt = toDate(
    item.messageTimestamp ?? item.messageTimestampLow ?? item.timestamp
  )

  return {
    instanceName,
    remoteJid,
    whatsappMessageId: msgId,
    senderName,
    messageType,
    content: mediaType ? null : content,
    mediaType,
    receivedAt,
    fromMe: false,
  }
}

/**
 * Extrai mensagens recebidas de um payload Evolution API (v2-style).
 * Formatos suportados: `messages.upsert` com `data` objeto ou array;
 * `instance` / `instanceName` no topo.
 */
export function normalizeEvolutionWebhookPayload(
  raw: EvolutionWebhookPayload
): ParsedIncomingWhatsappMessage[] {
  const instanceNameRaw =
    typeof raw.instance === "string"
      ? raw.instance
      : typeof raw.instanceName === "string"
        ? raw.instanceName
        : null

  if (!instanceNameRaw) return []

  const event = typeof raw.event === "string" ? raw.event : ""
  const normalizedEvent = event.toLowerCase().replace(/_/g, ".")

  const data = raw.data
  const items: unknown[] = Array.isArray(data)
    ? data
    : data != null
      ? [data]
      : []

  const looksLikeMessage =
    items.length > 0 &&
    items.some(
      (it) =>
        isRecord(it) &&
        isRecord(it.key) &&
        typeof (it.key as Record<string, unknown>).remoteJid === "string"
    )

  const isUpsertEvent =
    normalizedEvent.includes("messages.upsert") ||
    normalizedEvent.includes("message.upsert")

  if (!isUpsertEvent && !looksLikeMessage) {
    return []
  }

  const out: ParsedIncomingWhatsappMessage[] = []
  for (const item of items) {
    const parsed = parseOneUpsert(instanceNameRaw, item)
    if (parsed) out.push(parsed)
  }
  return out
}
