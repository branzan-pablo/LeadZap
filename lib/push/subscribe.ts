import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"

const pushSubscribeBodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export type PushSubscribeBody = z.infer<typeof pushSubscribeBodySchema>

export async function upsertPushSubscription(
  supabase: SupabaseClient,
  userId: string,
  raw: unknown
): Promise<{ ok: true } | { ok: false; message: string; status: number }> {
  const parsed = pushSubscribeBodySchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Payload inválido"
    return { ok: false, message: msg, status: 400 }
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
    { onConflict: "endpoint" }
  )

  if (error) {
    return {
      ok: false,
      message: error.message ?? "Não foi possível salvar a subscription.",
      status: 500,
    }
  }

  return { ok: true }
}
