'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

// ---------- Types ----------

type SimRow = {
  sim_no: string
  msisdn: string
  sim_status: string
  plan: string
  usage: Record<string, number> // "Mar 2025" -> MB
}

type ApiRow = {
  sim_no: string
  msisdn: string
  sim_status: string
  plan: string
  usage_month: string
  used_data_mb: number | string | null
}

type LoggedUser = {
  username: string
  name: string
  email: string
} | null

type SortDirection = 'asc' | 'desc' | null

type SortState = {
  key: string // either a base column key or a month string
  direction: SortDirection
}

type FilterType = 'all' | '6months' | '1year' | 'custom'

// ---------- Month parsing ----------
// Input format from API: "Mar 2025"
// We parse to a sortable numeric key: 2025 * 12 + monthIndex

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function monthToSortKey(month: string): number {
  const parts = month.trim().split(/\s+/)
  if (parts.length !== 2) return Number.NaN
  const m = MONTH_MAP[parts[0].slice(0, 3).toLowerCase()]
  const y = Number(parts[1])
  if (m === undefined || Number.isNaN(y)) return Number.NaN
  return y * 12 + m
}

function compareMonths(a: string, b: string): number {
  const ka = monthToSortKey(a)
  const kb = monthToSortKey(b)
  if (Number.isNaN(ka) && Number.isNaN(kb)) return a.localeCompare(b)
  if (Number.isNaN(ka)) return 1
  if (Number.isNaN(kb)) return -1
  return ka - kb
}

// "Mar 2025" -> HTML <input type="month"> value "2025-03"
function monthToInputValue(month: string): string {
  const parts = month.trim().split(/\s+/)
  if (parts.length !== 2) return ''
  const m = MONTH_MAP[parts[0].slice(0, 3).toLowerCase()]
  if (m === undefined) return ''
  return `${parts[1]}-${String(m + 1).padStart(2, '0')}`
}

// "2025-03" -> sortable key for comparison with month strings
function inputValueToSortKey(value: string): number {
  if (!value) return Number.NaN
  const [y, m] = value.split('-').map(Number)
  if (!y || !m) return Number.NaN
  return y * 12 + (m - 1)
}

// ---------- CSV escaping ----------

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

// ---------- Row aggregates ----------

type RowAggregates = {
  min: number | null
  max: number | null
  total: number
  avg: number | null
  consumedMonths: number
  zeroMonths: number
  missingMonths: number
}

function computeAggregates(row: SimRow, months: string[]): RowAggregates {
  if (months.length === 0) {
    return { min: null, max: null, total: 0, avg: null, consumedMonths: 0, zeroMonths: 0, missingMonths: 0 }
  }

  let total = 0
  let consumed = 0
  let zero = 0
  let missing = 0
  let min: number | null = null
  let max: number | null = null

  for (const m of months) {
    const v = row.usage[m]
    if (v === undefined) {
      missing++
      continue
    }
    total += v
    if (v > 0) consumed++
    else zero++
    if (min === null || v < min) min = v
    if (max === null || v > max) max = v
  }

  const present = months.length - missing
  const avg = present > 0 ? total / present : null

  return { min, max, total, avg, consumedMonths: consumed, zeroMonths: zero, missingMonths: missing }
}

// ---------- Component ----------

const IDLE_TIMEOUT_MS = 10 * 60 * 1000
const MAX_SIM_NUMBERS = 1000
const BASE_COLUMNS = ['sim_no', 'msisdn', 'sim_status', 'plan'] as const

export default function Home() {
  const [input, setInput] = useState('')
  const [rows, setRows] = useState<SimRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [fromMonth, setFromMonth] = useState('') // "2025-03" from <input type="month">
  const [toMonth, setToMonth] = useState('')

  const [sort, setSort] = useState<SortState>({ key: '', direction: null })

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const [loggedUser, setLoggedUser] = useState<LoggedUser>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // ---------- Auth bootstrap + idle timeout ----------
  // NOTE: this client-side check is NOT real authentication. Server-side
  // session validation on /api/sim is required. This block only restores
  // the user object for UI display and auto-clears it after inactivity.

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      window.location.href = '/'
      return
    }
    try {
      setLoggedUser(JSON.parse(raw))
      setAuthChecked(true)
    } catch {
      localStorage.clear()
      window.location.href = '/'
    }
  }, [])

  useEffect(() => {
    if (!authChecked) return

    let timeout: ReturnType<typeof setTimeout>

    const logout = () => {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    }

    const reset = () => {
      clearTimeout(timeout)
      timeout = setTimeout(logout, IDLE_TIMEOUT_MS)
    }

    reset()
    const events = ['mousemove', 'keydown', 'click', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, reset))

    return () => {
      clearTimeout(timeout)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [authChecked])

  // ---------- Profile dropdown: close on outside click ----------

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [profileOpen])

  // ---------- Search ----------

  const handleSearch = useCallback(async () => {
    const numbers = input
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)

    if (!numbers.length) {
      setError('Enter at least one SIM number.')
      return
    }
    if (numbers.length > MAX_SIM_NUMBERS) {
      setError(`Too many numbers. Max ${MAX_SIM_NUMBERS} per search.`)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbers }),
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)

      const apiRows: ApiRow[] = await res.json()
      const grouped: Record<string, SimRow> = {}

      for (const r of apiRows) {
        if (!grouped[r.sim_no]) {
          grouped[r.sim_no] = {
            sim_no: r.sim_no,
            msisdn: r.msisdn,
            sim_status: r.sim_status,
            plan: r.plan,
            usage: {},
          }
        }
        grouped[r.sim_no].usage[r.usage_month] = Number(r.used_data_mb || 0)
      }

      setRows(Object.values(grouped))
      // Reset sort and filters on new search so user sees clean state
      setSort({ key: '', direction: null })
    } catch (err) {
      console.error(err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [input])

  // ---------- Derived: months in scope ----------

  const allMonths = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) {
      for (const m of Object.keys(r.usage)) set.add(m)
    }
    return Array.from(set).sort(compareMonths)
  }, [rows])

  const visibleMonths = useMemo(() => {
    if (filterType === '6months') return allMonths.slice(-6)
    if (filterType === '1year') return allMonths.slice(-12)
    if (filterType === 'custom') {
      const from = inputValueToSortKey(fromMonth)
      const to = inputValueToSortKey(toMonth)
      if (Number.isNaN(from) || Number.isNaN(to)) return allMonths
      return allMonths.filter((m) => {
        const k = monthToSortKey(m)
        return k >= from && k <= to
      })
    }
    return allMonths
  }, [allMonths, filterType, fromMonth, toMonth])

  // ---------- Derived: per-row aggregates ----------

  const aggregatesByRow = useMemo(() => {
    const map = new Map<string, RowAggregates>()
    for (const r of rows) map.set(r.sim_no, computeAggregates(r, visibleMonths))
    return map
  }, [rows, visibleMonths])

  // ---------- Derived: sorted view ----------

  const sortedRows = useMemo(() => {
    if (!sort.direction || !sort.key) return rows

    const dir = sort.direction === 'asc' ? 1 : -1
    const out = [...rows]

    out.sort((a, b) => {
      let va: string | number
      let vb: string | number

      if (BASE_COLUMNS.includes(sort.key as typeof BASE_COLUMNS[number])) {
        va = (a as unknown as Record<string, string>)[sort.key] ?? ''
        vb = (b as unknown as Record<string, string>)[sort.key] ?? ''
      } else {
        // month column
        va = a.usage[sort.key] ?? -1
        vb = b.usage[sort.key] ?? -1
      }

      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return out
  }, [rows, sort])

  // ---------- Sort toggle ----------

  const toggleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: '', direction: null }
    })
  }, [])

  const sortIndicator = (key: string) => {
    if (sort.key !== key) return ''
    return sort.direction === 'asc' ? ' ▲' : ' ▼'
  }

  // ---------- CSV download ----------

  const downloadCSV = useCallback(() => {
    if (!sortedRows.length) {
      setError('Nothing to export.')
      return
    }

    const headers = [
      'SIM Number', 'MSISDN', 'Status', 'Plan',
      'Min Data (MB)', 'Max Data (MB)', 'Total Data (MB)', 'Avg Data (MB)',
      'Consumed Months', 'Zero Months', 'Missing Months',
      ...visibleMonths.map((m) => `${m} (MB)`),
    ]

    const lines = [headers.map(csvEscape).join(',')]

    for (const r of sortedRows) {
      const a = aggregatesByRow.get(r.sim_no)!
      const row = [
        r.sim_no, r.msisdn, r.sim_status, r.plan,
        a.min ?? '', a.max ?? '', a.total, a.avg !== null ? a.avg.toFixed(2) : '',
        a.consumedMonths, a.zeroMonths, a.missingMonths,
        ...visibleMonths.map((m) => (r.usage[m] !== undefined ? r.usage[m] : '')),
      ]
      lines.push(row.map(csvEscape).join(','))
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    link.href = url
    link.download = `sim_usage_report_${ts}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [sortedRows, visibleMonths, aggregatesByRow])

  // ---------- Reset ----------

  const resetView = useCallback(() => {
    setSort({ key: '', direction: null })
    setFilterType('all')
    setFromMonth('')
    setToMonth('')
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }, [])

  // ---------- Render ----------

  if (!authChecked) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-sm text-gray-600">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Datiz Master</h1>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="bg-black text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold">
                {loggedUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span>{loggedUser?.username || 'User'}</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b space-y-3">
                  <Field label="Username" value={loggedUser?.username} />
                  <Field label="Name" value={loggedUser?.name} />
                  <Field label="Email" value={loggedUser?.email} />
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="mb-4">
          <textarea
            rows={4}
            placeholder={`Enter SIM numbers, one per line (max ${MAX_SIM_NUMBERS})`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full max-w-lg border border-gray-300 rounded-lg p-2 text-sm resize-none"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>

          <button
            onClick={downloadCSV}
            disabled={!sortedRows.length}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Download CSV
          </button>

          <button
            onClick={resetView}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Reset View
          </button>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 1 Year</option>
            <option value="custom">Month Range</option>
          </select>

          {filterType === 'custom' && (
            <>
              <input
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
                aria-label="From month"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
                aria-label="To month"
              />
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto rounded-lg border border-gray-300 max-h-[650px]">
          {sortedRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              {loading ? 'Loading…' : 'No data. Enter SIM numbers and click Search.'}
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <SortableTh label="SIM" sortKey="sim_no" current={sort} onClick={toggleSort} indicator={sortIndicator('sim_no')} />
                  <SortableTh label="Phone Number" sortKey="msisdn" current={sort} onClick={toggleSort} indicator={sortIndicator('msisdn')} />
                  <SortableTh label="Status" sortKey="sim_status" current={sort} onClick={toggleSort} indicator={sortIndicator('sim_status')} />
                  <SortableTh label="Plan" sortKey="plan" current={sort} onClick={toggleSort} indicator={sortIndicator('plan')} />
                  <th className="border p-1">Min Data (MB)</th>
                  <th className="border p-1">Max Data (MB)</th>
                  <th className="border p-1">Total Data (MB)</th>
                  <th className="border p-1">Avg Data (MB)</th>
                  <th className="border p-1">Data Used Months</th>
                  <th className="border p-1">Zero Data Months</th>
                  <th className="border p-1">Missing</th>
                  {visibleMonths.map((m) => (
                    <th
                      key={m}
                      onClick={() => toggleSort(m)}
                      className="border p-1 min-w-[80px] text-[10px] cursor-pointer select-none hover:bg-gray-300"
                      title={`Click to sort by ${m}`}
                    >
                      {m}{sortIndicator(m)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedRows.map((r) => {
                  const a = aggregatesByRow.get(r.sim_no)!
                  return (
                    <tr key={r.sim_no} className="hover:bg-gray-50">
                      <td className="border p-1 text-center">{r.sim_no}</td>
                      <td className="border p-1 text-center">{r.msisdn}</td>
                      <td className="border p-1 text-center">{r.sim_status}</td>
                      <td className="border p-1 text-center">{r.plan}</td>
                      <td className="border p-1 text-center">{a.min ?? '—'}</td>
                      <td className="border p-1 text-center">{a.max ?? '—'}</td>
                      <td className="border p-1 text-center">{a.total}</td>
                      <td className="border p-1 text-center">{a.avg !== null ? a.avg.toFixed(2) : '—'}</td>
                      <td className="border p-1 text-center">{a.consumedMonths}</td>
                      <td className="border p-1 text-center">{a.zeroMonths}</td>
                      <td className="border p-1 text-center">{a.missingMonths}</td>
                      {visibleMonths.map((m) => {
                        const value = r.usage[m]
                        const isMax = a.max !== null && value === a.max && value > 0
                        return (
                          <td
                            key={m}
                            className={`border p-1 text-center text-[10px] ${isMax ? 'bg-green-300 font-bold' : ''}`}
                          >
                            {value !== undefined ? value : '—'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Small components ----------

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="font-semibold text-sm break-all">{value || '-'}</p>
    </div>
  )
}

function SortableTh({
  label, sortKey, current, onClick, indicator,
}: {
  label: string
  sortKey: string
  current: SortState
  onClick: (key: string) => void
  indicator: string
}) {
  const active = current.key === sortKey
  return (
    <th
      onClick={() => onClick(sortKey)}
      className={`border p-2 min-w-[120px] cursor-pointer select-none text-[11px] font-semibold hover:bg-gray-300 ${active ? 'bg-gray-300' : ''}`}
      title={`Click to sort by ${label}`}
    >
      {label}{indicator}
    </th>
  )
}