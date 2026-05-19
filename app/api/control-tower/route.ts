export async function GET() {

  try {

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

            page_no: 1,

            limit: 500,
          }),

          cache:
            'no-store',
        }
      )

    const result =
      await response.json()

    console.log(
      'RAW RESPONSE:',
      result
    )

    let rows: any[] = []

    if (
      Array.isArray(
        result?.data?.results
      )
    ) {

      rows =
        result.data.results
    }

    const formattedData =

      rows.map((item: any) => ({

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
          ||

          '-',

        safeCustody_date:

          item.safe_custody_date
          ||

          item.safecustodydate
          ||

          '-',
      }))

    return Response.json({

      success: true,

      count:
        formattedData.length,

      totalSim:
        result?.data?.totalsim,

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