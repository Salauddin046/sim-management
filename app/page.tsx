'use client'

import { useState } from 'react'

export default function Home() {
  const [simNo, setSimNo] = useState('')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const searchSim = async () => {
    if (!simNo) return

    setLoading(true)

    try {
      const response = await fetch(`/api/sim?sim_no=${simNo}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search SIM Number"
            value={simNo}
            onChange={(e) => setSimNo(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full outline-none"
          />

          <button
            onClick={searchSim}
            className="bg-black text-white px-6 rounded-lg hover:bg-gray-800"
          >
            Search
          </button>
        </div>

        {loading && (
          <p className="mb-4 text-gray-600">Loading...</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3">Month</th>
                <th className="border p-3">SIM Number</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Plan</th>
                <th className="border p-3">Used Data (MB)</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-3">{row.usage_month}</td>
                    <td className="border p-3">{row.sim_no}</td>
                    <td className="border p-3">{row.sim_status}</td>
                    <td className="border p-3">{row.plan}</td>
                    <td className="border p-3">{row.used_data_mb}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="border p-4 text-center text-gray-500"
                  >
                    No SIM data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
