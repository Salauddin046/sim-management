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

    if (
      !numbers ||
      !Array.isArray(
        numbers
      )
    ) {

      return Response.json(
        {
          success: false,
          message:
            'Numbers array required',
        },
        {
          status: 400,
        }
      )
    }

    const sampleData = []

    numbers.forEach(
      (
        sim,
        index
      ) => {

        sampleData.push(

          {
            sim_no:
              sim,

            msisdn:
              `98765432${index}`,

            usage_month:
              '2026-01',

            used_data_mb:
              (
                Math.random() *
                500
              ).toFixed(2),
          },

          {
            sim_no:
              sim,

            msisdn:
              `98765432${index}`,

            usage_month:
              '2026-02',

            used_data_mb:
              (
                Math.random() *
                500
              ).toFixed(2),
          },

          {
            sim_no:
              sim,

            msisdn:
              `98765432${index}`,

            usage_month:
              '2026-03',

            used_data_mb:
              (
                Math.random() *
                500
              ).toFixed(2),
          },

          {
            sim_no:
              sim,

            msisdn:
              `98765432${index}`,

            usage_month:
              '2026-04',

            used_data_mb:
              (
                Math.random() *
                500
              ).toFixed(2),
          },

          {
            sim_no:
              sim,

            msisdn:
              `98765432${index}`,

            usage_month:
              '2026-05',

            used_data_mb:
              (
                Math.random() *
                500
              ).toFixed(2),
          }
        )
      }
    )

    return Response.json(
      sampleData
    )

  } catch (error) {

    console.error(
      error
    )

    return Response.json(
      {
        success: false,
        message:
          'Server Error',
      },
      {
        status: 500,
      }
    )
  }
}