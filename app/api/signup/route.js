export async function GET() {

  return Response.json({

    success: true,

    message:
      'Signup API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    const {
      name,
      email,
      password,
    } = body

    if (
      !name ||
      !email ||
      !password
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

    const user = {

      name,

      email,
    }

    return Response.json({

      success: true,

      message:
        'Account created successfully',

      user,
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