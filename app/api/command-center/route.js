export async function POST(req) {

  try {

    const body =
      await req.json()

    const search =
      body.search

    if (!search) {

      return Response.json({

        success: false,

        message:
          'Search value required',
      })
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

    const text =
      await response.text()

    console.log(
      'API RESPONSE:',
      text
    )

    let data = {}

    try {

      data =
        JSON.parse(text)

    } catch {

      return Response.json({

        success: false,

        message:
          'Invalid API response',
      })
    }

    return Response.json({

      success: true,

      data,
    })

  } catch (error) {

    console.log(
      'COMMAND CENTER ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        error.message ||
        'Search failed',
    })
  }
}