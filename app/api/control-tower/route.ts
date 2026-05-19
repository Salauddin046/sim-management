export async function GET() {

  try {

    let allData: any[] = []

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

              origin:
                'https://airtelsim.intellicar.in',

              referer:
                'https://airtelsim.intellicar.in/analysis',

              cookie:
                `_hjSessionUser_2360475=eyJpZCI6IjAzODJhMDNlLTA1M2EtNWY4OC1iZmE3LWU2ZmRkZmU0NWEzZiIsImNyZWF0ZWQiOjE3NjM2MzY0MzM5ODUsImV4aXN0aW5nIjp0cnVlfQ==;`,
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
        'FULL RESPONSE:',
        result
      )

      let pageData: any[] = []

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
      }

      console.log(
        'PAGE RECORDS:',
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

    return Response.json({

      success: true,

      count:
        allData.length,

      data:
        allData,
    })

  } catch (error: any) {

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