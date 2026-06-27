'use client'

import { useState } from 'react'
import { buildCSV } from '@/lib/csv'
import DashboardLayout from '@/lib/DashboardLayout'
import { useAuth } from '@/lib/useAuth'

export default function CommandCenterPage() {
  const { user, loading: authLoading } = useAuth()
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])

  const searchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/command-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search, fromDate, toDate }),
      })
      const result = await response.json()
      if (!result.success) { alert(result.message); return }
      setRows(result.data)
    } catch {
      alert('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => { setSearch(''); setFromDate(''); setToDate(''); setRows([]) }

  const downloadCSV = () => {
    if (!rows.length) { alert('No data found'); return }
    const headers = ['SIM Number', 'Phone Number', 'Device ID', 'Client Name', 'Activation Date', 'Termination Date', 'Safe Custody Move In', 'Safe Custody Move Out']
    const csv = buildCSV(headers, rows.map((row) => [
      row.sim_number, row.phone_number, row.device_id,
      row.client_name, row.activation_date, row.termination_date,
      row.safe_custody_move_in, row.safe_custody_move_out,
    ]))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `command_center_${Date.now()}.csv`
    a.click()
  }

  const totalRecords = rows.length
  const activeSims = rows.filter((r) => !r.termination_date).length
  const terminatedSims = rows.filter((r) => r.termination_date).length
  const safeCustodyIn = rows.filter((r) => r.safe_custody_move_in && r.safe_custody_move_in !== '').length
  const safeCustodyOut = rows.filter((r) => r.safe_custody_move_out && r.safe_custody_move_out !== '').length

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!user) return null

  return (
    <DashboardLayout activeTitle="Command Center" user={user}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6">

            {/* Search Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
              <input
                type="text"
                placeholder="Search SIM, Phone, Client, Device..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchData()}
                className="flex-1 min-w-[200px] border rounded-2xl px-4 py-3 outline-none"
              />
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-2xl px-4 py-3 outline-none" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded-2xl px-4 py-3 outline-none" />
              <button onClick={searchData} disabled={loading} className="bg-black text-white px-6 py-3 rounded-2xl font-semibold disabled:opacity-60">
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button onClick={clearData} className="border border-gray-300 px-6 py-3 rounded-2xl font-semibold">Clear</button>
              <button onClick={downloadCSV} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold">Download CSV</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total Records', value: totalRecords, color: 'bg-black' },
                { label: 'Active SIMs', value: activeSims, color: 'bg-green-600' },
                { label: 'Terminated', value: terminatedSims, color: 'bg-red-600' },
                { label: 'Safe Custody IN', value: safeCustodyIn, color: 'bg-yellow-500' },
                { label: 'Safe Custody OUT', value: safeCustodyOut, color: 'bg-purple-600' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} text-white rounded-3xl p-4 shadow-lg`}>
                  <p className="text-xs opacity-80 mb-1">{stat.label}</p>
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    {['SIM Number', 'Phone Number', 'Device ID', 'Client Name', 'Activation Date', 'Termination Date', 'Safe Custody In', 'Safe Custody Out'].map((h) => (
                      <th key={h} className="border p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan="8" className="border p-10 text-center text-gray-500">No data found. Use the search above.</td></tr>
                  ) : rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-3">{row.sim_number}</td>
                      <td className="border p-3">{row.phone_number}</td>
                      <td className="border p-3">{row.device_id}</td>
                      <td className="border p-3">{row.client_name}</td>
                      <td className="border p-3">{row.activation_date}</td>
                      <td className="border p-3">{row.termination_date}</td>
                      <td className="border p-3">{row.safe_custody_move_in}</td>
                      <td className="border p-3">{row.safe_custody_move_out}</td>
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
