import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      username,
      otp,
    } = body

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE username = $1
      AND otp = $2
      `,
      [username, otp]
    )

    if (result.rows.length === 0) {
      return Response.json(
        {
          error: 'Invalid OTP',
        },
        {
          status: 400,
        }
      )
    }

    await pool.query(
      `
      UPDATE users
      SET otp_verified = TRUE,
          otp = NULL
      WHERE username = $1
      `,
      [username]
    )

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Verification failed',
      },
      {
        status: 500,
      }
    )
  }
}