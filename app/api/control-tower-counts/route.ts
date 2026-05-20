import { Pool } from 'pg'

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,
})

export async function GET() {

  try {

    let totalCount = 0

    let availableCount = 0

    let activeCount = 0

    let activeTestModeCount = 0

    let tempDisconnectCount = 0

    let safeCustodyCount = 0

    for (
      let page = 1;
      page <= 1200;
      page++
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
            },

            body: JSON.stringify({

              page_no: page,

              limit: 500,
            }),
          }
        )

      if (!response.ok) {

        continue
      }

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

        if (
          status.includes('initial')
        ) {

          availableCount++
        }

        if (
          status.includes('active')
          &&
          !status.includes('test')
        ) {

          activeCount++
        }

        if (
          status.includes('test')
        ) {

          activeTestModeCount++
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
      })
    }

    // CLEAR OLD

    await pool.query(`
      DELETE FROM sim_dashboard_counts
    `)

    // INSERT NEW

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
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,
    })
  }
}