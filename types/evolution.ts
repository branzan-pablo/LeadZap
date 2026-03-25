/** Status armazenado em `whatsapp_instances.status` */
export type WhatsappInstanceDbStatus =
  | "connected"
  | "disconnected"
  | "connecting"

/** Payload bruto do POST do webhook (Evolution varia por versão / evento). */
export type EvolutionWebhookPayload = Record<string, unknown>

/** Mensagem recebida normalizada após parse do webhook. */
export type ParsedIncomingWhatsappMessage = {
  instanceName: string
  remoteJid: string
  whatsappMessageId: string
  senderName: string | null
  messageType: string
  content: string | null
  mediaType: "image" | "audio" | "video" | "document" | null
  receivedAt: Date
  fromMe: boolean
}

export type EvolutionCreateInstanceResponse = Record<string, unknown>

export type EvolutionQrResponse = Record<string, unknown>

export type EvolutionConnectionStateResponse = Record<string, unknown>
