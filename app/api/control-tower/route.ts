export async function GET() {

  try {

    let allRows: any[] = []

    let page = 1

    let hasNext = true

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
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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

      console.log(
        `Page ${page} Count:`,
        result?.data?.results?.length
      )

      const rows =
        result?.data?.results || []

      allRows = [
        ...allRows,
        ...rows,
      ]

      hasNext =
        result?.data?.hasnext || false

      page++
    }

    const formattedData =

      allRows.map((item: any) => ({

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

    return Response.json({

      success: true,

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