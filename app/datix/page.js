'use client'

import { useMemo, useState } from 'react'
import { buildCSV } from '@/lib/csv'
import DashboardLayout from '@/lib/DashboardLayout'
import { useAuth } from '@/lib/useAuth'

export default function DatixPage() {
  const { user, loading: authLoading } = useAuth()
  const [input, setInput] = useState('')
  const [data, setData] = useState([])
  const [originalData, setOriginalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [fromMonth, setFromMonth] = useState('')
  const [toMonth, setToMonth] = useState('')

  const searchBulk = async () => {
    const numbers = input.split('\n').map((v) => v.trim()).filter(Boolean)
    if (numbers.length > 1000) { alert('Maximum 1000 SIM numbers allowed'); return }
    if (!numbers.length) { alert('Enter SIM or Phone numbers'); return }

    setLoading(true)
    try {
      const response = await fetch('/api/sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbers }),
      })
      const result = await response.json()

      if (!Array.isArray(result)) {
        alert(result.message || 'Search failed')
        return
      }

      const grouped = Object.create(null)  // null prototype prevents prototype pollution
      for (const row of result) {
        const key = row.sim_no
        if (!grouped[key]) grouped[key] = { sim_no: row.sim_no, msisdn: row.msisdn }
        grouped[key][row.usage_month] = Number(row.used_data_mb || 0)
      }

      const finalData = Object.values(grouped)
      setData(finalData)
      setOriginalData(finalData)
    } catch {
      alert('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const allMonths = useMemo(() => {
    const months = Array.from(
      new Set(data.flatMap((row) => Object.keys(row).filter((k) => !['sim_no', 'msisdn'].includes(k))))
    )
    return months.sort((a, b) => new Date(a) - new Date(b))
  }, [data])

  const visibleMonths = useMemo(() => {
    if (filterType === '6months') return allMonths.slice(-6)
    if (filterType === '1year') return allMonths.slice(-12)
    if (filterType === 'custom' && fromMonth && toMonth)
      return allMonths.filter((m) => m >= fromMonth && m <= toMonth)
    return allMonths
  }, [allMonths, filterType, fromMonth, toMonth])

  const filterData = (key, value) => {
    if (!value) { setData(originalData); return }
    setData(originalData.filter((row) => (row[key] || '').toString().toLowerCase().includes(value.toLowerCase())))
  }

  const sortData = (key, direction, numeric = false) => {
    const sorted = [...data].sort((a, b) => {
      const vA = numeric ? Number(a[key] || 0) : (a[key] || '').toString()
      const vB = numeric ? Number(b[key] || 0) : (b[key] || '').toString()
      if (numeric) return direction === 'asc' ? vA - vB : vB - vA
      return direction === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA)
    })
    setData(sorted)
  }

  const downloadCSV = () => {
    const headers = ['SIM', 'MSISDN', 'MIN', 'MAX', 'TOTAL', 'AVG', 'USED_MONTHS', 'ZERO_MONTHS', ...visibleMonths]
    const rows = data.map((row) => {
      const values = visibleMonths.map((m) => Number(row[m] || 0))
      const total = values.reduce((a, b) => a + b, 0)
      return [
        row.sim_no, row.msisdn,
        Math.min(...values), Math.max(...values),
        total, (total / values.length).toFixed(2),
        values.filter((v) => v > 0).length,
        values.filter((v) => v === 0).length,
        ...visibleMonths.map((m) => row[m] || 0),
      ]
    })
    const csv = buildCSV(headers, rows)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = `data_usage_report_${Date.now()}.csv`
    link.click()
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!user) return null

  return (
    <DashboardLayout activeTitle="Usage Intelligence" user={user}>
      <div className="min-h-screen bg-gray-100 p-3">
        <div className="bg-white rounded-lg shadow-md p-3">
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter SIM or Phone Numbers (one per line)"
            className="w-full border rounded-lg p-2 mb-3 text-sm"
          />

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={searchBulk}
              disabled={loading}
              className="bg-black text-white px-3 py-2 rounded-lg text-sm disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
            <button onClick={downloadCSV} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm">
              Download CSV
            </button>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-2 py-2 text-sm"
            >
              <option value="all">All Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 1 Year</option>
              <option value="custom">Custom</option>
            </select>
            {filterType === 'custom' && (
              <>
                <input type="month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} className="border rounded-lg px-2 py-2 text-sm" />
                <input type="month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} className="border rounded-lg px-2 py-2 text-sm" />
              </>
            )}
          </div>

          <div className="overflow-auto border rounded-lg max-h-[70vh]">
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  {[{ label: 'SIM', key: 'sim_no' }, { label: 'Phone Number', key: 'msisdn' }].map((item) => (
                    <th key={item.key} className="border p-1 min-w-[130px]">
                      <div className="flex flex-col gap-1">
                        <span>{item.label}</span>
                        <select onChange={(e) => { if (!e.target.value) setData(originalData); else sortData(item.key, e.target.value) }} className="border rounded text-[10px]">
                          <option value="">Sort</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                        <input type="text" placeholder="Filter" onChange={(e) => filterData(item.key, e.target.value)} className="border rounded px-1 py-1 text-[10px]" />
                      </div>
                    </th>
                  ))}
                  <th className="border p-1">Min (MB)</th>
                  <th className="border p-1">Max (MB)</th>
                  <th className="border p-1">Total (MB)</th>
                  <th className="border p-1">Avg (MB)</th>
                  <th className="border p-1">Used Months</th>
                  <th className="border p-1">Zero Months</th>
                  {visibleMonths.map((month) => (
                    <th key={month} className="border p-1 min-w-[70px]">
                      <div className="flex flex-col gap-1">
                        <span>{`${month} (MB)`}</span>
                        <select onChange={(e) => { if (!e.target.value) setData(originalData); else sortData(month, e.target.value, true) }} className="border rounded text-[10px]">
                          <option value="">Sort</option>
                          <option value="asc">Low-High</option>
                          <option value="desc">High-Low</option>
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const values = visibleMonths.map((m) => Number(row[m] || 0))
                  const min = Math.min(...values)
                  const max = Math.max(...values)
                  const total = values.reduce((a, b) => a + b, 0)
                  return (
                    <tr key={i}>
                      <td className="border p-1">{row.sim_no}</td>
                      <td className="border p-1">{row.msisdn}</td>
                      <td className="border p-1 bg-yellow-200">{min.toFixed(2)}</td>
                      <td className="border p-1 bg-green-300">{max.toFixed(2)}</td>
                      <td className="border p-1">{total.toFixed(2)}</td>
                      <td className="border p-1">{(total / values.length).toFixed(2)}</td>
                      <td className="border p-1">{values.filter((v) => v > 0).length}</td>
                      <td className="border p-1 bg-red-200/60">{values.filter((v) => v === 0).length}</td>
                      {visibleMonths.map((month) => {
                        const val = Number(row[month] || 0)
                        return (
                          <td key={month} className={`border p-1 ${val === 0 ? 'bg-red-200/60' : val === max && val !== 0 ? 'bg-green-300 font-bold' : val === min && val !== 0 && val !== max ? 'bg-yellow-200' : ''}`}>
                            {val.toFixed(2)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
