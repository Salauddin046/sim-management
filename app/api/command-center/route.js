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

    max: 20,
  })

if (
  !globalForPool.pool
) {

  globalForPool.pool =
    pool
}

export async function POST(req) {

  try {

    const body =
      await req.json()

    const search =
      body.search || ''

    const fromDate =
      body.fromDate || ''

    const toDate =
      body.toDate || ''

    let query =

      `
      SELECT *
      FROM sim_data3
      WHERE 1=1
      `

    const values = []

    if (search) {

      values.push(
        `${search}%`
      )

      query +=

        `
        AND
        (
          sim_number ILIKE $${values.length}

          OR

          phone_number ILIKE $${values.length}

          OR

          client_name ILIKE $${values.length}

          OR

          device_id ILIKE $${values.length}
        )
        `
    }

    if (
      fromDate &&
      toDate
    ) {

      values.push(
        fromDate
      )

      values.push(
        toDate
      )

      query +=

        `
        AND
        (

          activation_date_real
          BETWEEN
          $${values.length - 1}::DATE
          AND
          $${values.length}::DATE

          OR

          termination_date_real
          BETWEEN
          $${values.length - 1}::DATE
          AND
          $${values.length}::DATE

          OR

          safe_custody_move_in_real
          BETWEEN
          $${values.length - 1}::DATE
          AND
          $${values.length}::DATE

          OR

          safe_custody_move_out_real
          BETWEEN
          $${values.length - 1}::DATE
          AND
          $${values.length}::DATE

        )
        `
    }

    query +=

      `
      ORDER BY id DESC
      `

    const result =
      await pool.query(
        query,
        values
      )

    return Response.json({

      success: true,

      count:
        result.rows.length,

      data:
        result.rows,
    })

  } catch (error) {

    console.log(
      'COMMAND CENTER ERROR:',
      error
    )

    return Response.json({

      success: false,

      message:
        error.message,
    })
  }
}