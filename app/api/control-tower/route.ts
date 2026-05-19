export async function GET(request: Request) {

  try {

    const { searchParams } =
      new URL(request.url)

    const download =
      searchParams.get('download')

    let allRows: any[] = []

    let firstPageRows: any[] = []

    let page = 1

    let hasNext = true

    let totalSimCount = 0

    let initialCount = 0

    let activeCount = 0

    let tempDisconnectCount = 0

    let safeCustodyCount = 0

    let activeTestModeCount = 0

    while (hasNext) {

      console.log(
        `Fetching Page: ${page}`
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

      if (page === 1) {

        firstPageRows = rows
      }

      totalSimCount =
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

        if (
          status.includes('initial')
        ) {

          initialCount++
        }

        if (
          status === 'active'
        ) {

          activeCount++
        }

        if (
          status.includes('temp')
        ) {

          tempDisconnectCount++
        }

        if (
          status.includes('safe')
        ) {

          safeCustodyCount++
        }

        if (
          status.includes('test')
        ) {

          activeTestModeCount++
        }
      })

      if (
        download === 'true'
      ) {

        allRows = [
          ...allRows,
          ...rows,
        ]
      }

      hasNext =
        result?.data?.hasnext || false

      page++

      // NORMAL DASHBOARD
      // COUNT 25 PAGES
      // SHOW ONLY FIRST PAGE

      if (
        download !== 'true'
        &&
        page > 25
      ) {

        break
      }
    }

    const rowsToFormat =

      download === 'true'

      ? allRows

      : firstPageRows

    const formattedData =

      rowsToFormat.map(
        (item: any) => ({

          sim_no:

            item.sim_no
            ||

            item.simnumber
            ||

            item.iccid
            ||

            '-',

          mobile_no:

            item.mobile_no
            ||

            item.mobileno
            ||

            item.msisdn
            ||

            '-',

          status:

            item.status
            ||

            item.simstatus
            ||

            '-',

          activation_date:

            item.activation_date
            ||

            item.activationdate

              ? new Date(

                  item.activation_date
                  ||
                  item.activationdate

                ).toLocaleDateString(
                  'en-GB'
                )

              : '-',

          safeCustody_date:

            item.safe_custody_date
            ||

            item.safecustodydate

              ? new Date(

                  item.safe_custody_date
                  ||
                  item.safecustodydate

                ).toLocaleDateString(
                  'en-GB'
                )

              : '-',
        })
      )

    return Response.json({

      success: true,

      totalCount:
        totalSimCount,

      initialCount,

      activeCount,

      tempDisconnectCount,

      safeCustodyCount,

      activeTestModeCount,

      count:
        formattedData.length,

      data:
        formattedData,
    })

  } catch (error) {

    console.log(
      'CONTROL TOWER ERROR:',
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