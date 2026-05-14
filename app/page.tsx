'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

export default function Home() {

  const [input, setInput] =
    useState('')

  const [data, setData] =
    useState<any[]>([])

  const [originalData, setOriginalData] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [loggedUser, setLoggedUser] =
    useState<any>(null)

  const [filterType, setFilterType] =
    useState('all')

  const [fromMonth, setFromMonth] =
    useState('')

  const [toMonth, setToMonth] =
    useState('')

  useEffect(() => {

    const user =
      localStorage.getItem(
        'user'
      )

    if (user) {

      setLoggedUser(
        JSON.parse(user)
      )
    }

    let timeout: any

    const logoutUser = () => {

      localStorage.clear()

      sessionStorage.clear()

      alert(
        'Session expired'
      )

      window.location.reload()
    }

    const resetTimer = () => {

      clearTimeout(timeout)

      timeout = setTimeout(
        logoutUser,
        10 * 60 * 1000
      )
    }

    resetTimer()

    window.addEventListener(
      'mousemove',
      resetTimer
    )

    window.addEventListener(
      'keydown',
      resetTimer
    )

    window.addEventListener(
      'click',
      resetTimer
    )

    return () => {

      clearTimeout(timeout)

      window.removeEventListener(
        'mousemove',
        resetTimer
      )

      window.removeEventListener(
        'keydown',
        resetTimer
      )

      window.removeEventListener(
        'click',
        resetTimer
      )
    }

  }, [])

  const searchBulk = async () => {

    const numbers = input
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)

    if (!numbers.length) {

      alert(
        'Enter SIM numbers'
      )

      return
    }

    setLoading(true)

    try {

      const response =
        await fetch(
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

      result.forEach(
        (row: any) => {

          const key =
            row.sim_no

          if (
            !grouped[key]
          ) {

            grouped[key] = {
              sim_no:
                row.sim_no,

              msisdn:
                row.msisdn,

              sim_status:
                row.sim_status,

              plan:
                row.plan,
            }
          }

          grouped[key][
            row.usage_month
          ] = Number(
            row.used_data_mb || 0
          )
        }
      )

      const finalData =
        Object.values(grouped)

      setData(finalData)

      setOriginalData(finalData)

    } catch (err) {

      console.error(err)

      alert(
        'Search failed'
      )

    } finally {

      setLoading(false)
    }
  }

  const allMonths =
    useMemo(() => {

      return Array.from(
        new Set(
          data.flatMap(
            (row: any) =>
              Object.keys(
                row
              ).filter(
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
        ) =>
          new Date(a)
            .getTime() -
          new Date(b)
            .getTime()
      )

    }, [data])

  const months =
    useMemo(() => {

      if (
        filterType ===
        '6months'
      ) {

        return allMonths.slice(
          -6
        )
      }

      if (
        filterType ===
        '1year'
      ) {

        return allMonths.slice(
          -12
        )
      }

      if (
        filterType ===
          'custom' &&
        fromMonth &&
        toMonth
      ) {

        return allMonths.filter(
          (
            month: any
          ) =>
            month >=
              fromMonth &&
            month <=
              toMonth
        )
      }

      return allMonths

    }, [
      allMonths,
      filterType,
      fromMonth,
      toMonth,
    ])

  const sortData = (
    key: string,
    direction: string,
    isMonth = false
  ) => {

    const sorted =
      [...data]

    sorted.sort(
      (
        a: any,
        b: any
      ) => {

        const valueA =
          isMonth
            ? Number(
                a[key] || 0
              )
            : (
                a[key] || ''
              )
                .toString()

        const valueB =
          isMonth
            ? Number(
                b[key] || 0
              )
            : (
                b[key] || ''
              )
                .toString()

        if (isMonth) {

          return direction ===
            'asc'
            ? valueA - valueB
            : valueB - valueA
        }

        return direction ===
          'asc'
          ? valueA.localeCompare(
              valueB
            )
          : valueB.localeCompare(
              valueA
            )
      }
    )

    setData(sorted)
  }

  const logout = () => {

    localStorage.clear()

    sessionStorage.clear()

    window.location.reload()
  }

  const downloadCSV = () => {

    const headers = [
      'SIM Number',
      'MSISDN',
      'Status',
      'Plan',
      'Min',
      'Max',
      'Total',
      'Avg',
      'Used',
      'Zero',
      ...months.map(
        (month) =>
          `${month} (MB)`
      ),
    ]

    const rows =
      data.map(
        (row: any) => {

          const usageValues =
            months.map(
              (month) =>
                Number(
                  row[
                    month
                  ] || 0
                )
            )

          const min =
            Math.min(
              ...usageValues
            )

          const max =
            Math.max(
              ...usageValues
            )

          const total =
            usageValues.reduce(
              (
                a,
                b
              ) => a + b,
              0
            )

          const avg =
            (
              total /
              usageValues.length
            ).toFixed(2)

          const used =
            usageValues.filter(
              (
                value
              ) =>
                value > 0
            ).length

          const zero =
            usageValues.filter(
              (
                value
              ) =>
                value === 0
            ).length

          return [
            row.sim_no,
            row.msisdn,
            row.sim_status,
            row.plan,
            min,
            max,
            total.toFixed(2),
            avg,
            used,
            zero,
            ...months.map(
              (
                month
              ) =>
                row[
                  month
                ] || 0
            ),
          ]
        }
      )

    const csv =
      [
        headers.join(','),
        ...rows.map(
          (row) =>
            row.join(',')
        ),
      ].join('\n')

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv',
        }
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        'a'
      )

    link.href = url

    link.download =
      `sim_usage_report_${Date.now()}.csv`

    link.click()
  }

  return (

    <div className="min-h-screen bg-gray-100 p-4">

      <div className="bg-white rounded-xl shadow-lg p-4">

        <div className="flex justify-between items-center mb-4">

          <h1 className="text-2xl font-bold">
            Telecom Dashboard
          </h1>

          <div className="relative">

            <button
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              className="
                bg-black
                text-white
                px-3
                py-2
                rounded-lg
                flex
                items-center
                gap-2
              "
            >

              <div className="
                w-7
                h-7
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                font-bold
              ">
                {loggedUser?.username
                  ?.charAt(0)
                  ?.toUpperCase() || 'U'}
              </div>

              <span>
                {
                  loggedUser?.username ||
                  'User'
                }
              </span>

            </button>

            {profileOpen && (

              <div className="
                absolute
                right-0
                mt-2
                w-72
                bg-white
                border
                rounded-lg
                shadow-lg
                z-50
              ">

                <div className="
                  p-4
                  border-b
                  space-y-3
                ">

                  <div>

                    <p className="
                      text-[11px]
                      text-gray-500
                    ">
                      Username
                    </p>

                    <p className="
                      font-semibold
                      text-sm
                    ">
                      {
                        loggedUser?.username
                      }
                    </p>

                  </div>

                  <div>

                    <p className="
                      text-[11px]
                      text-gray-500
                    ">
                      Name
                    </p>

                    <p className="
                      font-semibold
                      text-sm
                    ">
                      {
                        loggedUser?.name
                      }
                    </p>

                  </div>

                  <div>

                    <p className="
                      text-[11px]
                      text-gray-500
                    ">
                      Email
                    </p>

                    <p className="
                      font-semibold
                      text-sm
                    ">
                      {
                        loggedUser?.email
                      }
                    </p>

                  </div>

                </div>

                <button
                  onClick={logout}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    text-red-600
                    hover:bg-gray-100
                  "
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        <textarea
          rows={4}
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Enter SIM numbers"
          className="
            w-full
            max-w-lg
            border
            rounded-lg
            p-2
            text-sm
            mb-4
          "
        />

        <div className="
          flex
          flex-wrap
          gap-3
          mb-4
        ">

          <button
            onClick={searchBulk}
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            {loading
              ? 'Loading...'
              : 'Search'}
          </button>

          <button
            onClick={downloadCSV}
            className="
              bg-green-600
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Download CSV
          </button>

          <button
            onClick={() =>
              setData(
                originalData
              )
            }
            className="
              bg-gray-500
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Reset Filter
          </button>

        </div>

        <div className="
          overflow-auto
          border
          rounded-lg
          max-h-[650px]
        ">

          <table className="
            w-full
            border-collapse
            text-xs
          ">

            <thead className="
              bg-gray-200
              sticky
              top-0
              z-10
            ">

              <tr>

                <th className="border p-1">
                  SIM
                </th>

                <th className="border p-1">
                  MSISDN
                </th>

                <th className="border p-1">
                  Status
                </th>

                <th className="border p-1">
                  Plan
                </th>

                <th className="border p-1">
                  Min
                </th>

                <th className="border p-1">
                  Max
                </th>

                <th className="border p-1">
                  Total
                </th>

                <th className="border p-1">
                  Avg
                </th>

                <th className="border p-1">
                  Used
                </th>

                <th className="border p-1">
                  Zero
                </th>

                {months.map(
                  (month) => (

                    <th
                      key={month}
                      className="
                        border
                        p-1
                        min-w-[80px]
                        text-[10px]
                      "
                    >
                      {month} (MB)
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
                      (month) =>
                        Number(
                          row[
                            month
                          ] || 0
                        )
                    )

                  const min =
                    Math.min(
                      ...usageValues
                    )

                  const max =
                    Math.max(
                      ...usageValues
                    )

                  const total =
                    usageValues.reduce(
                      (
                        a,
                        b
                      ) => a + b,
                      0
                    )

                  const avg =
                    (
                      total /
                      usageValues.length
                    ).toFixed(2)

                  const used =
                    usageValues.filter(
                      (
                        value
                      ) =>
                        value > 0
                    ).length

                  const zero =
                    usageValues.filter(
                      (
                        value
                      ) =>
                        value === 0
                    ).length

                  return (

                    <tr
                      key={index}
                      className="
                        hover:bg-gray-50
                      "
                    >

                      <td className="border p-1 text-center">
                        {row.sim_no}
                      </td>

                      <td className="border p-1 text-center">
                        {row.msisdn}
                      </td>

                      <td className="border p-1 text-center">
                        {row.sim_status}
                      </td>

                      <td className="border p-1 text-center">
                        {row.plan}
                      </td>

                      <td className="border p-1 text-center">
                        {min}
                      </td>

                      <td className="border p-1 text-center">
                        {max}
                      </td>

                      <td className="border p-1 text-center">
                        {total.toFixed(2)}
                      </td>

                      <td className="border p-1 text-center">
                        {avg}
                      </td>

                      <td className="border p-1 text-center">
                        {used}
                      </td>

                      <td className="border p-1 text-center">
                        {zero}
                      </td>

                      {months.map(
                        (month) => (

                          <td
                            key={month}
                            className="
                              border
                              p-1
                              text-center
                              text-[10px]
                            "
                          >
                            {
                              row[
                                month
                              ] || 0
                            }
                          </td>
                        )
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