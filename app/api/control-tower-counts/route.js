import pool from '@/lib/db'

export const maxDuration = 300

const PAGE_LIMIT = 500
const MAX_PAGES_SAFETY = 5000
const BATCH_SIZE = 15

function classifyStatus(status) {
  const s = (status || '').toUpperCase().trim()
  if (s === 'ACTIVE') return 'active_count'
  if (s === 'AVAILABLE') return 'available_count'
  if (s === 'TEST_MODE' || s === 'ACTIVE_TEST_MODE' || s === 'TESTMODE') return 'active_test_mode_count'
  if (s === 'TEMP_DISCONNECT' || s === 'TEMPDISCONNECT') return 'temp_disconnect_count'
  if (s === 'SAFE_CUSTODY' || s === 'SAFECUSTODY') return 'safe_custody_count'
  return 'other_count'
}

async function fetchAirtelPage(page, airtelAuth) {
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
        body: JSON.stringify({ page_no: page, limit: PAGE_LIMIT }),
        cache: 'no-store',
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      throw new Error(`Airtel API returned HTTP ${response.status} on page ${page}`)
    }

    const result = await response.json()
    return {
      rows: result?.data?.results || [],
      hasNext: result?.data?.hasnext ?? false,
      totalSim: result?.data?.totalsim ?? null,
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Airtel API timed out after 15s on page ${page}`)
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const airtelAuth = process.env.AIRTEL_API_AUTH
  if (!airtelAuth) {
    return Response.json(
      { success: false, message: 'AIRTEL_API_AUTH not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const debugMode = searchParams.get('debug') === 'true'
  const maxPagesOverride = searchParams.get('maxPages')
    ? parseInt(searchParams.get('maxPages'), 10)
    : null

  const startedAt = Date.now()

  if (debugMode) {
    const pagesToTest = maxPagesOverride || 5
    const timings = []

    for (let p = 1; p <= pagesToTest; p++) {
      const callStart = Date.now()
      try {
        const result = await fetchAirtelPage(p, airtelAuth)
        timings.push({
          page: p,
          ms: Date.now() - callStart,
          rowCount: result.rows.length,
          hasNext: result.hasNext,
          totalSim: result.totalSim,
        })
      } catch (err) {
        timings.push({ page: p, error: err.message, ms: Date.now() - callStart })
      }
    }

    const totalMs = Date.now() - startedAt
    const validTimings = timings.filter((t) => !t.error)
    const avgMs = validTimings.length
      ? validTimings.reduce((sum, t) => sum + t.ms, 0) / validTimings.length
      : null

    return Response.json({
      success: true,
      debug: true,
      pages_tested: pagesToTest,
      total_ms: totalMs,
      avg_ms_per_call: avgMs,
      timings,
      projected_total_seconds_sequential: avgMs ? (avgMs * 1200) / 1000 : null,
    })
  }

  const counts = {
    active_count: 0,
    available_count: 0,
    active_test_mode_count: 0,
    temp_disconnect_count: 0,
    safe_custody_count: 0,
    other_count: 0,
  }

  let totalProcessed = 0
  let reportedTotal = null
  let page = 1
  let hasNext = true
  const effectiveMaxPages = maxPagesOverride || MAX_PAGES_SAFETY

  try {
    while (hasNext && page <= effectiveMaxPages) {
      const batchPages = []
      for (let i = 0; i < BATCH_SIZE; i++) {
        batchPages.push(page + i)
      }

      const results = await Promise.all(
        batchPages.map((p) => fetchAirtelPage(p, airtelAuth))
      )

      let sawEmptyOrEnd = false

      for (const { rows, hasNext: nextFlag, totalSim } of results) {
        if (totalSim && !reportedTotal) reportedTotal = totalSim

        for (const row of rows) {
          const bucket = classifyStatus(row.status)
          counts[bucket] += 1
          totalProcessed += 1
        }

        if (rows.length === 0 || !nextFlag) {
          sawEmptyOrEnd = true
        }
      }

      page += BATCH_SIZE

      if (sawEmptyOrEnd) {
        hasNext = false
        break
      }
    }

    const totalCount = reportedTotal ? parseInt(reportedTotal, 10) : totalProcessed

    await pool.query(
      `INSERT INTO sim_dashboard_counts
        (total_count, available_count, active_count, active_test_mode_count, temp_disconnect_count, safe_custody_count, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        totalCount,
        counts.available_count,
        counts.active_count,
        counts.active_test_mode_count,
        counts.temp_disconnect_count,
        counts.safe_custody_count,
      ]
    )

    const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1)

    return Response.json({
      success: true,
      total_count: totalCount,
      total_processed: totalProcessed,
      pages_fetched: page - 1,
      duration_seconds: durationSeconds,
      counts,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || 'Sync failed',
        pages_completed_before_failure: page - 1,
        partial_counts: counts,
      },
      { status: 500 }
    )
  }
}
