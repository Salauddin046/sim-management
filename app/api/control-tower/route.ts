export async function GET(request: Request) {

  try {

    const { searchParams } =
      new URL(request.url)

    const search =
      searchParams.get('search') || ''

    const download =
      searchParams.get('download')

    let allRows: any[] = []

    let page = 1

    let hasNext = true

    // FETCH ALL PAGES

    while (hasNext) {

      console.log(
        'Fetching Page:',
        page
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

              limit:
                download === 'true'
                  ? 5000
                  : 500,
            }),

            cache:
              'no-store',
          }
        )

      const result =
        await response.json()

      const rows =
        result?.data?.results || []

      // STOP LOOP

      if (rows.length === 0) {

        hasNext = false

        break
      }

      // FORMAT DATA

      const formattedRows =

        rows.map(
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
          }))
      

      allRows = [

        ...allRows,

        ...formattedRows,
      ]

      page++

      // SAFETY LIMIT

      if (page > 1500) {

        hasNext = false
      }
    }

    console.log(
      'Total Rows:',
      allRows.length
    )

    // GLOBAL SEARCH

    let filteredRows =
      allRows

    if (search) {

      filteredRows =
        allRows.filter((item: any) =>

          item.sim_no
            ?.toString()
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )

          ||

          item.mobile_no
            ?.toString()
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
    }

    return Response.json({

      success: true,

      count:
        filteredRows.length,

      data:
        filteredRows,
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