export async function POST(req) {

  try {

    const body =
      await req.json()

    const email =
      body.email

    const otp =
      body.otp

    if (
      !email ||
      !otp
    ) {

      return Response.json({

        success: false,

        message:
          'Email and OTP required',
      })
    }

    global.otpStore =
      global.otpStore || {}

    const savedOtp =
      global.otpStore[email]

    if (
      !savedOtp
    ) {

      return Response.json({

        success: false,

        message:
          'OTP expired or not found',
      })
    }

    if (
      savedOtp !== otp
    ) {

      return Response.json({

        success: false,

        message:
          'Invalid OTP',
      })
    }

    delete global.otpStore[email]

    return Response.json({

      success: true,

      message:
        'OTP verified successfully',
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      message:
        'OTP verification failed',
    })
  }
}