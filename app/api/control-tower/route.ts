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

            cookie:
              `PASTE_FULL_COOKIE_HERE`,
          },

          body: JSON.stringify({

            page_no: 1,
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
      Array.isArray(result)
    ) {

      rows = result
    }

    else if (
      Array.isArray(result.data)
    ) {

      rows = result.data
    }

    else if (
      Array.isArray(result.rows)
    ) {

      rows = result.rows
    }

    else if (
      Array.isArray(
        result?.data?.rows
      )
    ) {

      rows =
        result.data.rows
    }

    else if (
      Array.isArray(
        result?.data?.sims
      )
    ) {

      rows =
        result.data.sims
    }

    const formattedData =

      rows.map((item: any) => ({

        sim_no:

          item.sim_no
          ||

          item.simNumber
          ||

          item.iccid
          ||

          '-',

        mobile_no:

          item.mobile_no
          ||

          item.mobileNumber
          ||

          item.msisdn
          ||

          '-',

        status:

          item.status
          ||

          item.sim_status
          ||

          '-',

        activation_date:

          item.activation_date
          ||

          item.activationDate
          ||

          '-',

        safeCustody_date:

          item.safeCustody_date
          ||

          item.safe_custody_date
          ||

          item.safeCustodyDate
          ||

          '-',
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