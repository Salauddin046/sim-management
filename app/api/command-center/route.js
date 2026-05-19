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

function convertDate(
  date
) {

  if (!date)
    return ''

  const d =
    new Date(date)

  const day =
    String(
      d.getDate()
    ).padStart(2, '0')

  const months = [

    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const month =
    months[
      d.getMonth()
    ]

  const year =
    d.getFullYear()

  return `${day}-${month}-${year}`
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

    if (
      fromDate &&
      toDate
    ) {

      const from =
        convertDate(
          fromDate
        )

      const to =
        convertDate(
          toDate
        )

      query +=

        `
        AND
        (

          activation_date BETWEEN '${from}' AND '${to}'

          OR

          termination_date BETWEEN '${from}' AND '${to}'

          OR

          safe_custody_move_in BETWEEN '${from}' AND '${to}'

          OR

          safe_custody_move_out BETWEEN '${from}' AND '${to}'

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