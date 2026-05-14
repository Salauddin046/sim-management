import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req) {
  try {
    const body = await req.json()

    const { username, password } = body

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1
      AND password = $2
      `,
      [username, password]
    )

    if (result.rows.length === 0) {
      return Response.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    if (!user.approved) {
      return Response.json(
        {
          error: 'Admin approval pending',
        },
        {
          status: 403,
        }
      )
    }

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}