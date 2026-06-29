import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      )
    }

    // Inline pool to avoid import issues
    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })

    const result = await pool.query(
      'SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1',
      [email]
    )

    await pool.end()

    const INVALID_MSG = 'Invalid email or password'

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: INVALID_MSG }, { status: 401 })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return Response.json({ success: false, message: INVALID_MSG }, { status: 401 })
    }

    // Inline session cookie to avoid auth.js import
    const { createHmac } = await import('crypto')
    const secret = process.env.SESSION_SECRET || ''
    const payload = { id: user.id, name: user.name, email: user.email }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const sig = createHmac('sha256', secret).update(encoded).digest('base64url')
    const token = `${encoded}.${sig}`
    const sessionCookie = `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`

    return Response.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 200, headers: { 'Set-Cookie': sessionCookie } }
    )

  } catch (error) {
    const msg = error?.message || error?.toString() || 'Unknown error'
    console.error('LOGIN CRASH:', msg)
    return Response.json(
      { success: false, message: msg },
      { status: 500 }
    )
  }
}
