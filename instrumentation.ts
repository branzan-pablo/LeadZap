/**
 * Next.js instrumentation hook — runs once on server startup (Node.js runtime only).
 * Validates that all required environment variables are present so misconfigured
 * deployments fail fast with a clear error instead of failing silently at runtime.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only validate on the server (not in the Edge runtime or client bundles)
  if (process.env.NEXT_RUNTIME === "edge") return

  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "EVOLUTION_API_URL",
    "EVOLUTION_API_KEY",
    "EVOLUTION_WEBHOOK_SECRET",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
    "NEXT_PUBLIC_APP_URL",
    "PUSH_SEND_SECRET",
    "CRON_SECRET",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `[startup] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nSee .env.example for the full list.`
    )
  }
}
