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

    if (
      searches.length > 500
    ) {

      return Response.json({

        success: false,

        message:
          'Maximum 500 searches allowed',
      })
    }

    const requests =
      searches.map(

        async (search) => {

          try {

            const controller =
              new AbortController()

            const timeout =
              setTimeout(

                () =>
                  controller.abort(),

                15000
              )

            const response =
              await fetch(

                'https://airtelsim.intellicar.in/api/v1/airtel/details',

                {

                  method: 'POST',

                  signal:
                    controller.signal,

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

            clearTimeout(
              timeout
            )

            if (
              !response.ok
            ) {

              return {

                sims: [],

                deviceInfo: [],
              }
            }

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

          } catch (error) {

            console.log(
              'SIM SEARCH ERROR:',
              error
            )

            return {

              sims: [],

              deviceInfo: [],
            }
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