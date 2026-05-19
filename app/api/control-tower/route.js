export async function GET() {

  try {

    let allData = []

    let currentPage = 1

    let hasMore = true

    while (hasMore) {

      console.log(
        'Fetching Page:',
        currentPage
      )

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
            },

            body: JSON.stringify({

              page_no:
                currentPage,
            }),

            cache:
              'no-store',
          }
        )

      const result =
        await response.json()

      console.log(
        'API RESPONSE:',
        JSON.stringify(
          result,
          null,
          2
        )
      )

      let pageData = []

      if (
        Array.isArray(
          result?.data
        )
      ) {

        pageData =
          result.data

      } else if (

        Array.isArray(
          result?.data?.sims
        )

      ) {

        pageData =
          result.data.sims

      } else if (

        Array.isArray(
          result?.data?.rows
        )

      ) {

        pageData =
          result.data.rows

      } else if (

        Array.isArray(
          result?.sims
        )

      ) {

        pageData =
          result.sims

      } else {

        pageData = []
      }

      console.log(
        'PAGE DATA:',
        pageData.length
      )

      if (
        pageData.length === 0
      ) {

        hasMore = false

      } else {

        allData = [

          ...allData,

          ...pageData,
        ]

        currentPage++
      }
    }

    console.log(
      'TOTAL RECORDS:',
      allData.length
    )

    return Response.json({

      success: true,

      count:
        allData.length,

      data:
        allData,
    })

  } catch (error) {

    console.log(
      'CONTROL TOWER ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        error.message,
    })
  }
}