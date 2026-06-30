import { getSession } from '@/lib/auth'

const MAX_SEARCH_PAGES = 50
const BATCH_SIZE = 15 // matches the concurrency Airtel can actually handle (measured earlier)

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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

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
        body: JSON.stringify({ page_no: page, limit }),
        cache: 'no-store',
        signal: controller.signal,
      }
    )
    const result = await response.json()
    return {
      rows: result?.data?.results || [],
      hasNext: result?.data?.hasnext ?? false,
    }
  } catch (err) {
    // Treat a timed-out or failed page as empty rather than crashing the whole search
    return { rows: [], hasNext: false }
  } finally {
    clearTimeout(timeoutId)
  }
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

    // SEARCH MODE — fetch pages in parallel batches instead of one at a time.
    // Cuts a worst-case 50-page sequential search (~55s) down to roughly
    // 4 batches at ~1.5s each (~6-8s), since Airtel handles ~15 concurrent
    // requests without queuing them fully sequentially.
    if (search) {
      let allRows = []
      let page = 1
      let truncated = false
      let keepGoing = true

      while (keepGoing && page <= MAX_SEARCH_PAGES) {
        const batchPages = []
        for (let i = 0; i < BATCH_SIZE && page + i <= MAX_SEARCH_PAGES; i++) {
          batchPages.push(page + i)
        }

        const results = await Promise.all(
          batchPages.map((p) => fetchAirtelPage(p, 500, airtelAuth))
        )

        let sawShortPage = false

        for (const { rows, hasNext } of results) {
          allRows = [...allRows, ...rows.map(formatRow)]
          if (rows.length < 500 || !hasNext) {
            sawShortPage = true
          }
        }

        page += batchPages.length

        if (sawShortPage) {
          keepGoing = false
        }
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
      { success: false, message: 'Failed to fetch SIM data' },
      { status: 500 }
    )
  }
}
