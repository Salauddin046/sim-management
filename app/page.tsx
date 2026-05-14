'use client'

import { useEffect, useState } from 'react'

export default function Home() {

  const [isLogin, setIsLogin] =
    useState(true)

  const [loggedIn, setLoggedIn] =
    useState(false)

  const [loggedUser, setLoggedUser] =
    useState<any>(null)

  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [username, setUsername] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [otp, setOtp] =
    useState('')

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

  const [originalData, setOriginalData] =
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

      const result =
        await response.json()

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
            'Signup successful'
          )

          setIsLogin(true)

          setOtpSent(false)

        } else {

          setMessage(result.error)
        }

      } catch (error) {

        console.error(error)

        setMessage('Signup failed')
      }
    }

  const handleLogin = async () => {

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

      const result =
        await response.json()

      if (response.ok) {

        setLoggedIn(true)

        setLoggedUser(result.user)

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

      setMessage(
        'Please enter SIM numbers'
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

      const result =
        await response.json()

      const grouped: any = {}

      result.forEach((row: any) => {

        const key = row.sim_no

        if (!grouped[key]) {

          grouped[key] = {
            sim_no: row.sim_no,
            msisdn: row.msisdn,
            sim_status:
              row.sim_status,
            plan: row.plan,
          }
        }

        grouped[key][
          row.usage_month
        ] = Number(
          row.used_data_mb || 0
        )
      })

      const finalData =
        Object.values(grouped)

      setData(finalData)

      setOriginalData(finalData)

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
  ).sort(
    (
      a: any,
      b: any
    ) => {

      const dateA =
        new Date(a)

      const dateB =
        new Date(b)

      return (
        dateA.getTime() -
        dateB.getTime()
      )
    }
  )

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
        month >= fromMonth &&
        month <= toMonth
    )
  }

  const handleSort = (
    key: string,
    direction: string
  ) => {

    const sorted = [...data]

    sorted.sort(
      (
        a: any,
        b: any
      ) => {

        const valueA =
          a[key] || 0

        const valueB =
          b[key] || 0

        if (
          typeof valueA === 'string'
        ) {

          return direction === 'asc'
            ? valueA.localeCompare(
                valueB
              )
            : valueB.localeCompare(
                valueA
              )
        }

        return direction === 'asc'
          ? Number(valueA) -
              Number(valueB)
          : Number(valueB) -
              Number(valueA)
      }
    )

    setData(sorted)
  }

  const downloadCSV = () => {

    const headers = [
      'SIM Number',
      'MSISDN',
      'Status',
      'Plan',
      'Min Data',
      'Max Data',
      'Total Data',
      'Avg Data',
      'Consumed Months',
      'Zero Months',
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

        const totalUsage =
          usageValues.reduce(
            (
              a: number,
              b: number
            ) => a + b,
            0
          )

        const averageValue = (
          totalUsage /
          usageValues.length
        ).toFixed(2)

        const consumedMonths =
          usageValues.filter(
            (
              value: number
            ) => value > 0
          ).length

        const zeroMonths =
          usageValues.filter(
            (
              value: number
            ) => value === 0
          ).length

        return [
          row.sim_no,
          row.msisdn,
          row.sim_status,
          row.plan,
          minValue,
          maxValue,
          totalUsage,
          averageValue,
          consumedMonths,
          zeroMonths,
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

    link.href = url

    link.download =
      `sim_usage_report_${timestamp}.csv`

    link.click()
  }

  if (!loggedIn) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-6">
            {isLogin
              ? 'Login'
              : 'Signup'}
          </h1>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded-lg mb-4"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded-lg mb-4"
              />
            </>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-lg mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-lg mb-4"
          />

          {!isLogin && otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg mb-4"
            />
          )}

          {isLogin && (
            <>
              <div className="bg-gray-200 text-center p-3 rounded-lg mb-3 font-bold tracking-widest">
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
                className="w-full border p-3 rounded-lg mb-4"
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

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-4xl font-bold">
            Telecom Dashboard
          </h1>

          <button
            className="w-12 h-12 rounded-full bg-black text-white"
          >
            {loggedUser?.username
              ?.charAt(0)
              ?.toUpperCase() || 'U'}
          </button>

        </div>

        <div className="mb-4 flex justify-start">

          <div className="w-full max-w-xl">

            <textarea
              rows={4}
              placeholder="Enter SIM numbers"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                p-3
                text-sm
                resize-none
              "
            />

            <p className="text-xs text-gray-500 mt-2">
              Maximum 1000 SIM numbers
            </p>

          </div>

        </div>

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

          <button
            onClick={() =>
              setData(originalData)
            }
            className="bg-gray-500 text-white px-6 py-3 rounded-lg"
          >
            Reset Filter
          </button>

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value
              )
            }
            className="border rounded-lg px-4 py-3"
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

        </div>

        {loading && (
          <p className="mb-4">
            Loading...
          </p>
        )}

        <div className="overflow-auto rounded-xl border border-gray-300">

          <table className="w-full border-collapse text-sm">

            <thead className="bg-gray-200 sticky top-0 z-10">

              <tr>

                {[
                  {
                    label:
                      'SIM Number',
                    key: 'sim_no',
                  },

                  {
                    label:
                      'Phone Number',
                    key: 'msisdn',
                  },

                  {
                    label:
                      'Status',
                    key:
                      'sim_status',
                  },

                  {
                    label:
                      'Plan',
                    key: 'plan',
                  },
                ].map(
                  (
                    header: any
                  ) => (

                    <th
                      key={
                        header.key
                      }
                      className="border p-3 min-w-[200px]"
                    >

                      <div className="flex flex-col gap-2">

                        <span className="font-semibold">
                          {
                            header.label
                          }
                        </span>

                        <select
                          className="
                            border
                            rounded
                            px-2
                            py-1
                            text-xs
                          "
                          onChange={(
                            e
                          ) => {

                            const value =
                              e
                                .target
                                .value

                            if (
                              value ===
                              'asc'
                            ) {

                              handleSort(
                                header.key,
                                'asc'
                              )
                            }

                            if (
                              value ===
                              'desc'
                            ) {

                              handleSort(
                                header.key,
                                'desc'
                              )
                            }
                          }}
                        >

                          <option value="">
                            Filter
                          </option>

                          <option value="asc">
                            A → Z
                          </option>

                          <option value="desc">
                            Z → A
                          </option>

                        </select>

                      </div>

                    </th>
                  )
                )}

                <th className="border p-3">
                  Min Data (MB)
                </th>

                <th className="border p-3">
                  Max Data (MB)
                </th>

                <th className="border p-3">
                  Total Data (MB)
                </th>

                <th className="border p-3">
                  Avg Data (MB)
                </th>

                <th className="border p-3">
                  Data Consumed Months
                </th>

                <th className="border p-3">
                  Zero Data conusmed Months
                </th>

                {months.map(
                  (month: any) => (

                    <th
                      key={month}
                      className="border p-3 min-w-[220px]"
                    >

                      <div className="flex flex-col gap-2">

                        <span>
                          {month} (MB)
                        </span>

                        <select
                          className="
                            border
                            rounded
                            px-2
                            py-1
                            text-xs
                          "
                          onChange={(
                            e
                          ) => {

                            const value =
                              e
                                .target
                                .value

                            const sorted =
                              [
                                ...data,
                              ]

                            if (
                              value ===
                              'asc'
                            ) {

                              sorted.sort(
                                (
                                  a: any,
                                  b: any
                                ) =>
                                  Number(
                                    a[
                                      month
                                    ] ||
                                      0
                                  ) -
                                  Number(
                                    b[
                                      month
                                    ] ||
                                      0
                                  )
                              )
                            }

                            if (
                              value ===
                              'desc'
                            ) {

                              sorted.sort(
                                (
                                  a: any,
                                  b: any
                                ) =>
                                  Number(
                                    b[
                                      month
                                    ] ||
                                      0
                                  ) -
                                  Number(
                                    a[
                                      month
                                    ] ||
                                      0
                                  )
                              )
                            }

                            if (
                              value ===
                              'green'
                            ) {

                              const filtered =
                                sorted.filter(
                                  (
                                    row: any
                                  ) =>
                                    Number(
                                      row[
                                        month
                                      ] ||
                                        0
                                    ) > 0
                                )

                              setData(
                                filtered
                              )

                              return
                            }

                            setData(
                              sorted
                            )
                          }}
                        >

                          <option value="">
                            Filter
                          </option>

                          <option value="asc">
                            Low → High
                          </option>

                          <option value="desc">
                            High → Low
                          </option>

                          <option value="green">
                            Highlighted
                          </option>

                        </select>

                        <input
                          type="number"
                          placeholder="Filter value"
                          className="
                            border
                            rounded
                            px-2
                            py-1
                            text-xs
                          "
                          onChange={(
                            e
                          ) => {

                            const filterValue =
                              Number(
                                e
                                  .target
                                  .value
                              )

                            if (
                              !e
                                .target
                                .value
                            ) {

                              setData(
                                originalData
                              )

                              return
                            }

                            const filtered =
                              originalData.filter(
                                (
                                  row: any
                                ) =>
                                  Number(
                                    row[
                                      month
                                    ] ||
                                      0
                                  ) ===
                                  filterValue
                              )

                            setData(
                              filtered
                            )
                          }}
                        />

                      </div>

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
                      (
                        month: any
                      ) =>
                        Number(
                          row[
                            month
                          ] || 0
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

                  const totalUsage =
                    usageValues.reduce(
                      (
                        a: number,
                        b: number
                      ) => a + b,
                      0
                    )

                  const averageValue =
                    (
                      totalUsage /
                      usageValues.length
                    ).toFixed(2)

                  const consumedMonths =
                    usageValues.filter(
                      (
                        value: number
                      ) =>
                        value > 0
                    ).length

                  const zeroMonths =
                    usageValues.filter(
                      (
                        value: number
                      ) =>
                        value === 0
                    ).length

                  return (

                    <tr
                      key={index}
                      className="hover:bg-gray-50"
                    >

                      <td className="border p-3">
                        {row.sim_no}
                      </td>

                      <td className="border p-3">
                        {row.msisdn}
                      </td>

                      <td className="border p-3">
                        {
                          row.sim_status
                        }
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

                      <td className="border p-3 text-center font-semibold">
                        {totalUsage}
                      </td>

                      <td className="border p-3 text-center">
                        {
                          averageValue
                        }
                      </td>

                      <td className="border p-3 text-center">
                        {
                          consumedMonths
                        }
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