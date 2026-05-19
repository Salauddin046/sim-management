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

              'accept-language':
                'en-GB,en-US;q=0.9,en;q=0.8',

              authorization:
                'Basic YWlydGVsYXBpOkFpcnRlSW50ZWxsaWNhckAjMTIzNDU=',

              'cache-control':
                'no-cache',

              'content-type':
                'application/json',

              origin:
                'https://airtelsim.intellicar.in',

              pragma:
                'no-cache',

              referer:
                'https://airtelsim.intellicar.in/analysis',

              'user-agent':
                'Mozilla/5.0',

              cookie:
                `_hjSessionUser_2360475=eyJpZCI6IjAzODJhMDNlLTA1M2EtNWY4OC1iZmE3LWU2ZmRkZmU0NWEzZiIsImNyZWF0ZWQiOjE3NjM2MzY0MzM5ODUsImV4aXN0aW5nIjp0cnVlfQ==; rootStore={"impPerm":true,"skipImp":"false","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaW5mbyI6eyJ1c2VyaWQiOjEyMTA4LCJ1c2VybmFtZSI6Im9ta2FrYWRlQGludGVsbGljYXIuaW4ifSwiaWF0IjoxNzc2Nzc3MTcyLCJleHAiOjE3ODAzNzcxNzJ9.Ki_RsEGOdx5JOFoahTVHuGftlIOXYbNbY4t2Ck6iKWo","userInfo":"{\\"userid\\":12108,\\"username\\":\\"omkakade@intellicar.in\\"}"}; _ga=GA1.1.844658595.1762511068`,
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