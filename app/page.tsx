'use client'

import { useState } from 'react'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')

  const [selectedModule, setSelectedModule] = useState('')

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
        setMessage('Signup request sent to admin')
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
    setMessage('')

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
  ).sort((a: any, b: any) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-6">
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
              ? 'Create New Account'
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

  if (loggedIn && selectedModule !== 'sim') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div
            onClick={() => setSelectedModule('sim')}
            className="
              bg-white
              rounded-2xl
              shadow-lg
              p-8
              cursor-pointer
              hover:shadow-2xl
              transition
            "
          >
            <h2 className="text-2xl font-bold mb-4">
              SIM Usage
            </h2>

            <p className="text-gray-600">
              Search SIM and Phone usage data
            </p>
          </div>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold">
            SIM Usage Analytics
          </h1>

          <button
            onClick={() => setSelectedModule('')}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            Back To Dashboard
          </button>

        </div>

        <div className="mb-4">

          <textarea
            rows={10}
            placeholder="Search upto 1000 Phone or SIM numbers"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="
              w-full
              border
              border-gray-300
              rounded-lg
              p-4
              outline-none
            "
          />

        </div>

        <button
          onClick={searchBulk}
          className="
            bg-black
            text-white
            px-6
            py-3
            rounded-lg
            mb-4
          "
        >
          Search
        </button>

        {message && (
          <p className="text-red-600 mb-4">
            {message}
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

                <th className="border p-3">
                  SIM Number
                </th>

                <th className="border p-3">
                  MSISDN
                </th>

                <th className="border p-3">
                  Status
                </th>

                <th className="border p-3">
                  Plan
                </th>

                <th className="border p-3">
                  Min Data
                </th>

                <th className="border p-3">
                  Max Data
                </th>

                {months.map((month: any) => (
                  <th
                    key={month}
                    className="border p-3"
                  >
                    {month}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {data.length > 0 ? (
                data.map((row: any, index: number) => {

                  const usageValues = months.map(
                    (month: any) =>
                      Number(row[month] || 0)
                  )

                  const maxValue = Math.max(...usageValues)
                  const minValue = Math.min(...usageValues)

                  return (
                    <tr key={index}>

                      <td className="border p-3">
                        {row.sim_no}
                      </td>

                      <td className="border p-3">
                        {row.msisdn}
                      </td>

                      <td className="border p-3">
                        {row.sim_status}
                      </td>

                      <td className="border p-3">
                        {row.plan}
                      </td>

                      <td className="border p-3 text-center">
                        {minValue}
                      </td>

                      <td className="border p-3 text-center">
                        {maxValue}
                      </td>

                      {months.map((month: any) => {

                        const value = Number(
                          row[month] || 0
                        )

                        return (
                          <td
                            key={month}
                            className={`
                              border
                              p-3
                              text-center
                              ${
                                value === maxValue
                                  ? 'bg-green-300 font-bold'
                                  : ''
                              }
                            `}
                          >
                            {row[month] || '-'}
                          </td>
                        )
                      })}

                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={months.length + 6}
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