import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req) {
  try {
    const body = await req.json()

    const { username, password } = body

    const existing = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    if (existing.rows.length > 0) {
      return Response.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, password]
    )

    return Response.json({
      message: 'Signup successful',
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: 'Signup failed' },
      { status: 500 }
    )
  }
}