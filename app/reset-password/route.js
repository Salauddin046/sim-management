import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      token,
      password,
    } = body

    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1',
      [token]
    )

    if (result.rows.length === 0) {
      return Response.json(
        {
          error: 'Invalid token',
        },
        {
          status: 400,
        }
      )
    }

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL
      WHERE reset_token = $2
      `,
      [password, token]
    )

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Reset failed',
      },
      {
        status: 500,
      }
    )
  }
}