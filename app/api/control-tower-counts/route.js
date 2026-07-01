import pool from '@/lib/db'

export const maxDuration = 90

const PAGE_LIMIT = 500
const BATCH_SIZE = 4
const PAGES_PER_INVOCATION = 50

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

async function upsertSims(rows) {
  if (!rows.length) return

  // Deduplicate by sim_no — keep the last occurrence if Airtel returns duplicates
  // within the same page (which causes "ON CONFLICT DO UPDATE cannot affect row twice")
  const seen = new Map()
  for (const row of rows) {
    if (row.sim_no) seen.set(row.sim_no, row)
  }
  const deduplicated = Array.from(seen.values())

  if (!deduplicated.length) return

  const values = deduplicated.map((r, i) => {
    const base = i * 10
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, NOW())`
  }).join(', ')

  const params = deduplicated.flatMap(r => [
    r.sim_no || null,
    r.mobile_no || null,
    r.status || null,
    r.onboarding_date || null,
    r.activation_date || null,
    r.expiration_date || null,
    r.safeCustody_date || null,
    r.sim_id || null,
    r.device_id || null,
    r.imei || null,
  ])

  await pool.query(
    `INSERT INTO airtel_sims
      (sim_no, mobile_no, status, onboarding_date, activation_date, expiration_date, safe_custody_date, sim_id, device_id, imei, synced_at)
     VALUES ${values}
     ON CONFLICT (sim_no) DO UPDATE SET
       mobile_no = EXCLUDED.mobile_no,
       status = EXCLUDED.status,
       onboarding_date = EXCLUDED.onboarding_date,
       activation_date = EXCLUDED.activation_date,
       expiration_date = EXCLUDED.expiration_date,
       safe_custody_date = EXCLUDED.safe_custody_date,
       sim_id = EXCLUDED.sim_id,
       device_id = EXCLUDED.device_id,
       imei = EXCLUDED.imei,
       synced_at = NOW()`,
    params
  )
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

  fetch(url, {
    headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
  }).catch(() => {})
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
      { success: false, message: 'dashboard_sync_progress row missing' },
      { status: 500 }
    )
  }

  if (progress.status === 'idle' || progress.status === 'done' || resetFlag) {
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

      const allRows = []

      for (const { rows, hasNext: nextFlag, totalSim } of results) {
        if (totalSim && !reportedTotal) reportedTotal = totalSim

        for (const row of rows) {
          const bucket = classifyStatus(row.status)
          counts[bucket] += 1
          totalProcessed += 1
          allRows.push(row)
        }

        if (rows.length === 0 || !nextFlag) {
          reachedEnd = true
          hasNext = false
        }
      }

      // Upsert this batch of SIMs into airtel_sims table
      await upsertSims(allRows)

      page += batchPages.length
    }

    if (reachedEnd) {
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
    await saveProgress({ status: 'error' })

    return Response.json(
      {
        success: false,
        message: error.message || 'Sync failed',
        page_at_failure: page,
      },
      { status: 500 }
    )
  }
}
