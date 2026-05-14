'use client'

import { useState } from 'react'

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [input, setInput] = useState('')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = () => {
    if (
      username === 'admin' &&
      password === 'admin123'
    ) {
      setLoggedIn(true)
      setError('')
    } else {
      setError('Invalid username or password')
    }
  }

  const searchBulk = async () => {
    setError('')

    const numbers = input
      .split('\\n')
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

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

          <h1 className="text-2xl font-bold mb-6 text-center">
            Login
          </h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            Login
          </button>

          {error && (
            <p className="text-red-600 mt-4 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

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
        </div>

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