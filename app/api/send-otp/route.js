import { Pool } from 'pg'
import nodemailer from 'nodemailer'

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

    const {
      email,
      username,
    } = body

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    await pool.query(
      `
      UPDATE users
      SET otp = $1
      WHERE username = $2
      `,
      [otp, username]
    )

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <h2>Your OTP</h2>

        <h1>${otp}</h1>
      `,
    })

    return Response.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'OTP failed',
      },
      {
        status: 500,
      }
    )
  }
}