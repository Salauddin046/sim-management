import { Pool } from 'pg'

const pool =
  new Pool({

    connectionString:
      process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  })

export async function POST(req) {

  try {

    const body =
      await req.json()

    const {
      email,
      otp,
    } = body

    const result =
      await pool.query(

        `
        SELECT *
        FROM otp_store
        WHERE email = $1
        AND otp = $2
        `,
        [
          email,
          otp,
        ]
      )

    if (
      result.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid OTP',
      })
    }

    return Response.json({

      success: true,

      message:
        'OTP verified successfully',
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      message:
        'OTP verification failed',
    })
  }
}