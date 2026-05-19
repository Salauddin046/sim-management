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
        `Counting Page: ${page}`
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

      const result =
        await response.json()

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
          status.includes('available')
        ) {

          availableCount++
        }

        // ACTIVE

        if (
          status === 'active'
        ) {

          activeCount++
        }

        // ACTIVE TEST MODE

        if (
          status.includes('test')
        ) {

          activeTestModeCount++
        }

        // TEMP DISCONNECT

        if (
          status.includes('temp')
        ) {

          tempDisconnectCount++
        }

        // SAFE CUSTODY

        if (
          status.includes('safe')
        ) {

          safeCustodyCount++
        }
      })

      hasNext =
        result?.data?.hasnext || false

      page++
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
      'CONTROL TOWER COUNT ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:

        error instanceof Error

          ? error.message

          : 'Unknown error',
    })
  }
}