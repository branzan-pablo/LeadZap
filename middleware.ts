import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const { pathname } = request.nextUrl

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
