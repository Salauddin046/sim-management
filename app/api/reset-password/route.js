export async function GET() {

  return Response.json({
    success: true,
    message:
      'Reset Password API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    const {
      email,
      password,
      otp,
    } = body

    if (
      !email ||
      !password ||
      !otp
    ) {

      return Response.json(
        {
          success: false,
          message:
            'All fields required',
        },
        {
          status: 400,
        }
      )
    }

    if (
      otp !== '123456'
    ) {

      return Response.json(
        {
          success: false,
          message:
            'Invalid OTP',
        },
        {
          status: 401,
        }
      )
    }

    return Response.json({

      success: true,

      message:
        'Password reset successful',
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