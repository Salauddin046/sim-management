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
      String(otp)
        .trim()

    console.log(
      'Entered Email:',
      email
    )

    console.log(
      'Entered OTP:',
      otp
    )

    // FETCH LATEST OTP

    const result =
      await pool.query(

        `
        SELECT *

        FROM otp_store

        WHERE LOWER(TRIM(email))
        =
        LOWER(TRIM($1))

        ORDER BY id DESC

        LIMIT 1
        `,

        [email]
      )

    console.log(
      'DB Result:',
      result.rows
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
      String(
        result.rows[0].otp
      ).trim()

    console.log(
      'Saved OTP:',
      savedOtp
    )

    // MATCH OTP

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

      WHERE LOWER(TRIM(email))
      =
      LOWER(TRIM($1))
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