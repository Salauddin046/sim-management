export async function GET() {

  return new Response(

    JSON.stringify({

      success: true,

      message:
        'Control Tower API Working',
    }),

    {

      status: 200,

      headers: {

        'Content-Type':
          'application/json',
      },
    }
  )
}