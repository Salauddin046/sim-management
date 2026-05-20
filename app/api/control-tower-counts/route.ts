import { Pool } from 'pg'

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,
})

export async function GET(
  request: Request
) {

  console.log(
    'CONTROL TOWER COUNTS STARTED'
  )

  try {

    const { searchParams } =
      new URL(request.url)

    // START PAGE

    const start =
      Number(
        searchParams.get('start')
      ) || 1

    // END PAGE
    // 50 PAGE BATCH

    const end =
      start + 150

    let page = start

    let hasNext = true

    let totalCount = 0

    let availableCount = 0

    let activeCount = 0

    let activeTestModeCount = 0

    let tempDisconnectCount = 0

    let safeCustodyCount = 0

    // LOOP

    while (
      hasNext
      &&
      page <= end
    ) {

      console.log(
        `Scanning Page ${page}`
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

      // RESPONSE FAILED

      if (!response.ok) {

        console.log(
          `Page ${page} Failed`
        )

        break
      }

      const result =
        await response.json()

      const rows =
        result?.data?.results || []

      // TOTAL COUNT

      totalCount =
        Number(
          result?.data?.totalsim || 0
        )

      // HAS NEXT

      hasNext =
        result?.data?.hasnext || false

      console.log(
        `Rows: ${rows.length}`
      )

      // PROCESS STATUS

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

        console.log(
          'STATUS:',
          status
        )

        // AVAILABLE

        if (
          status === 'initial'
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

      page++
    }

    console.log(
      'FINAL COUNTS:',
      {

        totalCount,

        availableCount,

        activeCount,

        activeTestModeCount,

        tempDisconnectCount,

        safeCustodyCount,
      }
    )

    // CLEAR OLD DATA

    await pool.query(

      `
      DELETE FROM sim_dashboard_counts
      `
    )

    // INSERT NEW DATA

    await pool.query(

      `
      INSERT INTO sim_dashboard_counts (

        total_count,

        available_count,

        active_count,

        active_test_mode_count,

        temp_disconnect_count,

        safe_custody_count

      )

      VALUES ($1,$2,$3,$4,$5,$6)
      `,

      [

        totalCount,

        availableCount,

        activeCount,

        activeTestModeCount,

        tempDisconnectCount,

        safeCustodyCount,
      ]
    )

    return Response.json({

      success: true,

      totalCount,

      availableCount,

      activeCount,

      activeTestModeCount,

      tempDisconnectCount,

      safeCustodyCount,

      scannedTillPage:
        page,
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

          : 'Unknown Error',
    })
  }
}