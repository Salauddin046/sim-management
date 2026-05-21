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

    // CLEAN VALUES

    email =
      String(email)
        .trim()
        .toLowerCase()

    otp =
      Number(
        String(otp).trim()
      )

    console.log(
      'Entered OTP:',
      otp
    )

    // GET LATEST OTP

    const result =
      await pool.query(

        `
        SELECT otp

        FROM otp_store

        WHERE LOWER(email) = LOWER($1)

        ORDER BY id DESC

        LIMIT 1
        `,

        [email]
      )

    // OTP NOT FOUND

    if (
      result.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'OTP not found',
      })
    }

    // DB OTP

    const savedOtp =
      Number(
        result.rows[0].otp
      )

    console.log(
      'Saved OTP:',
      savedOtp
    )

    // MATCH

    if (
      savedOtp !== otp
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid OTP',
      })
    }

    // DELETE OTP AFTER SUCCESS

    await pool.query(

      `
      DELETE FROM otp_store

      WHERE LOWER(email) = LOWER($1)
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