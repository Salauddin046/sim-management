export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    return Response.json({
      success: true,
      message:
        'Login API Working',
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