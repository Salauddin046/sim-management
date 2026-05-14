'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [message, setMessage] = useState('')

  const [captcha, setCaptcha] = useState('')
  const [captchaInput, setCaptchaInput] =
    useState('')

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [user, setUser] = useState<any>(null)

  const [input, setInput] = useState('')
  const [data, setData] = useState<any[]>([])

  const [loading, setLoading] = useState(false)

  const [filterType, setFilterType] =
    useState('6months')

  const [fromMonth, setFromMonth] =
    useState('')

  const [toMonth, setToMonth] =
    useState('')

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

    let text = ''

    for (let i = 0; i < 6; i++) {
      text += chars.charAt(
        Math.floor(Math.random() * chars.length)
      )
    }

    setCaptcha(text)
  }

  const sendOtp = async () => {
    setMessage('')

    try {
      const response = await fetch(
        '/api/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email,
            username,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setMessage('OTP sent to email')
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('OTP failed')
    }
  }

  const verifyOtpAndSignup = async () => {
    setMessage('')

    try {
      const verifyResponse = await fetch(
        '/api/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username,
            otp,
          }),
        }
      )

      const verifyResult =
        await verifyResponse.json()

      if (!verifyResponse.ok) {
        setMessage(verifyResult.error)
        return
      }

      const signupResponse = await fetch(
        '/api/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            username,
            password,
          }),
        }
      )

      const signupResult =
        await signupResponse.json()

      if (signupResponse.ok) {
        setMessage(
          'Signup request sent to admin'
        )

        setIsLogin(true)

        setOtpSent(false)

        setName('')
        setEmail('')
        setUsername('')
        setPassword('')
        setOtp('')
      } else {
        setMessage(signupResult.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('Signup failed')
    }
  }

  const handleLogin = async () => {
    setMessage('')

    if (
      captchaInput.toUpperCase() !== captcha
    ) {
      setMessage('Invalid CAPTCHA')
      generateCaptcha()
      return
    }

    try {
      const response = await fetch(
        '/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        setLoggedIn(true)
        setUser(result.user)
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('Login failed')
    }
  }

  const handleForgotPassword = async () => {
    const mail = prompt(
      'Enter your registered email'
    )

    if (!mail) return

    try {
      const response = await fetch(
        '/api/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: mail,
          }),
        }
      )

      const result = await response.json()

      setMessage(
        result.message || result.error
      )
    } catch (error) {
      console.error(error)
      setMessage('Failed')
    }
  }

  const searchBulk = async () => {
    setMessage('')

    const numbers = input
      .split('\n')
      .map((num) => num.trim())
      .filter(Boolean)

    if (!numbers.length) {
      setMessage(
        'Please enter SIM or phone numbers'
      )
      return
    }

    if (numbers.length > 1000) {
      setMessage(
        'Maximum 1000 searches allowed'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        '/api/sim',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            numbers,
          }),
        }
      )

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

        grouped[key][row.usage_month] =
          Number(row.used_data_mb || 0)
      })

      setData(Object.values(grouped))
    } catch (error) {
      console.error(error)
      setMessage('Search failed')
    }

    setLoading(false)
  }

  const allMonths = Array.from(
    new Set(
      data.flatMap((row: any) =>
        Object.keys(row).filter(
          (key) =>
            ![
              'sim_no',
              'msisdn',
              'sim_status',
              'plan',
            ].includes(key)
        )
      )
    )
  ).sort((a: any, b: any) => {
    return (
      new Date(a).getTime() -
      new Date(b).getTime()
    )
  })

  let months = [...allMonths]

  if (filterType === '6months') {
    months = allMonths.slice(-6)
  }

  if (filterType === '1year') {
    months = allMonths.slice(-12)
  }

  if (
    filterType === 'custom' &&
    fromMonth &&
    toMonth
  ) {
    months = allMonths.filter(
      (month: any) =>
        new Date(month) >=
          new Date(fromMonth) &&
        new Date(month) <=
          new Date(toMonth)
    )
  }

  const logout = () => {
    setLoggedIn(false)
    setUser(null)
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-6">
            {isLogin ? 'Login' : 'Signup'}
          </h1>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              />
            </>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />

          {!isLogin && otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />
          )}

          {isLogin && (
            <>
              <div className="bg-gray-200 text-center p-3 rounded-lg mb-3 text-xl font-bold tracking-widest">
                {captcha}
              </div>

              <input
                type="text"
                placeholder="Enter CAPTCHA"
                value={captchaInput}
                onChange={(e) =>
                  setCaptchaInput(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              />
            </>
          )}

          {isLogin ? (
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Login
            </button>
          ) : otpSent ? (
            <button
              onClick={verifyOtpAndSignup}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Verify OTP & Signup
            </button>
          ) : (
            <button
              onClick={sendOtp}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              Send OTP
            </button>
          )}

          {isLogin && (
            <button
              onClick={handleForgotPassword}
              className="w-full mt-4 text-blue-600"
            >
              Forgot Password?
            </button>
          )}

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Telecom Dashboard
        </h1>

        <div className="flex gap-4">

          <button
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            className="bg-white px-4 py-2 rounded-lg shadow"
          >
            {user?.name || 'Profile'}
          </button>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>

      {profileOpen && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <h2 className="text-2xl font-bold mb-4">
            Profile
          </h2>

          <p className="mb-2">
            <b>Name:</b> {user?.name}
          </p>

          <p className="mb-2">
            <b>Email:</b> {user?.email}
          </p>

          <p className="mb-2">
            <b>Username:</b>{' '}
            {user?.username}
          </p>

        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div className="flex gap-4 mb-4 flex-wrap">

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-lg p-3"
          >
            <option value="6months">
              Last 6 Months
            </option>

            <option value="1year">
              Last 1 Year
            </option>

            <option value="custom">
              Custom Range
            </option>
          </select>

          {filterType === 'custom' && (
            <>
              <select
                value={fromMonth}
                onChange={(e) =>
                  setFromMonth(
                    e.target.value
                  )
                }
                className="border border-gray-300 rounded-lg p-3"
              >
                <option value="">
                  From Month
                </option>

                {allMonths.map(
                  (month: any) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  )
                )}
              </select>

              <select
                value={toMonth}
                onChange={(e) =>
                  setToMonth(
                    e.target.value
                  )
                }
                className="border border-gray-300 rounded-lg p-3"
              >
                <option value="">
                  To Month
                </option>

                {allMonths.map(
                  (month: any) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  )
                )}
              </select>
            </>
          )}

        </div>

        <textarea
          rows={8}
          placeholder="Search upto 1000 SIM or phone numbers"
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg p-4 mb-4"
        />

        <button
          onClick={searchBulk}
          className="bg-black text-white px-6 py-3 rounded-lg mb-6"
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

                <th className="border p-3">
                  Avg Data
                </th>

                <th className="border p-3">
                  Zero Usage Months
                </th>

                {months.map(
                  (month: any) => (
                    <th
                      key={month}
                      className="border p-3"
                    >
                      {month}
                    </th>
                  )
                )}

              </tr>
            </thead>

            <tbody>

              {data.map(
                (
                  row: any,
                  index: number
                ) => {

                  const usageValues =
                    months.map(
                      (month: any) =>
                        Number(
                          row[month] || 0
                        )
                    )

                  const maxValue =
                    Math.max(
                      ...usageValues
                    )

                  const minValue =
                    Math.min(
                      ...usageValues
                    )

                  const averageValue = (
                    usageValues.reduce(
                      (
                        a: number,
                        b: number
                      ) => a + b,
                      0
                    ) /
                    usageValues.length
                  ).toFixed(2)

                  const zeroMonths =
                    usageValues.filter(
                      (
                        value: number
                      ) => value === 0
                    ).length

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

                      <td className="border p-3 text-center">
                        {averageValue}
                      </td>

                      <td className="border p-3 text-center">
                        {zeroMonths}
                      </td>

                      {months.map(
                        (
                          month: any
                        ) => {

                          const value =
                            Number(
                              row[
                                month
                              ] || 0
                            )

                          return (
                            <td
                              key={
                                month
                              }
                              className={`
                                border
                                p-3
                                text-center
                                ${
                                  value ===
                                  maxValue
                                    ? 'bg-green-300 font-bold'
                                    : ''
                                }
                              `}
                            >
                              {value}
                            </td>
                          )
                        }
                      )}

                    </tr>
                  )
                }
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}