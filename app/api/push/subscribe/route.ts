import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Stores push subscription for the authenticated user (Phase 2+).
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // const body = await request.json()
  // await savePushSubscription(user.id, body)

  return NextResponse.json({ ok: true, message: 'Not implemented' }, { status: 501 })
}
