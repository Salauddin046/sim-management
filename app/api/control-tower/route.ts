export async function GET() {

  try {

    let allData: any[] = []

    let currentPage = 1

    let hasMore = true

    let rawResponse: any = null

    while (hasMore) {

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
                `_hjSessionUser_2360475=eyJpZCI6IjAzODJhMDNlLTA1M2EtNWY4OC1iZmE3LWU2ZmRkZmU0NWEzZiIsImNyZWF0ZWQiOjE3NjM2MzY0MzM5ODUsImV4aXN0aW5nIjp0cnVlfQ==; _ga_3M9X2BV23S=GS2.2.s1763636434$o1$g0$t1763636434$j60$l0$h0; _ga_S5402ZL7BJ=GS2.1.s1773213136$o19$g0$t1773213136$j60$l0$h0; _ga_B1E6WJW876=GS2.2.s1773762881$o21$g0$t1773762881$j60$l0$h0; rootStore={"impPerm":true,"skipImp":"false","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaW5mbyI6eyJ1c2VyaWQiOjEyMTA4LCJ1c2VybmFtZSI6Im9ta2FrYWRlQGludGVsbGljYXIuaW4ifSwiaWF0IjoxNzc2Nzc3MTcyLCJleHAiOjE3ODAzNzcxNzJ9.Ki_RsEGOdx5JOFoahTVHuGftlIOXYbNbY4t2Ck6iKWo","userInfo":"{\\"userid\\":12108,\\"username\\":\\"omkakade@intellicar.in\\"}"}; _ga=GA1.1.844658595.1762511068; _ga_1JEGSSD3EZ=GS2.2.s1776775860$o49$g1$t1776777178$j12$l0$h0; _ga_8KN163DD3E=GS2.1.s1776775859$o33$g1$t1776777212$j60$l0$h0; _clck=1y80ls9%5E2%5Eg5r%5E0%5E2200`,
            },

            body: JSON.stringify({

              page_no:
                currentPage,
            }),

            cache:
              'no-store',
          }
        )

      rawResponse =
        await response.json()

      console.log(
        'RAW RESPONSE:',
        JSON.stringify(
          rawResponse,
          null,
          2
        )
      )

      let pageData: any[] = []

      if (
        Array.isArray(
          rawResponse?.data
        )
      ) {

        pageData =
          rawResponse.data
      }

      else if (

        Array.isArray(
          rawResponse?.data?.sims
        )

      ) {

        pageData =
          rawResponse.data.sims
      }

      else if (

        Array.isArray(
          rawResponse?.data?.rows
        )

      ) {

        pageData =
          rawResponse.data.rows
      }

      else if (

        Array.isArray(
          rawResponse?.sims
        )

      ) {

        pageData =
          rawResponse.sims
      }

      console.log(
        'PAGE:',
        currentPage,
        'RECORDS:',
        pageData.length
      )

      if (
        pageData.length === 0
      ) {

        hasMore = false
      }

      else {

        allData = [

          ...allData,

          ...pageData,
        ]

        currentPage++
      }
    }

    return Response.json({

      success: true,

      totalRecords:
        allData.length,

      sampleData:
        allData.slice(0, 5),

      rawResponse,

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

      error,
    })
  }
}