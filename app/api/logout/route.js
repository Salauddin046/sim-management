import pool from '@/lib/db'
import { clearSessionCookie, getSession } from '@/lib/auth'

export async function POST(request) {
  // Server-side invalidation: record revoked sessions in DB
  // This means even a replayed old cookie will be rejected
  try {
    const session = await getSession(request)
    if (session?.id) {
      await pool.query(
        `INSERT INTO revoked_sessions (user_id, revoked_at)
         VALUES ($1, NOW())
         ON CONFLICT (user_id) DO UPDATE SET revoked_at = NOW()`,
        [session.id]
      )
    }
  } catch {
    // Don't block logout if DB write fails
  }

  return Response.json(
    { success: true },
    { headers: { 'Set-Cookie': clearSessionCookie() } }
  )
}
