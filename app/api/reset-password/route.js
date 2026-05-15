import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

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
      newPassword,
    } = body

    if (
      !email ||
      !otp ||
      !newPassword
    ) {

      return Response.json({

        success: false,

        message:
          'All fields are required',
      })
    }

    global.otpStore =
      global.otpStore || {}

    const savedOtp =
      global.otpStore[email]

    if (
      !savedOtp
    ) {

      return Response.json({

        success: false,

        message:
          'OTP expired',
      })
    }

    if (
      savedOtp !== otp
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid OTP',
      })
    }

    const user =
      await pool.query(

        `
        SELECT * FROM users
        WHERE email = $1
        `,
        [email]
      )

    if (
      user.rows.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'User not found',
      })
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      )

    await pool.query(

      `
      UPDATE users
      SET password = $1
      WHERE email = $2
      `,
      [
        hashedPassword,
        email,
      ]
    )

    delete global.otpStore[email]

    return Response.json({

      success: true,

      message:
        'Password reset successful',
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      message:
        'Password reset failed',
    })
  }
}