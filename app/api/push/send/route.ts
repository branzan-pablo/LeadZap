import { NextResponse } from 'next/server'

/**
 * Triggered by cron or internal jobs. Protect with a shared secret header in production.
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const token = process.env.PUSH_SEND_SECRET
  if (token && auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // await sendWebPushToUser(...)

  return NextResponse.json({ ok: true, message: 'Not implemented' }, { status: 501 })
}
