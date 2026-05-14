export async function GET(
  request
) {

  try {

    const {
      searchParams
    } = new URL(
      request.url
    )

    const sim =
      searchParams.get(
        'sim'
      )

    if (!sim) {

      return Response.json(
        {
          error:
            'SIM number required',
        },
        {
          status: 400,
        }
      )
    }

    const response =
      await fetch(
        'https://airtelsim.intellicar.in/api/v1/airtel/details',
        {
          method: 'POST',

          headers: {

            accept:
              'application/json, text/plain, */*',

            authorization:
              'Basic YWlydGVsYXBpOkFpcnRlSW50ZWxsaWNhckAjMTIzNDU=',

            'content-type':
              'application/json',
          },

          body: JSON.stringify({

            type: 'SIMNO',

            id: sim,

            accounttype:
              '1-28',
          }),
        }
      )

    const data =
      await response.json()

    return Response.json({

      status:
        data?.status ||
        data?.data?.status ||
        '-',

      plan:
        data?.plan ||
        data?.data?.plan ||
        '-',

      fullData:
        data,
    })

  } catch (error) {

    console.error(
      'SIM API Error:',
      error
    )

    return Response.json(
      {
        status: '-',
        plan: '-',
      },
      {
        status: 500,
      }
    )
  }
}