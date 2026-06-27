import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createSessionCookie } from '@/lib/auth'

export async function POST(req) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    // DO NOT trim password — spaces are valid password characters (NIST 800-63B)
    const password = String(body.password || '')

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1',
      [email]
    )

    // Same message for wrong email and wrong password — prevents user enumeration
    const INVALID_MSG = 'Invalid email or password'

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: INVALID_MSG }, { status: 401 })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return Response.json({ success: false, message: INVALID_MSG }, { status: 401 })
    }

    const sessionCookie = createSessionCookie(user)

    return Response.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 200, headers: { 'Set-Cookie': sessionCookie } }
    )
  } catch (error) {
    return Response.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}
