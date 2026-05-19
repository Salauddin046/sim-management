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

    const months =
      result.rows.map(
        (item) =>
          item.month
      )

    return Response.json({

      success: true,

      months,
    })

  } catch (error) {

    console.log(error)

    return Response.json({

      success: false,

      months: [],
    })
  }
}