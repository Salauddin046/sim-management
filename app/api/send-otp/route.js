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

    const existing = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      OR username = $2
      `,
      [email, username]
    )

    if (existing.rows.length > 0) {
      return Response.json(
        {
          error:
            'User already exists',
        },
        {
          status: 400,
        }
      )
    }

    await pool.query(
      `
      INSERT INTO users (
        email,
        username,
        otp
      )
      VALUES ($1, $2, $3)
      `,
      [email, username, otp]
    )

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      html: `
        <h2>Your OTP</h2>

        <h1>${otp}</h1>
      `,
    })

    return Response.json({
      success: true,
      message: 'OTP sent',
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