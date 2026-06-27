import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  return Response.json({ success: true, message: 'SIM API Working' })
}

export async function POST(request) {
  const session = await getSession(request)
  if (!session) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { numbers } = body

    // Explicit type check — a string has .length too, which would bypass the checks below
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return Response.json(
        { success: false, message: 'SIM numbers must be a non-empty array' },
        { status: 400 }
      )
    }

    if (numbers.length > 1000) {
      return Response.json(
        { success: false, message: 'Maximum 1000 numbers allowed' },
        { status: 400 }
      )
    }

    // Ensure all items are strings to prevent type errors in the DB driver
    const sanitized = numbers.map((n) => String(n).trim()).filter(Boolean)

    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT usage_month, msisdn, sim_no, sim_status, plan, used_data_mb
         FROM sim_data2
         WHERE sim_no = ANY($1) OR msisdn = ANY($1)
         ORDER BY usage_month ASC`,
        [sanitized]
      )
      return Response.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    return Response.json(
      { success: false, message: 'Database Error' },
      { status: 500 }
    )
  }
}
