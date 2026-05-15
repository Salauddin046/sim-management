export async function GET() {

  return Response.json({
    success: true,
    message:
      'Login API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    return Response.json({
      success: true,
      message:
        'Login Success',
      data: body,
    })

  } catch (error) {

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    )
  }
}