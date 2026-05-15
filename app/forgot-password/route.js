export async function GET() {

  return Response.json({
    success: true,
    message:
      'Forgot Password API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    const {
      email
    } = body

    if (!email) {

      return Response.json(
        {
          success: false,
          message:
            'Email required',
        },
        {
          status: 400,
        }
      )
    }

    const otp =
      Math.floor(
        100000 +
        Math.random() *
          900000
      ).toString()

    console.log(
      'Reset OTP:',
      otp
    )

    return Response.json({

      success: true,

      message:
        'Reset OTP sent successfully',

      otp,
    })

  } catch (error) {

    return Response.json(
      {
        success: false,
        message:
          'Server error',
      },
      {
        status: 500,
      }
    )
  }
}