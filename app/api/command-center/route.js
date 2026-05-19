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
        `${search}%`
      )

      query +=

        `
        AND
        (
          sim_number LIKE $${values.length}

          OR

          phone_number LIKE $${values.length}

          OR

          client_name LIKE $${values.length}

          OR

          device_id LIKE $${values.length}
        )
        `
    }

    if (month) {

      const [
        year,
        monthValue,
      ] = month.split('-')

      const months = {

        '01': 'Jan',

        '02': 'Feb',

        '03': 'Mar',

        '04': 'Apr',

        '05': 'May',

        '06': 'Jun',

        '07': 'Jul',

        '08': 'Aug',

        '09': 'Sep',

        '10': 'Oct',

        '11': 'Nov',

        '12': 'Dec',
      }

      const monthPattern =

        `${months[monthValue]}-${year}`

      values.push(
        `%${monthPattern}%`
      )

      query +=

        `
        AND
        (

          activation_date LIKE $${values.length}

          OR

          termination_date LIKE $${values.length}

          OR

          safe_custody_move_in LIKE $${values.length}

          OR

          safe_custody_move_out LIKE $${values.length}

        )
        `
    }

    query +=

      `
      ORDER BY id DESC
      `

    console.log(
      'QUERY:',
      query
    )

    console.log(
      'VALUES:',
      values
    )

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