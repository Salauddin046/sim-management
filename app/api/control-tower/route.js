import { getSession } from '@/lib/auth'

const MAX_SEARCH_PAGES = 50

function formatRow(item) {
  const activationRaw = item.activation_date || item.activationdate
  const safeCustodyRaw = item.safe_custody_date || item.safecustodydate

  return {
    sim_no: item.sim_no || item.simnumber || item.iccid || '-',
    mobile_no: item.mobile_no || item.mobileno || item.msisdn || '-',
    status: item.status || item.simstatus || '-',
    activation_date: activationRaw
      ? new Date(activationRaw).toLocaleDateString('en-GB')
      : '-',
    safeCustody_date: safeCustodyRaw
      ? new Date(safeCustodyRaw).toLocaleDateString('en-GB')
      : '-',
  }
}

async function fetchAirtelPage(page, limit, airtelAuth) {
  const response = await fetch(
    'https://airtelsim.intellicar.in/api/v1/airtel/sims/list',
    {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        authorization: `Basic ${airtelAuth}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ page_no: page, limit }),
      cache: 'no-store',
    }
  )
  const result = await response.json()
  return { rows: result?.data?.results || [], raw: result, httpStatus: response.status }
}

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

    // SEARCH MODE — paginate up to MAX_SEARCH_PAGES
    if (search) {
      let allRows = []
      let page = 1
      let truncated = false
      let firstPageRaw = null
      let firstPageHttpStatus = null

      while (page <= MAX_SEARCH_PAGES) {
        const { rows, raw, httpStatus } = await fetchAirtelPage(page, 500, airtelAuth)
        if (page === 1) {
          firstPageRaw = raw
          firstPageHttpStatus = httpStatus
        }
        if (rows.length === 0) break
        allRows = [...allRows, ...rows.map(formatRow)]
        if (rows.length < 500) break
        page++
      }

      if (page > MAX_SEARCH_PAGES) truncated = true

      const searchLower = search.toLowerCase()
      const filtered = allRows.filter(
        (item) =>
          item.sim_no?.toLowerCase().includes(searchLower) ||
          item.mobile_no?.toLowerCase().includes(searchLower)
      )

      return Response.json({
        success: true,
        count: filtered.length,
        data: filtered,
        truncated,
        debug_total_fetched: allRows.length,
        debug_sample_formatted: allRows.slice(0, 3),
        debug_raw_first_page: firstPageRaw,
        debug_http_status: firstPageHttpStatus,
      })
    }

    // NORMAL / DOWNLOAD MODE
    const limit = download === 'true' ? 5000 : 500
    const { rows } = await fetchAirtelPage(1, limit, airtelAuth)
    const formattedRows = rows.map(formatRow)

    return Response.json({
      success: true,
      count: formattedRows.length,
      data: formattedRows,
    })
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch SIM data', error: String(error) },
      { status: 500 }
    )
  }
}
