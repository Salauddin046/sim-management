export async function GET() {

  try {

    const response =
      await fetch(

        'https://airtelsim.intellicar.in/api/v1/airtel/sims/list',

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
              'https://airtelsim.intellicar.in/analysis',

            cookie:
              `PASTE_FULL_COOKIE_HERE`,
          },

          body: JSON.stringify({

            page_no: 1,
          }),
        }
      )

    const text =
      await response.text()

    console.log(text)

    return new Response(
      text,
      {
        headers: {
          'Content-Type':
            'application/json',
        },
      }
    )

  } catch (error) {

    return Response.json({

      success: false,

      message:
        error.message,
    })
  }
}