import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
let cspConnectSrc = "'self'"
if (supabaseUrl) {
  try {
    const { host } = new URL(supabaseUrl)
    cspConnectSrc = `'self' ${supabaseUrl} https://${host} wss://${host}`
  } catch {
    // malformed URL — fallback to self only
  }
}

const csp = [
  "default-src 'self'",
  `connect-src ${cspConnectSrc}`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // unsafe-eval needed by Next.js App Router hydration; tighten with nonce in a future hardening pass
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ")

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
