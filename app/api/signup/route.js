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
      name,
      email,
      password,
      otp,
    } = body

    if (
      !name ||
      !email ||
      !password ||
      !otp
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

    const existingUser =
      await pool.query(

        `
        SELECT * FROM users
        WHERE email = $1
        `,
        [email]
      )

    if (
      existingUser.rows
        .length > 0
    ) {

      return Response.json({

        success: false,

        message:
          'User already exists',
      })
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
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

    delete global.otpStore[email]

    return Response.json({

      success: true,

      message:
        'Signup successful',
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      message:
        'Signup failed',
    })
  }
}