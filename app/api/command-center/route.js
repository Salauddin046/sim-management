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

        WHERE
        activation_date IS NOT NULL

        AND
        activation_date <> ''

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