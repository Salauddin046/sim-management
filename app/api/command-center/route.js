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

    idleTimeoutMillis:
      30000,

    connectionTimeoutMillis:
      2000,
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

    const month =
      body.month || ''

    let query =

      `
      SELECT *
      FROM sim_data3
      WHERE 1=1
      `

    const values = []

    if (search) {

      values.push(
        `%${search}%`
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

    if (month) {

      const [
        year,
        monthValue,
      ] = month.split('-')

      const formattedMonth =

        `${monthValue}-${year}`

      values.push(
        `%${formattedMonth}%`
      )

      query +=

        `
        AND
        (

          activation_date ILIKE $${values.length}

          OR

          termination_date ILIKE $${values.length}

          OR

          safe_custody_move_in ILIKE $${values.length}

          OR

          safe_custody_move_out ILIKE $${values.length}

        )
        `
    }

    query +=

      `
      ORDER BY id DESC
      LIMIT 1000
      `

    const result =
      await pool.query(
        query,
        values
      )

    return Response.json({

      success: true,

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
        'Search failed',
    })
  }
}