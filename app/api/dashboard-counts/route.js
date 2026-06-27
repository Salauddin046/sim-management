import pool from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession(request)
  if (!session) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const result = await pool.query(
      'SELECT * FROM sim_dashboard_counts ORDER BY id DESC LIMIT 1'
    )

    return Response.json({
      success: true,
      ...(result.rows[0] || {}),
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        total_count: 0,
        available_count: 0,
        active_count: 0,
        active_test_mode_count: 0,
        temp_disconnect_count: 0,
        safe_custody_count: 0,
      },
      { status: 500 }
    )
  }
}
