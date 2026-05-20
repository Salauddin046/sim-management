import { Pool } from 'pg'

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,
})

export async function GET() {

  const result =
    await pool.query(

      `
      SELECT *
      FROM sim_dashboard_counts
      ORDER BY id DESC
      LIMIT 1
      `
    )

  return Response.json(

    result.rows[0]
  )
}