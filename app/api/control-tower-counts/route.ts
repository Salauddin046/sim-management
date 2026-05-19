export async function GET() {

  try {

    let page = 1

    let hasNext = true

    let totalCount = 0

    let availableCount = 0

    let activeCount = 0

    let activeTestModeCount = 0

    let tempDisconnectCount = 0

    let safeCustodyCount = 0

    while (hasNext) {

      console.log(
        `Fetching Count Page: ${page}`
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

              'user-agent':
                'Mozilla/5.0',
            },

            body: JSON.stringify({

              page_no: page,

              limit: 500,
            }),

            cache:
              'no-store',
          }
        )

      // RESPONSE ERROR

      if (!response.ok) {

        return Response.json({

          success: false,

          message:
            'Failed to fetch Airtel data',
        })
      }

      const result =
        await response.json()

      console.log(
        'COUNT API RESULT:',
        result
      )

      const rows =
        result?.data?.results || []

      totalCount =
        Number(
          result?.data?.totalsim || 0
        )

      rows.forEach((item: any) => {

        const status =
          (
            item.status
            ||
            item.simstatus
            ||
            ''
          )
          .toLowerCase()

        // AVAILABLE

        if (
          status.includes(
            'available'
          )
        ) {

          availableCount++
        }

        // ACTIVE

        if (
          status === 'active'
        ) {

          activeCount++
        }

        // TEST MODE

        if (
          status.includes(
            'test'
          )
        ) {

          activeTestModeCount++
        }

        // TEMP DISCONNECT

        if (
          status.includes(
            'temp'
          )
        ) {

          tempDisconnectCount++
        }

        // SAFE CUSTODY

        if (
          status.includes(
            'safe'
          )
        ) {

          safeCustodyCount++
        }
      })

      hasNext =
        result?.data?.hasnext || false

      page++

      // LIMIT FOR FAST DASHBOARD

      if (page > 25) {

        break
      }
    }

    return Response.json({

      success: true,

      totalCount,

      availableCount,

      activeCount,

      activeTestModeCount,

      tempDisconnectCount,

      safeCustodyCount,
    })

  } catch (error) {

    console.log(
      'CONTROL TOWER COUNTS ERROR:',
      error
    )

    return Response.json({

      success: false,

      totalCount: 0,

      availableCount: 0,

      activeCount: 0,

      activeTestModeCount: 0,

      tempDisconnectCount: 0,

      safeCustodyCount: 0,

      message:

        error instanceof Error

          ? error.message

          : 'Unknown error',
    })
  }
}