'use client'

import { useState } from 'react'

export default function Home() {
  const [simNo, setSimNo] = useState('')
  const [data, setData] = useState<any[]>([])
  const searchSim = async () => {
    const response = await fetch(`/api/sim?sim_no=${simNo}`)
    const result = await response.json()
    setData(result)
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        SIM Usage Lookup
      </h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter SIM Number"
          value={simNo}
          onChange={(e) => setSimNo(e.target.value)}
          className="border p-3 rounded w-full"
        />

        <button
          onClick={searchSim}
          className="bg-black text-white px-6 rounded"
        >
          Search
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Month</th>
            <th className="border p-2">SIM Number</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Plan</th>
            <th className="border p-2">Used Data</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row: any, index: number) => (
            <tr key={index}>
              <td className="border p-2">{row.usage_month}</td>
              <td className="border p-2">{row.sim_no}</td>
              <td className="border p-2">{row.sim_status}</td>
              <td className="border p-2">{row.plan}</td>
              <td className="border p-2">{row.used_data_mb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}