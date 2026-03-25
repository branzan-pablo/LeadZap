/** Linha da tabela `messages` para exibição no chat do lead. */
export type MessageView = {
  id: string
  content: string | null
  media_type: "image" | "audio" | "video" | "document" | null
  received_at: string
}
