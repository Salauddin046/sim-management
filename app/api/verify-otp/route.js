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

    // GET ALL OTPS

    const result =
      await pool.query(

        `
        SELECT *
        FROM otp_store

        ORDER BY id DESC
        `
      )

    console.log(
      'ALL OTP ROWS:',
      result.rows
    )

    // FIND MATCHING EMAIL

    const otpRow =
      result.rows.find(

        (row) =>

          String(row.email)
            .trim()
            .toLowerCase()

          ===

          email
      )

    // EMAIL NOT FOUND

    if (!otpRow) {

      return Response.json({

        success: false,

        message:
          'OTP not found',
      })
    }

    console.log(
      'Matched Row:',
      otpRow
    )

    const savedOtp =
      String(
        otpRow.otp
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

        enteredOtp:
          otp,

        savedOtp:
          savedOtp,
      })
    }

    // DELETE AFTER SUCCESS

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