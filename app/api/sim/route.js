import { Pool } from 'pg'

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
})

export async function GET() {

  return Response.json({

    success: true,

    message:
      'SIM API Working',
  })
}

export async function POST(
  request
) {

  try {

    const body =
      await request.json()

    const {
      numbers
    } = body

    if (
      !numbers ||
      !numbers.length
    ) {

      return Response.json(
        {
          success: false,
          message:
            'SIM numbers required',
        },
        {
          status: 400,
        }
      )
    }

    const client =
      await pool.connect()

    const query = `

      SELECT
        usage_month,
        msisdn,
        sim_no,
        sim_status,
        plan,
        used_data_mb

      FROM sim_data2

      WHERE
        sim_no = ANY($1)
        OR msisdn = ANY($1)

      ORDER BY
        usage_month ASC

    `

    const result =
      await client.query(
        query,
        [numbers]
      )

    client.release()

    return Response.json(
      result.rows
    )

  } catch (error) {

    console.error(
      'Database Error:',
      error
    )

    return Response.json(
      {
        success: false,
        message:
          'Database Error',
        error:
          error.message,
      },
      {
        status: 500,
      }
    )
  }
}