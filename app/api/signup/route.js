import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      name,
      email,
      username,
      password,
    } = body

    const existing = await pool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1
      OR email = $2
      `,
      [username, email]
    )

    if (existing.rows.length > 0) {
      return Response.json(
        {
          error:
            'Username or email already exists',
        },
        {
          status: 400,
        }
      )
    }

    await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        username,
        password
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        name,
        email,
        username,
        password,
      ]
    )

    return Response.json({
      success: true,
      message:
        'Account created successfully',
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Signup failed',
      },
      {
        status: 500,
      }
    )
  }
}