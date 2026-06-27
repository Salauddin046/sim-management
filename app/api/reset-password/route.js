import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

const OTP_EXPIRY_MINUTES = 5

export async function POST(req) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const otp = String(body.otp || '').trim()
    const newPassword = String(body.newPassword || '').trim()

    if (!email || !otp || !newPassword) {
      return Response.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return Response.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Fetch OTP from DB
    const otpResult = await pool.query(
      'SELECT otp, created_at FROM otp_store WHERE LOWER(TRIM(email)) = $1 ORDER BY id DESC LIMIT 1',
      [email]
    )

    if (otpResult.rows.length === 0) {
      return Response.json(
        { success: false, message: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    const { otp: savedOtp, created_at } = otpResult.rows[0]

    // Expiry check
    const ageMinutes = (Date.now() - new Date(created_at).getTime()) / 60000
    if (ageMinutes > OTP_EXPIRY_MINUTES) {
      await pool.query('DELETE FROM otp_store WHERE LOWER(TRIM(email)) = $1', [email])
      return Response.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (String(savedOtp).trim() !== otp) {
      return Response.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    )

    // Remove OTP after successful use
    await pool.query('DELETE FROM otp_store WHERE LOWER(TRIM(email)) = $1', [email])

    return Response.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    return Response.json(
      { success: false, message: 'Password reset failed' },
      { status: 500 }
    )
  }
}
