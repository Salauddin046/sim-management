'use client'

import { useEffect, useState } from 'react'
import { buildCSV } from '@/lib/csv'
import DashboardLayout from '@/lib/DashboardLayout'
import { useAuth } from '@/lib/useAuth'

function Card({ title, value, color }) {
  return (
    <div className={`${color} text-white rounded-3xl p-4 shadow-lg`}>
      <p className="text-xs opacity-80 mb-1">{title}</p>
      <h2 className="text-2xl font-bold">{value.toLocaleString()}</h2>
    </div>
  )
}

export default function ControlTowerPage() {
  const { user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [counts, setCounts] = useState({ total_count: 0, available_count: 0, active_count: 0, active_test_mode_count: 0, temp_disconnect_count: 0, safe_custody_count: 0 })

  useEffect(() => {
    fetchData()
    fetchCounts()
  }, [])

  const fetchData = async (searchValue = '') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/control-tower?search=${encodeURIComponent(searchValue)}`)
      const result = await response.json()
      if (result.success) setRows(result.data || [])
    } catch {
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/dashboard-counts')
      const result = await response.json()
      if (result.success) setCounts(result)
    } catch {}
  }

  const downloadCSV = async () => {
    try {
      const response = await fetch('/api/control-tower?download=true')
      const result = await response.json()
      const data = result.data || []
      const headers = ['SIM No', 'Mobile No', 'Status', 'Activation Date', 'Safe Custody Date']
      const csvRows = [headers.join(','), ...data.map((row) => [row.sim_no, row.mobile_no, row.status, row.activation_date, row.safeCustody_date].join(','))]
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([csvRows.join('\n')], { type: 'text/csv' }))
      a.download = `sim_overview_${Date.now()}.csv`
      a.click()
    } catch {
      alert('Download failed')
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!user) return null

  return (
    <DashboardLayout activeTitle="SIM Overview" user={user}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-6">

          {/* Search */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search SIM / Mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData(search)}
              className="border rounded-2xl p-4 outline-none"
            />
            <button onClick={() => fetchData(search)} disabled={loading} className="bg-blue-600 text-white rounded-2xl font-semibold disabled:opacity-60">
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button onClick={downloadCSV} className="bg-purple-600 text-white rounded-2xl font-semibold">
              Download CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card title="Total" value={counts.total_count || 0} color="bg-indigo-600" />
            <Card title="Available" value={counts.available_count || 0} color="bg-cyan-600" />
            <Card title="Active" value={counts.active_count || 0} color="bg-green-600" />
            <Card title="Test Mode" value={counts.active_test_mode_count || 0} color="bg-pink-600" />
            <Card title="Temp Disconnect" value={counts.temp_disconnect_count || 0} color="bg-yellow-500" />
            <Card title="Safe Custody" value={counts.safe_custody_count || 0} color="bg-red-600" />
          </div>

          {/* Table */}
          <div className="overflow-auto border rounded-2xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-black text-white">
                  {['SIM No', 'Mobile No', 'Status', 'Activation Date', 'Safe Custody Date'].map((h) => (
                    <th key={h} className="border p-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="border p-10 text-center text-gray-500">Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan="5" className="border p-10 text-center text-gray-500">No data found</td></tr>
                ) : rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-4">{row.sim_no}</td>
                    <td className="border p-4">{row.mobile_no}</td>
                    <td className="border p-4">{row.status}</td>
                    <td className="border p-4">{row.activation_date}</td>
                    <td className="border p-4">{row.safeCustody_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
