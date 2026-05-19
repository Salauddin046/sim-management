import { Pool } from 'pg'

const pool =
  new Pool({

    connectionString:
      process.env.DATABASE_URL,

    ssl: {
      rejectUnauthorized: false,
    },
  })

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

    console.log(
      'MONTH RESULT:',
      result.rows
    )

    return Response.json({

      success: true,

      months:
        result.rows,
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