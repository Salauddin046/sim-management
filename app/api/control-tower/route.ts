export async function GET(request: Request) {

  try {

    const { searchParams } =
      new URL(request.url)

    const download =
      searchParams.get('download')

    let allRows: any[] = []

    let page = 1

    let hasNext = true

    let totalSimCount = 0

    while (

      hasNext &&

      (
        download === 'true'
          ? true
          : page <= 1
      )
    ) {

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

      totalSimCount =
        Number(
          result?.data?.totalsim || 0
        )

      allRows = [
        ...allRows,
        ...rows,
      ]

      hasNext =
        result?.data?.hasnext || false

      page++
    }

    const formattedData =

      allRows.map(
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

    const activeCount =

      formattedData.filter(

        (item: any) =>

          item.status
            ?.toLowerCase()
            === 'active'

      ).length

    const tempDisconnectCount =

      formattedData.filter(

        (item: any) =>

          item.status
            ?.toLowerCase()
            .includes('temp')

      ).length

    const safeCustodyCount =

      formattedData.filter(

        (item: any) =>

          item.status
            ?.toLowerCase()
            .includes('safe')

      ).length

    return Response.json({

      success: true,

      totalCount:
        totalSimCount,

      activeCount,

      tempDisconnectCount,

      safeCustodyCount,

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