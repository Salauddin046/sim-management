import { Pool } from 'pg'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(req) {
  try {
    const body = await req.json()

    const { email } = body

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    )

    if (result.rows.length === 0) {
      return Response.json(
        {
          error: 'Email not found',
        },
        {
          status: 404,
        }
      )
    }

    const token = crypto
      .randomBytes(32)
      .toString('hex')

    await pool.query(
      `
      UPDATE users
      SET reset_token = $1
      WHERE email = $2
      `,
      [token, email]
    )

    const resetLink =
      `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      html: `
        <h2>Reset Password</h2>

        <a href="${resetLink}"
           style="
             background:black;
             color:white;
             padding:12px 20px;
             text-decoration:none;
             border-radius:6px;
             display:inline-block;
           ">
           Reset Password
        </a>
      `,
    })

    return Response.json({
      success: true,
      message: 'Reset link sent',
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Failed',
      },
      {
        status: 500,
      }
    )
  }
}