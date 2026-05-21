import { Pool } from 'pg'

import nodemailer
from 'nodemailer'

const pool =
  new Pool({

    connectionString:
      process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  })

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

export async function POST(req) {

  try {

    const body =
      await req.json()

    let { email } =
      body

    // CLEAN EMAIL

    email =
      String(email)
        .trim()
        .toLowerCase()

    // VALIDATE

    if (!email) {

      return Response.json({

        success: false,

        message:
          'Email required',
      })
    }

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

    // SEND MAIL

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to: email,

      subject:
        'OTP Verification',

      html: `

        <div style="
          font-family: Arial;
          padding: 20px;
        ">

          <h2>
            SIM Management OTP
          </h2>

          <h1>
            ${otp}
          </h1>

          <p>
            Valid for 10 minutes
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