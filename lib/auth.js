import { createHmac, timingSafeEqual } from 'crypto'
import pool from '@/lib/db'

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET env var missing or too short (min 32 chars)')
  }
  return secret
}

function sign(data) {
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(encoded).digest('base64url')
  return `${encoded}.${sig}`
}

function verify(token) {
  if (!token || !token.includes('.')) return null
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null

  const expectedSig = createHmac('sha256', getSecret()).update(encoded).digest('base64url')

  try {
    const sigBuf = Buffer.from(sig)
    const expectedBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expectedBuf.length) return null
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null
  } catch {
    return null
  }

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'))
  } catch {
    return null
  }
}

export async function getSession(request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/session=([^;]+)/)
  if (!match) return null

  const session = verify(match[1])
  if (!session?.id || !session?.email) return null

  // Check if session was revoked server-side (logout invalidation)
  try {
    const revoked = await pool.query(
      'SELECT revoked_at FROM revoked_sessions WHERE user_id = $1 LIMIT 1',
      [session.id]
    )
    if (revoked.rows.length > 0) return null
  } catch {
    // If DB check fails, still allow (fail open for availability)
    // In high-security apps, fail closed here instead
  }

  return session
}

export function createSessionCookie(user) {
  const payload = { id: user.id, name: user.name, email: user.email }
  const token = sign(payload)
  return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
}

export function clearSessionCookie() {
  return `session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}
