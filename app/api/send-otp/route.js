import nodemailer from 'nodemailer'
import pool from '@/lib/db'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_COOLDOWN_SECONDS = 60

export async function POST(req) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()

    if (!email || !EMAIL_REGEX.test(email)) {
      return Response.json(
        { success: false, message: 'Valid email required' },
        { status: 400 }
      )
    }

    // Rate limit: prevent resending within cooldown period
    const recentCheck = await pool.query(
      `SELECT created_at FROM otp_store
       WHERE email = $1
       ORDER BY id DESC LIMIT 1`,
      [email]
    )

    if (recentCheck.rows.length > 0) {
      const lastSent = new Date(recentCheck.rows[0].created_at)
      const secondsAgo = (Date.now() - lastSent.getTime()) / 1000
      if (secondsAgo < OTP_COOLDOWN_SECONDS) {
        const waitSecs = Math.ceil(OTP_COOLDOWN_SECONDS - secondsAgo)
        return Response.json(
          { success: false, message: `Please wait ${waitSecs}s before requesting another OTP` },
          { status: 429 }
        )
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Delete old OTPs, insert new one with timestamp
    await pool.query('DELETE FROM otp_store WHERE email = $1', [email])
    await pool.query(
      'INSERT INTO otp_store (email, otp, created_at) VALUES ($1, $2, NOW())',
      [email, otp]
    )

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification - IntelliSIM',
      html: `
        <div style="font-family: Arial; padding: 20px; max-width: 400px;">
          <h2 style="color: #1a1a1a;">SIM Management OTP</h2>
          <p>Your one-time password is:</p>
          <h1 style="letter-spacing: 8px; color: #6d28d9;">${otp}</h1>
          <p style="color: #666;">Valid for 10 minutes. Do not share this with anyone.</p>
        </div>
      `,
    })

    return Response.json({ success: true, message: 'OTP sent successfully' })
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
