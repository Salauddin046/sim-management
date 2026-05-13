'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const searchBulk = async () => {
    const numbers = input
      .split('\n')
      .map((num) => num.trim())
      .filter(Boolean)

    if (!numbers.length) return

    setLoading(true)

    try {
      const response = await fetch('/api/sim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numbers }),
      })

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">

        <div className="mb-4">
          <textarea
            rows={8}
            placeholder="MSISDN or SIM number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 outline-none"
          />
        </div>

        <button
          onClick={searchBulk}
          className="bg-black text-white px-6 py-3 rounded-lg mb-6"
        >
          Search
        </button>

        {loading && (
          <p className="mb-4">Loading...</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3">Month</th>
                <th className="border p-3">MSISDN</th>
                <th className="border p-3">SIM Number</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Plan</th>
                <th className="border p-3">Used Data (MB)</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((row: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-3">{row.usage_month}</td>
                    <td className="border p-3">{row.msisdn}</td>
                    <td className="border p-3">{row.sim_no}</td>
                    <td className="border p-3">{row.sim_status}</td>
                    <td className="border p-3">{row.plan}</td>
                    <td className="border p-3">{row.used_data_mb}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-4 text-center"
                  >
                    No data found
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