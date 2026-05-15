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

    console.log(
      'BODY:',
      body
    )

    const {
      name,
      email,
      password,
      otp,
    } = body

    global.otpStore =
      global.otpStore || {}

    console.log(
      'Saved OTP:',
      global.otpStore[email]
    )

    if (
      global.otpStore[email] !== otp
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid OTP',
      })
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      )

    console.log(
      'Connecting DB...'
    )

    await pool.query(

      `
      INSERT INTO users
      (
        name,
        email,
        password
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      `,
      [
        name,
        email,
        hashedPassword,
      ]
    )

    console.log(
      'User inserted'
    )

    delete global.otpStore[email]

    return Response.json({

      success: true,

      message:
        'Signup successful',
    })

  } catch (error) {

    console.log(
      'SIGNUP ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        error.message,
    })
  }
}