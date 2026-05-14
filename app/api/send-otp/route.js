import nodemailer from 'nodemailer'

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

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Your OTP Code</h2>

          <h1>${otp}</h1>

          <p>
            This OTP is valid for signup verification.
          </p>
        </div>
      `,
    })

    return Response.json({
      success: true,
      otp,
    })

  } catch (error) {
    console.error('OTP ERROR:', error)

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