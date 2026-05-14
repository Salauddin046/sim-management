'use client'

import { useEffect, useState } from 'react'

export default function Home() {

  const [isLogin, setIsLogin] =
    useState(true)

  const [loggedIn, setLoggedIn] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [loggedUser, setLoggedUser] =
    useState<any>(null)

  const [name, setName] = useState('')

  const [email, setEmail] =
    useState('')

  const [username, setUsername] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [otp, setOtp] = useState('')

  const [generatedOtp, setGeneratedOtp] =
    useState('')

  const [otpSent, setOtpSent] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [captcha, setCaptcha] =
    useState('')

  const [captchaInput, setCaptchaInput] =
    useState('')

  const [input, setInput] =
    useState('')

  const [data, setData] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(false)

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
        Math.floor(
          Math.random() * chars.length
        )
      )
    }

    setCaptcha(text)

    setCaptchaInput('')
  }

  const sendOtp = async () => {

    setOtp('')
    setGeneratedOtp('')
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
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {

        setGeneratedOtp(
          result.otp.toString()
        )

        setOtpSent(true)

        setMessage(
          'OTP sent successfully'
        )

      } else {

        setMessage(result.error)
      }

    } catch (error) {

      console.error(error)

      setMessage('OTP failed')
    }
  }

  const verifyOtpAndSignup =
    async () => {

      setMessage('')

      if (otp !== generatedOtp) {

        setMessage('Invalid OTP')

        return
      }

      try {

        const response = await fetch(
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

        const result =
          await response.json()

        if (response.ok) {

          setMessage(
            'Account created successfully'
          )

          setIsLogin(true)

          setName('')
          setEmail('')
          setUsername('')
          setPassword('')
          setOtp('')

          setOtpSent(false)

          generateCaptcha()

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

    if (
      captchaInput.toUpperCase() !==
      captcha
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

        setLoggedUser(result.user)

        generateCaptcha()

      } else {

        generateCaptcha()

        setMessage(result.error)
      }

    } catch (error) {

      console.error(error)

      generateCaptcha()

      setMessage('Login failed')
    }
  }

  const handleForgotPassword =
    async () => {

      const mail = prompt(
        'Enter registered email'
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

        const result =
          await response.json()

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
        'Please enter SIM numbers'
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

  const downloadCSV = () => {

    if (!data.length) {

      setMessage('No data found')

      return
    }

    const headers = [
      'SIM Number',
      'MSISDN',
      'Status',
      'Plan',
      'Min Data',
      'Max Data',
      'Avg Data',
      'Zero Months',
      'Std Deviation',
      ...months,
    ]

    const rows = data.map(
      (row: any) => {

        const usageValues =
          months.map(
            (month: any) =>
              Number(
                row[month] || 0
              )
          )

        const maxValue =
          Math.max(...usageValues)

        const minValue =
          Math.min(...usageValues)

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

        const variance =
          usageValues.reduce(
            (
              acc: number,
              value: number
            ) =>
              acc +
              Math.pow(
                value -
                  Number(
                    averageValue
                  ),
                2
              ),
            0
          ) /
          usageValues.length

        const standardDeviation =
          Math.sqrt(
            variance
          ).toFixed(2)

        return [
          row.sim_no,
          row.msisdn,
          row.sim_status,
          row.plan,
          minValue,
          maxValue,
          averageValue,
          zeroMonths,
          standardDeviation,
          ...months.map(
            (month: any) =>
              row[month] || 0
          ),
        ]
      }
    )

    const csvContent =
      [
        headers.join(','),
        ...rows.map((e: any) =>
          e.join(',')
        ),
      ].join('\n')

    const blob = new Blob(
      [csvContent],
      {
        type:
          'text/csv;charset=utf-8;',
      }
    )

    const link =
      document.createElement('a')

    const url =
      URL.createObjectURL(blob)

    const timestamp =
      new Date()
        .toISOString()
        .replace(/[:.]/g, '-')

    link.setAttribute('href', url)

    link.setAttribute(
      'download',
      `sim_usage_report_${timestamp}.csv`
    )

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
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
              onClick={
                verifyOtpAndSignup
              }
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
              onClick={
                handleForgotPassword
              }
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

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <div className="flex justify-between items-center mb-6 relative">

          <h1 className="text-4xl font-bold">
            Data Usage Dashboard
          </h1>

          <div className="relative">

            <button
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              className="w-12 h-12 rounded-full bg-black text-white text-xl font-bold"
            >
              {loggedUser?.username
                ?.charAt(0)
                ?.toUpperCase() || 'U'}
            </button>

            {profileOpen && (

              <div className="absolute right-0 mt-3 bg-white border border-gray-300 rounded-xl shadow-lg w-72 p-5 z-50">

                <h2 className="font-bold text-xl mb-4">
                  Profile
                </h2>

                <div className="space-y-2">

                  <p>
                    <strong>Name:</strong>{' '}
                    {loggedUser?.name || '-'}
                  </p>

                  <p>
                    <strong>Email:</strong>{' '}
                    {loggedUser?.email || '-'}
                  </p>

                  <p>
                    <strong>Username:</strong>{' '}
                    {loggedUser?.username || '-'}
                  </p>

                </div>

                <button
                  onClick={() => {

                    setLoggedIn(false)

                    setLoggedUser(null)

                    setProfileOpen(false)

                    generateCaptcha()
                  }}
                  className="w-full bg-red-500 text-white py-2 rounded-lg mt-5"
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        <textarea
          rows={8}
          placeholder="Search upto 1000 SIM numbers"
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          className="w-full border border-gray-300 rounded-xl p-4 mb-4"
        />

        <div className="flex gap-4 flex-wrap mb-6 items-center">

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

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-lg px-4 py-3"
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
                className="border border-gray-300 rounded-lg px-4 py-3"
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
                className="border border-gray-300 rounded-lg px-4 py-3"
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

        {loading && (
          <p className="mb-4 text-lg">
            Loading...
          </p>
        )}

      </div>

    </div>
  )
}