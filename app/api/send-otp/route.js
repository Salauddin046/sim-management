export async function GET() {

  return Response.json({

    success: true,

    message:
      'Send OTP API Working',
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
      'Generated OTP:',
      otp
    )

    return Response.json({

      success: true,

      message:
        'OTP sent successfully',

      otp,
    })

  } catch (error) {

    console.error(
      error
    )

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