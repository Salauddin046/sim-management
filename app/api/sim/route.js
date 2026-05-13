import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const simNo = searchParams.get('sim_no')?.trim()

    if (!simNo) {
      return Response.json([])
    }

    const result = await pool.query(
      `
      SELECT
        usage_month,
        sim_no,
        sim_status,
        plan,
        used_data_mb
      FROM sim_data2
      WHERE sim_no = $1
      ORDER BY usage_month DESC
      LIMIT 12
      `,
      [simNo]
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