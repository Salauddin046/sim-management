import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    // DO NOT trim password — spaces are valid password characters (NIST 800-63B)
    const password = String(body.password || '')

    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: 'All fields required' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return Response.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (password.length > 128) {
      return Response.json(
        { success: false, message: 'Password too long (max 128 characters)' },
        { status: 400 }
      )
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    )

    if (existing.rows.length > 0) {
      return Response.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      )
    }

    // 12 rounds: ~250ms per hash — better than 10 for 2024 hardware
    const hashedPassword = await bcrypt.hash(password, 12)

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    )

    return Response.json({ success: true, message: 'Signup successful' })
  } catch (error) {
    return Response.json(
      { success: false, message: 'Signup failed' },
      { status: 500 }
    )
  }
}
