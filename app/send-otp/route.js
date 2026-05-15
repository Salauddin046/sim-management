import nodemailer from 'nodemailer'

console.log(
  'EMAIL_USER:',
  process.env.EMAIL_USER
)

console.log(
  'EMAIL_PASS:',
  process.env.EMAIL_PASS
)

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
})

export async function POST(req) {

  try {

    const body = await req.json()

    const { email } = body

    if (!email) {

      return Response.json(
        {
          error: 'Email is required',
        },
        {
          status: 400,
        }
      )
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: 'OTP Verification',

      html: `
        <div style="
          font-family: Arial;
          padding: 20px;
        ">

          <h2>
            SIM Managment Sign in OTP
          </h2>

          <h1 style="
            color: blue;
            letter-spacing: 4px;
          ">
            ${otp}
          </h1>

          <p>
            Use this OTP to complete signup.
          </p>

        </div>
      `,
    })

    console.log(
      'MAIL SENT:',
      info.response
    )

    return Response.json({
      success: true,
      otp,
    })

  } catch (error) {

    console.error(
      'OTP ERROR:',
      error
    )

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