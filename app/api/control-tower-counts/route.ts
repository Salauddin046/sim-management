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
    // SCAN 25 PAGES

    const end =
      start + 25

    let page = start

    let hasNext = true

    // CURRENT BATCH COUNTS

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

      // API FAILED

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

      // TOTAL SIM

      totalCount =
        Number(
          result?.data?.totalsim || 0
        )

      // NEXT PAGE

      hasNext =
        result?.data?.hasnext || false

      console.log(
        `Rows Found: ${rows.length}`
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
          status ===
          'safe_custody'
        ) {

          safeCustodyCount++
        }
      })

      page++
    }

    // CHECK EXISTING DATA

    const existing =
      await pool.query(

        `
        SELECT *
        FROM sim_dashboard_counts
        LIMIT 1
        `
      )

    // UPDATE EXISTING ROW

    if (
      existing.rows.length > 0
    ) {

      await pool.query(

        `
        UPDATE sim_dashboard_counts

        SET

        total_count = $1,

        available_count =
          available_count + $2,

        active_count =
          active_count + $3,

        active_test_mode_count =
          active_test_mode_count + $4,

        temp_disconnect_count =
          temp_disconnect_count + $5,

        safe_custody_count =
          safe_custody_count + $6,

        updated_at = NOW()
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

    } else {

      // FIRST INSERT

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
    }

    // FINAL RESPONSE

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

      hasNext,
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