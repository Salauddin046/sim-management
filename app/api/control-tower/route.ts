export async function GET(
  request: Request
) {

  try {

    const { searchParams } =
      new URL(request.url)

    const download =
      searchParams.get('download')

    let page = 1

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

    // API FAILED

    if (!response.ok) {

      return Response.json({

        success: false,

        message:
          'Failed to fetch Airtel API',
      })
    }

    const result =
      await response.json()

    const rows =
      result?.data?.results || []

    // FORMAT DATA

    const formattedData =

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

            (
              item.activation_date
              ||
              item.activationdate
            )

              ? new Date(

                  item.activation_date
                  ||
                  item.activationdate

                ).toLocaleDateString(
                  'en-GB'
                )

              : '-',

          safeCustody_date:

            (
              item.safe_custody_date
              ||
              item.safecustodydate
            )

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
        Number(
          result?.data?.totalsim || 0
        ),

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

      count: 0,

      totalCount: 0,

      data: [],

      message:

        error instanceof Error

          ? error.message

          : 'Unknown error',
    })
  }
}