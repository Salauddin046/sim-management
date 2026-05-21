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

    const { email } =
      body

    // GENERATE OTP

    const otp =
      Math.floor(

        100000
        +
        Math.random()
        * 900000

      ).toString()

    console.log(
      'Generated OTP:',
      otp
    )

    // DELETE OLD OTP

    await pool.query(

      `
      DELETE FROM otp_store
      WHERE email = $1
      `,

      [email]
    )

    // INSERT NEW OTP

    await pool.query(

      `
      INSERT INTO otp_store (

        email,
        otp

      )

      VALUES ($1,$2)
      `,

      [
        email,
        otp,
      ]
    )

    // SEND EMAIL HERE

    return Response.json({

      success: true,

      otp, // REMOVE LATER
    })

  } catch (error) {

    console.log(
      'SEND OTP ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        'Failed to send OTP',
    })
  }
}