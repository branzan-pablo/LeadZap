import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ---------------------------------------------------------------------------
// Simple in-process sliding-window rate limiter (per IP, per instance).
// Adequate for basic abuse prevention; use an external store (e.g. Upstash)
// for distributed enforcement across Vercel instances.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 10       // max requests
const RATE_LIMIT_WINDOW_MS = 60_000  // per 60 seconds

const rateLimitStore = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const hits = (rateLimitStore.get(ip) ?? []).filter((t) => t > cutoff)
  hits.push(now)
  rateLimitStore.set(ip, hits)
  return hits.length > RATE_LIMIT_MAX
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate-limit the push subscription endpoint (10 req / 60 s per IP)
  if (pathname === '/api/push/subscribe') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Webhooks and server-triggered push must not require a browser session
  if (pathname.startsWith('/api/webhooks')) {
    return supabaseResponse
  }
  if (pathname === '/api/push/send') {
    return supabaseResponse
  }
  if (pathname.startsWith('/api/cron')) {
    return supabaseResponse
  }

  // Public routes that don't need auth checks beyond token refresh
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/invite') || pathname.startsWith('/confirm') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password')

  if (isPublicRoute) {
    return supabaseResponse
  }

  // If user is authenticated and trying to access login/signup, redirect to pipeline
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/pipeline'
    return NextResponse.redirect(url)
  }

  // If user is NOT authenticated and trying to access protected routes, redirect to login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check onboarding and admin status for protected routes
  if (user) {
    // Fetch user profile for onboarding and role checks
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed, role, organization_id')
      .eq('id', user.id)
      .single()

    // Redirect to onboarding if not completed (except if already on onboarding page)
    if (profile && !profile.onboarding_completed && pathname !== '/onboarding') {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Redirect away from onboarding if already completed
    if (profile && profile.onboarding_completed && pathname === '/onboarding') {
      const url = request.nextUrl.clone()
      url.pathname = '/pipeline'
      return NextResponse.redirect(url)
    }

    // Restrict /settings/* to admins only
    if (pathname.startsWith('/settings') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/pipeline'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
