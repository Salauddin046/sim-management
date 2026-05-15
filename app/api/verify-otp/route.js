export async function GET() {

  return Response.json({
    success: true,
    message:
      'Verify OTP API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    const {
      otp
    } = body

    if (!otp) {

      return Response.json(
        {
          success: false,
          message:
            'OTP required',
        },
        {
          status: 400,
        }
      )
    }

    if (
      otp === '123456'
    ) {

      return Response.json({

        success: true,

        message:
          'OTP Verified Successfully',
      })
    }

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