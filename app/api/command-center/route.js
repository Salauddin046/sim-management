import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

const MAX_ROWS = 5000

export async function POST(req) {
  const session = await getSession(req)
  if (!session) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const search = String(body.search || '').trim()
    const fromDate = String(body.fromDate || '').trim()
    const toDate = String(body.toDate || '').trim()

    let query = 'SELECT * FROM sim_data3 WHERE 1=1'
    const values = []

    if (search) {
      values.push(`%${search}%`)
      query += ` AND (
        sim_number ILIKE $${values.length} OR
        phone_number ILIKE $${values.length} OR
        client_name ILIKE $${values.length} OR
        device_id ILIKE $${values.length}
      )`
    }

    if (fromDate && toDate) {
      values.push(fromDate, toDate)
      query += ` AND (
        (activation_date_real IS NOT NULL AND activation_date_real BETWEEN $${values.length - 1}::DATE AND $${values.length}::DATE) OR
        (termination_date_real IS NOT NULL AND termination_date_real BETWEEN $${values.length - 1}::DATE AND $${values.length}::DATE) OR
        (safe_custody_move_in_real IS NOT NULL AND safe_custody_move_in_real BETWEEN $${values.length - 1}::DATE AND $${values.length}::DATE) OR
        (safe_custody_move_out_real IS NOT NULL AND safe_custody_move_out_real BETWEEN $${values.length - 1}::DATE AND $${values.length}::DATE)
      )`
    }

    // Always add LIMIT to prevent full table dump
    query += ` ORDER BY id DESC LIMIT ${MAX_ROWS}`

    const result = await pool.query(query, values)

    return Response.json({
      success: true,
      count: result.rows.length,
      truncated: result.rows.length === MAX_ROWS,
      data: result.rows,
    })
  } catch (error) {
    return Response.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    )
  }
}
