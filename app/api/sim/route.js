import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const simNo = searchParams.get('sim_no')

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
      ORDER BY usage_month
      `,
      [simNo]
    )

    return Response.json(result.rows)
  } catch (error) {
    return Response.json({
      error: error.message,
    })
  }
}