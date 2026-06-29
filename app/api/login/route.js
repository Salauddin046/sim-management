export async function POST(req) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return Response.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

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

    if (result.rows.length === 0) {
      return Response.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const user = result.rows[0]

    const bcrypt = await import('bcryptjs')
    const validPassword = await bcrypt.default.compare(password, user.password)

    if (!validPassword) {
      return Response.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    return Response.json({ success: true, message: 'OK', user: { id: user.id, name: user.name, email: user.email } })

  } catch (error) {
    return Response.json({
      success: false,
      message: String(error),
      type: typeof error,
      keys: error ? Object.keys(error) : []
    }, { status: 500 })
  }
}
