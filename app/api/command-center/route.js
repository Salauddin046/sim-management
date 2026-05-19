import { Pool } from 'pg'

const globalForPool =
  global

const pool =
  globalForPool.pool ||

  new Pool({

    connectionString:
      process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  })

if (
  !globalForPool.pool
) {

  globalForPool.pool =
    pool
}

export async function GET() {

  try {

    const result =
      await pool.query(

        `
        SELECT DISTINCT
        SUBSTRING(
          activation_date,
          4,
          9
        ) AS month
        FROM sim_data3
        WHERE activation_date IS NOT NULL
        AND activation_date <> ''

        UNION

        SELECT DISTINCT
        SUBSTRING(
          termination_date,
          4,
          9
        ) AS month
        FROM sim_data3
        WHERE termination_date IS NOT NULL
        AND termination_date <> ''

        UNION

        SELECT DISTINCT
        SUBSTRING(
          safe_custody_move_in,
          4,
          9
        ) AS month
        FROM sim_data3
        WHERE safe_custody_move_in IS NOT NULL
        AND safe_custody_move_in <> ''

        UNION

        SELECT DISTINCT
        SUBSTRING(
          safe_custody_move_out,
          4,
          9
        ) AS month
        FROM sim_data3
        WHERE safe_custody_move_out IS NOT NULL
        AND safe_custody_move_out <> ''

        ORDER BY month
        `
      )

    const months =
      result.rows
        .map(
          (item) =>
            item.month
        )
        .filter(Boolean)

    return Response.json({

      success: true,

      months,
    })

  } catch (error) {

    console.log(
      'MONTH API ERROR:',
      error
    )

    return Response.json({

      success: false,

      months: [],
    })
  }
}