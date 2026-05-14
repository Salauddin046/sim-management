'use client'

import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchBulk = async () => {
    setError('')

    const numbers = input
      .split('\n')
      .map((num) => num.trim())
      .filter(Boolean)

    if (!numbers.length) {
      setError('Please enter Phone Number or SIM numbers')
      return
    }

    if (numbers.length > 1000) {
      setError('Maximum 1000 searches allowed at one time')
      return
    }

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

      const grouped: any = {}

      result.forEach((row: any) => {
        const key = row.sim_no

        if (!grouped[key]) {
          grouped[key] = {
            sim_no: row.sim_no,
            msisdn: row.msisdn,
            sim_status: row.sim_status,
            plan: row.plan,
          }
        }

        grouped[key][row.usage_month] = row.used_data_mb
      })

      setData(Object.values(grouped))
    } catch (error) {
      console.error(error)
      setError('Search failed')
    }

    setLoading(false)
  }

  const downloadCSV = () => {
    if (!data.length) return

    const months = Array.from(
      new Set(
        data.flatMap((row: any) =>
          Object.keys(row).filter(
            (key) =>
              !['sim_no', 'msisdn', 'sim_status', 'plan'].includes(key)
          )
        )
      )
    )

    const headers = [
      'SIM Number',
      'Phone Number',
      'Status',
      'Plan',
      ...months,
    ]

    const rows = data.map((row: any) => [
      row.sim_no,
      row.msisdn,
      row.sim_status,
      row.plan,
      ...months.map((month: any) => row[month] || ''),
    ])

    const csvContent = [headers, ...rows]
      .map((e) => e.join(','))
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const link = document.createElement('a')

    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'sim_usage_data.csv')

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  }

  const months = Array.from(
    new Set(
      data.flatMap((row: any) =>
        Object.keys(row).filter(
          (key) =>
            !['sim_no', 'msisdn', 'sim_status', 'plan'].includes(key)
        )
      )
    )
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">

        <div className="mb-4">
          <textarea
            rows={10}
            placeholder="Search upto 1000 Phone or SIM numbers"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 outline-none"
          />
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={searchBulk}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Download CSV
          </button>
        </div>

        {error && (
          <p className="text-red-600 mb-4">
            {error}
          </p>
        )}

        {loading && (
          <p className="mb-4">
            Loading...
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3">SIM Number</th>
                <th className="border p-3">MSISDN</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Plan</th>

                {months.map((month: any) => (
                  <th key={month} className="border p-3">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((row: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-3">{row.sim_no}</td>
                    <td className="border p-3">{row.msisdn}</td>
                    <td className="border p-3">{row.sim_status}</td>
                    <td className="border p-3">{row.plan}</td>

                    {months.map((month: any) => (
                      <td
                        key={month}
                        className="border p-3 text-center"
                      >
                        {row[month] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={months.length + 4}
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