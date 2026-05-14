'use client'

import { useState } from 'react'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')

  const [input, setInput] = useState('')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setMessage('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Signup successful. Please login.')
        setIsLogin(true)
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('Signup failed')
    }
  }

  const handleLogin = async () => {
    setMessage('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setLoggedIn(true)
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('Login failed')
    }
  }

  const searchBulk = async () => {
    const numbers = input
      .split('\n')
      .map((num) => num.trim())
      .filter(Boolean)

    if (!numbers.length) {
      setMessage('Please enter Phone or SIM numbers')
      return
    }

    if (numbers.length > 1000) {
      setMessage('Maximum 1000 searches allowed')
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
      setMessage('Search failed')
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
            {isLogin ? 'Login' : 'Signup'}
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

          {isLogin ? (
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleSignup}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Signup
            </button>
          )}

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-blue-600"
          >
            {isLogin
              ? 'Create new account'
              : 'Already have account? Login'}
          </button>

          {message && (
            <p className="text-center mt-4 text-red-600">
              {message}
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

        <button
          onClick={searchBulk}
          className="bg-black text-white px-6 py-3 rounded-lg mb-4"
        >
          Search
        </button>

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
                <th className="border p-3">Phone Number</th>
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