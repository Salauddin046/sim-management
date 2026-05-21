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

    let {
      email,
      otp,
    } = body

    // CLEAN OTP

    otp =
      String(otp)
        .trim()

    // GET LATEST OTP

    const result =
      await pool.query(

        `
        SELECT *
        FROM otp_store

        WHERE email = $1

        ORDER BY id DESC

        LIMIT 1
        `,

        [email]
      )

    // NO OTP FOUND

    if (
      result.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'OTP not found',
      })
    }

    const savedOtp =
      String(
        result.rows[0].otp
      ).trim()

    console.log(
      'Saved OTP:',
      savedOtp
    )

    console.log(
      'Entered OTP:',
      otp
    )

    // OTP MISMATCH

    if (
      savedOtp !== otp
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid OTP',
      })
    }

    // OPTIONAL:
    // DELETE OTP AFTER SUCCESS

    await pool.query(

      `
      DELETE FROM otp_store
      WHERE email = $1
      `,

      [email]
    )

    return Response.json({

      success: true,

      message:
        'OTP verified successfully',
    })

  } catch (error) {

    console.log(
      'VERIFY OTP ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        'OTP verification failed',
    })
  }
}