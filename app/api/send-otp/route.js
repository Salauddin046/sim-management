import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
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
      html: `<h1>${otp}</h1>`,
    })

    return Response.json({
      success: true,
      otp,
    })

  } catch (error) {

    console.error(error)

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }
}