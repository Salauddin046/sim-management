import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function POST(req) {
  try {
    const body = await req.json()

    const numbers = body.numbers || []

    if (!numbers.length) {
      return Response.json([])
    }

    const result = await pool.query(
      `
      SELECT
        usage_month,
        msisdn,
        sim_no,
        sim_status,
        plan,
        used_data_mb
      FROM sim_data2
      WHERE
        msisdn = ANY($1)
        OR sim_no = ANY($1)
      ORDER BY usage_month DESC
      `,
      [numbers]
    )

    return Response.json(result.rows)
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: 'Database error',
      },
      {
        status: 500,
      }
    )
  }
}