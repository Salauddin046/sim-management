'use client'

import { useState } from 'react'
import { buildCSV } from '@/lib/csv'
import DashboardLayout from '@/lib/DashboardLayout'
import { useAuth } from '@/lib/useAuth'

export default function SimExplorerPage() {
  const { user, loading: authLoading } = useAuth()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  const searchData = async () => {
    if (!search.trim()) { alert('Enter SIM Numbers'); return }

    const simNumbers = search.split('\n').map((s) => s.trim()).filter(Boolean)
    if (simNumbers.length > 500) { alert('Maximum 500 searches allowed'); return }

    try {
      setLoading(true)
      setRows([])
      setError('')

      const response = await fetch('/api/sim-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searches: simNumbers }),
      })
      const result = await response.json()

      const allRows = []
      result.results?.forEach((item) => {
        item?.sims?.forEach((sim) => {
          const device = item.deviceInfo?.find((d) => d.simNo === sim.simNo)
          allRows.push({
            simNumber: sim.simNo || '-',
            mobileNumber: sim.mobileNo || '-',
            simStatus: sim.status || '-',
            plan: sim.planName || '-',
            imei: device?.deviceImei || '-',
            activationDate: sim.activationDate ? sim.activationDate.split('T')[0] : '-',
            safeCustodyDate: sim.safeCustodyDate ? sim.safeCustodyDate.split('T')[0] : '-',
          })
        })
      })
      setRows(allRows)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => { setSearch(''); setRows([]); setError('') }

  const downloadCSV = () => {
    if (!rows.length) { alert('No data available'); return }
    const headers = ['SIM Number', 'Mobile Number', 'SIM Status', 'Plan', 'IMEI No', 'Activation Date', 'Safe Custody Date']
    const csv = buildCSV(headers, rows.map((r) => [r.simNumber, r.mobileNumber, r.simStatus, r.plan, r.imei, r.activationDate, r.safeCustodyDate]))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `sim_explorer_${Date.now()}.csv`
    a.click()
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!user) return null

  return (
    <DashboardLayout activeTitle="SIM Explorer" user={user}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <p className="text-gray-500 mb-4">Bulk SIM Search — enter up to 500 SIM numbers, one per line</p>

            <textarea
              placeholder="Enter SIM Numbers (one per line, max 500)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              rows={10}
              className="w-full border rounded-2xl p-4 outline-none mb-4 text-sm"
            />

            <div className="flex gap-4 mb-6 flex-wrap">
              <button onClick={searchData} disabled={loading} className="bg-black text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-60">
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button onClick={downloadCSV} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold">Download CSV</button>
              <button onClick={clearData} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-semibold">Clear</button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-2xl mb-6">{error}</div>}

            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    {['SIM Number', 'Mobile Number', 'SIM Status', 'Plan', 'IMEI No', 'Activation Date', 'Safe Custody Date'].map((h) => (
                      <th key={h} className="border p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan="7" className="border p-8 text-center text-gray-500">No data found. Enter SIM numbers above and click Search.</td></tr>
                  ) : rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-3">{row.simNumber}</td>
                      <td className="border p-3">{row.mobileNumber}</td>
                      <td className="border p-3">{row.simStatus}</td>
                      <td className="border p-3">{row.plan}</td>
                      <td className="border p-3">{row.imei}</td>
                      <td className="border p-3">{row.activationDate}</td>
                      <td className="border p-3">{row.safeCustodyDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
