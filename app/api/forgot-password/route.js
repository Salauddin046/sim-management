import { Pool } from 'pg'
import nodemailer from 'nodemailer'

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

    const email =
      body.email

    if (!email) {

      return Response.json({

        success: false,

        message:
          'Email required',
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

    const otp =
      Math.floor(
        100000 +
        Math.random() *
        900000
      ).toString()

    global.otpStore =
      global.otpStore || {}

    global.otpStore[email] =
      otp

    const transporter =
      nodemailer.createTransport({

        service: 'gmail',

        auth: {

          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASS,
        },
      })

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to: email,

      subject:
        'Reset Password OTP',

      html: `

        <div style="
          font-family: Arial;
          padding: 20px;
        ">

          <h2>
            Password Reset OTP
          </h2>

          <p>
            Your OTP is:
          </p>

          <h1 style="
            letter-spacing: 5px;
          ">
            ${otp}
          </h1>

          <p>
            OTP valid for 5 minutes.
          </p>

        </div>
      `,
    })

    return Response.json({

      success: true,

      message:
        'OTP sent successfully',
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      message:
        'Failed to send OTP',
    })
  }
}