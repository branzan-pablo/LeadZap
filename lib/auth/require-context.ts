import { createClient } from "@/lib/supabase/server"

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string }

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  organizationId: string
  role: "admin" | "user"
  fullName: string | null
}

/**
 * Validates the current session and returns an authenticated context with
 * the user's organization. Returns `{ ok: false }` if the user is not
 * authenticated or has not completed onboarding.
 */
export async function requireOrgContext(): Promise<
  ActionResult<{ ctx: AuthContext }>
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
    .select("organization_id, role, full_name")
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
        organizationId: profile.organization_id,
        role: profile.role === "admin" ? "admin" : "user",
        fullName: profile.full_name ?? null,
      },
    },
  }
}

/**
 * Like `requireOrgContext` but additionally asserts that the authenticated
 * user has the "admin" role. Returns `{ ok: false }` otherwise.
 */
export async function requireAdminContext(): Promise<
  ActionResult<{ ctx: AuthContext }>
> {
  const result = await requireOrgContext()
  if (!result.ok) return result

  if (result.data.ctx.role !== "admin") {
    return { ok: false, message: "Apenas administradores podem fazer isso." }
  }

  return result
}
