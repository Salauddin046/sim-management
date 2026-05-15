export async function GET() {

  return Response.json({

    success: true,

    message:
      'SIM API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    const {
      numbers
    } = body

    const sampleData = [

      {
        sim_no:
          '89914509006120256846',

        msisdn:
          '9876543210',

        usage_month:
          '2026-01',

        used_data_mb:
          120.45,
      },

      {
        sim_no:
          '89914509006120256846',

        msisdn:
          '9876543210',

        usage_month:
          '2026-02',

        used_data_mb:
          98.22,
      },
    ]

    return Response.json(
      sampleData
    )

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