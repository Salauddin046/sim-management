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
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const download = searchParams.get('download')

    const airtelAuth = process.env.AIRTEL_API_AUTH
    if (!airtelAuth) {
      return Response.json(
        { success: false, message: 'API configuration missing' },
        { status: 500 }
      )
    }

    // SEARCH MODE — query local airtel_sims table instead of Airtel's paginated API.
    // This makes search instant for any SIM regardless of how deep it sits
    // in Airtel's pagination order, and works for all 590,939 SIMs.
    if (search) {
      const searchParam = `%${search}%`
      const result = await pool.query(
        `SELECT
          sim_no,
          mobile_no,
          status,
          activation_date,
          safe_custody_date
         FROM airtel_sims
         WHERE sim_no ILIKE $1 OR mobile_no ILIKE $1
         ORDER BY activation_date DESC NULLS LAST
         LIMIT 500`,
        [searchParam]
      )

      const rows = result.rows.map((r) => ({
        sim_no: r.sim_no || '-',
        mobile_no: r.mobile_no || '-',
        status: r.status || '-',
        activation_date: r.activation_date
          ? new Date(r.activation_date).toLocaleDateString('en-GB')
          : '-',
        safeCustody_date: r.safe_custody_date
          ? new Date(r.safe_custody_date).toLocaleDateString('en-GB')
          : '-',
      }))

      return Response.json({
        success: true,
        count: rows.length,
        data: rows,
        truncated: rows.length === 500,
      })
    }

    // NORMAL / DOWNLOAD MODE — still hits Airtel live API for first page display
    // and CSV download (so users see real-time data on the default view)
    const limit = download === 'true' ? 5000 : 500
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    try {
      const response = await fetch(
        'https://airtelsim.intellicar.in/api/v1/airtel/sims/list',
        {
          method: 'POST',
          headers: {
            accept: 'application/json, text/plain, */*',
            authorization: `Basic ${airtelAuth}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ page_no: 1, limit }),
          cache: 'no-store',
          signal: controller.signal,
        }
      )

      const result = await response.json()
      const rows = (result?.data?.results || []).map((item) => {
        const activationRaw = item.activation_date || item.activationdate
        const safeCustodyRaw = item.safe_custody_date || item.safecustodydate
        return {
          sim_no: item.sim_no || '-',
          mobile_no: item.mobile_no || '-',
          status: item.status || '-',
          activation_date: activationRaw
            ? new Date(activationRaw).toLocaleDateString('en-GB')
            : '-',
          safeCustody_date: safeCustodyRaw
            ? new Date(safeCustodyRaw).toLocaleDateString('en-GB')
            : '-',
        }
      })

      return Response.json({
        success: true,
        count: rows.length,
        data: rows,
      })
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch SIM data' },
      { status: 500 }
    )
  }
}
