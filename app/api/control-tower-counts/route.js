import pool from '@/lib/db'

export const maxDuration = 90

const PAGE_LIMIT = 500
const BATCH_SIZE = 15
const PAGES_PER_INVOCATION = 180

function classifyStatus(status) {
  const s = (status || '').toUpperCase().trim()
  if (s === 'ACTIVE') return 'active_count'
  if (s === 'INITIAL') return 'available_count'
  if (s === 'ACTIVATED_ON_TEST_MODE') return 'active_test_mode_count'
  if (s === 'TEMP_DISCONNECT') return 'temp_disconnect_count'
  if (s === 'SAFE_CUSTODY') return 'safe_custody_count'
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

async function getProgress() {
  const result = await pool.query(
    'SELECT * FROM dashboard_sync_progress WHERE id = 1'
  )
  return result.rows[0]
}

async function saveProgress(updates) {
  const fields = Object.keys(updates)
  const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(', ')
  const values = fields.map((f) => updates[f])

  await pool.query(
    `UPDATE dashboard_sync_progress SET ${setClauses}, updated_at = NOW() WHERE id = 1`,
    values
  )
}

async function triggerNextChunk(request, cronSecret) {
  const baseUrl = `${request.nextUrl?.protocol || 'https:'}//${request.headers.get('host')}`
  const url = `${baseUrl}/api/control-tower-counts`

  // Fire and forget - don't await the full completion, just kick it off
  fetch(url, {
    headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
  }).catch(() => {
    // Errors here don't matter - if this fails, the chain stops and
    // the progress row will show 'in_progress' stuck, which is visible for debugging
  })
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
  const resetFlag = searchParams.get('reset') === 'true'

  let progress = await getProgress()

  if (!progress) {
    return Response.json(
      { success: false, message: 'dashboard_sync_progress row missing - run the setup SQL first' },
      { status: 500 }
    )
  }

  // Start a fresh sync if idle, or if explicitly reset
  if (progress.status === 'idle' || resetFlag) {
    await saveProgress({
      current_page: 1,
      total_sim: null,
      active_count: 0,
      available_count: 0,
      active_test_mode_count: 0,
      temp_disconnect_count: 0,
      safe_custody_count: 0,
      other_count: 0,
      total_processed: 0,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    progress = await getProgress()
  }

  if (progress.status === 'done') {
    return Response.json({
      success: true,
      message: 'Sync already completed. Use ?reset=true to start a new sync.',
      progress,
    })
  }

  const startPage = progress.current_page
  let page = startPage
  const endPage = startPage + PAGES_PER_INVOCATION
  let hasNext = true
  let reachedEnd = false

  const counts = {
    active_count: progress.active_count,
    available_count: progress.available_count,
    active_test_mode_count: progress.active_test_mode_count,
    temp_disconnect_count: progress.temp_disconnect_count,
    safe_custody_count: progress.safe_custody_count,
    other_count: progress.other_count,
  }
  let totalProcessed = progress.total_processed
  let reportedTotal = progress.total_sim

  try {
    while (hasNext && page < endPage) {
      const batchPages = []
      for (let i = 0; i < BATCH_SIZE && page + i < endPage; i++) {
        batchPages.push(page + i)
      }

      const results = await Promise.all(
        batchPages.map((p) => fetchAirtelPage(p, airtelAuth))
      )

      for (const { rows, hasNext: nextFlag, totalSim } of results) {
        if (totalSim && !reportedTotal) reportedTotal = totalSim

        for (const row of rows) {
          const bucket = classifyStatus(row.status)
          counts[bucket] += 1
          totalProcessed += 1
        }

        if (rows.length === 0 || !nextFlag) {
          reachedEnd = true
          hasNext = false
        }
      }

      page += batchPages.length
    }

    if (reachedEnd) {
      // Finished - write final tally to sim_dashboard_counts and mark done
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

      await saveProgress({
        current_page: page,
        total_sim: reportedTotal,
        ...counts,
        total_processed: totalProcessed,
        status: 'done',
      })

      return Response.json({
        success: true,
        finished: true,
        total_count: totalCount,
        total_processed: totalProcessed,
        counts,
      })
    } else {
      // Not finished - save progress and trigger next chunk
      await saveProgress({
        current_page: page,
        total_sim: reportedTotal,
        ...counts,
        total_processed: totalProcessed,
        status: 'in_progress',
      })

      const cronSecret = process.env.CRON_SECRET
      await triggerNextChunk(request, cronSecret)

      return Response.json({
        success: true,
        finished: false,
        pages_processed_this_chunk: page - startPage,
        current_page: page,
        total_processed: totalProcessed,
        message: 'Chunk complete, next chunk triggered',
      })
    }
  } catch (error) {
    await saveProgress({
      current_page: page,
      total_sim: reportedTotal,
      ...counts,
      total_processed: totalProcessed,
      status: 'error',
    })

    return Response.json(
      {
        success: false,
        message: error.message || 'Sync failed',
        page_at_failure: page,
        partial_counts: counts,
      },
      { status: 500 }
    )
  }
}
