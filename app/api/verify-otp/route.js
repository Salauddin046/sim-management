import pool from '@/lib/db'

const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 5  // lockout after 5 wrong guesses

export async function POST(req) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const otp = String(body.otp || '').trim()

    if (!email || !otp) {
      return Response.json(
        { success: false, message: 'Email and OTP required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'SELECT otp, created_at, attempts FROM otp_store WHERE LOWER(TRIM(email)) = $1 ORDER BY id DESC LIMIT 1',
      [email]
    )

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, message: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    const { otp: savedOtp, created_at, attempts } = result.rows[0]

    // Check expiry
    const ageMinutes = (Date.now() - new Date(created_at).getTime()) / 60000
    if (ageMinutes > OTP_EXPIRY_MINUTES) {
      await pool.query('DELETE FROM otp_store WHERE LOWER(TRIM(email)) = $1', [email])
      return Response.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempt lockout
    const currentAttempts = attempts || 0
    if (currentAttempts >= MAX_ATTEMPTS) {
      await pool.query('DELETE FROM otp_store WHERE LOWER(TRIM(email)) = $1', [email])
      return Response.json(
        { success: false, message: 'Too many wrong attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    // Wrong OTP — increment attempt counter
    if (String(savedOtp).trim() !== otp) {
      await pool.query(
        'UPDATE otp_store SET attempts = COALESCE(attempts, 0) + 1 WHERE LOWER(TRIM(email)) = $1',
        [email]
      )
      const remaining = MAX_ATTEMPTS - currentAttempts - 1
      return Response.json(
        { success: false, message: `Invalid OTP. ${remaining} attempt(s) remaining.` },
        { status: 400 }
      )
    }

    // Success — delete OTP
    await pool.query('DELETE FROM otp_store WHERE LOWER(TRIM(email)) = $1', [email])

    return Response.json({ success: true, message: 'OTP verified successfully' })
  } catch (error) {
    return Response.json(
      { success: false, message: 'OTP verification failed' },
      { status: 500 }
    )
  }
}
