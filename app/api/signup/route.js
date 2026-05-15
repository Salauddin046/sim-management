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

    return Response.json({

      success: true,

      message:
        'Account created successfully',

      user: {
        name,
        email,
      },
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