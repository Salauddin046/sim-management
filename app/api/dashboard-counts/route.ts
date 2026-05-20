import { Pool } from 'pg'

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,
})

export async function GET() {

  try {

    const result =
      await pool.query(

        `
        SELECT *

        FROM sim_dashboard_counts

        ORDER BY id DESC

        LIMIT 1
        `
      )

    return Response.json({

      success: true,

      ...(result.rows[0] || {})
    })

  } catch (error) {

    console.log(
      'DASHBOARD COUNTS ERROR:',
      error
    )

    return Response.json({

      success: false,

      total_count: 0,

      available_count: 0,

      active_count: 0,

      active_test_mode_count: 0,

      temp_disconnect_count: 0,

      safe_custody_count: 0,
    })
  }
}