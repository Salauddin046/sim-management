export async function POST(req) {

  try {

    const body =
      await req.json()

    const searches =
      body.searches || []

    if (
      searches.length === 0
    ) {

      return Response.json({

        success: false,

        message:
          'No search values',
      })
    }

    const requests =
      searches.map(

        async (search) => {

          try {

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

                    origin:
                      'https://airtelsim.intellicar.in',

                    referer:
                      'https://airtelsim.intellicar.in/debugger',

                    'user-agent':
                      'Mozilla/5.0',
                  },

                  body: JSON.stringify({

                    type:
                      'SIMNO',

                    id:
                      search,

                    accounttype:
                      '1-28',
                  }),
                }
              )

            const apiResponse =
              await response.json()

            return {

              sims:
                apiResponse
                  ?.data
                  ?.sims || [],

              deviceInfo:
                apiResponse
                  ?.data
                  ?.deviceInfo || [],
            }

          } catch {

            return null
          }
        }
      )

    const results =
      await Promise.all(
        requests
      )

    return Response.json({

      success: true,

      results,
    })

  } catch (error) {

    console.log(
      'SIM Explorer ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        'Bulk search failed',
    })
  }
}