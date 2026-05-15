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

    if (!numbers) {

      return Response.json(
        {
          success: false,
          message:
            'Numbers required',
        },
        {
          status: 400,
        }
      )
    }

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

      {
        sim_no:
          '89914509006120256846',

        msisdn:
          '9876543210',

        usage_month:
          '2026-03',

        used_data_mb:
          250.67,
      },
    ]

    return Response.json(
      sampleData
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