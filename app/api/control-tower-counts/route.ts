import pool from '@/lib/db'

// Vercel Pro allows up to 300s (5 min) function duration.
// Paginating ~590k+ SIMs at 500/page = ~1200 calls.
// At ~150-300ms per call this totals roughly 3-6 minutes, so we set the max.
export const maxDuration = 300

const PAGE_LIMIT = 500
const MAX_PAGES_SAFETY = 5000 // hard ceiling so a bug in Airtel's hasnext flag can't loop forever

// Buckets correspond to the dashboard's 6 cards.
// Confirmed real values from Airtel: ACTIVE, TEMP_DISCONNECT.
// Unconfirmed but expected based on dashboard labels: AVAILABLE, TEST_MODE (or ACTIVE_TEST_MODE), SAFE_CUSTODY.
// Anything not matching a known bucket falls into "other_count" so nothing is silently dropped.
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
}

// Optional shared-secret check so this isn't callable by anyone who finds the URL.
// Set CRON_SECRET in Vercel env vars and Vercel automatically sends it as a Bearer token
// to cron-triggered requests when configured in vercel.json.
function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // no secret configured, allow (set one in production)
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

  const startedAt = Date.now()

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

  try {
    while (hasNext && page <= MAX_PAGES_SAFETY) {
      const { rows, hasNext: nextFlag, totalSim } = await fetchAirtelPage(page, airtelAuth)

      if (totalSim && !reportedTotal) reportedTotal = totalSim

      for (const row of rows) {
        const bucket = classifyStatus(row.status)
        counts[bucket] += 1
        totalProcessed += 1
      }

      hasNext = nextFlag
      page += 1

      // Stop early if Airtel returns an empty page despite hasNext=true (defensive)
      if (rows.length === 0) break
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