'use client'

import {
  useEffect,
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

  const [filterType, setFilterType] =
    useState('all')

  const [fromMonth, setFromMonth] =
    useState('')

  const [toMonth, setToMonth] =
    useState('')

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [loggedUser, setLoggedUser] =
    useState<any>(null)

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

    const resetTimer = () => {

      clearTimeout(timeout)

      timeout = setTimeout(() => {

        localStorage.removeItem(
          'user'
        )

        alert(
          'Session expired. Logged out automatically.'
        )

        window.location.reload()

      }, 10 * 60 * 1000)
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

    window.addEventListener(
      'scroll',
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

      window.removeEventListener(
        'scroll',
        resetTimer
      )
    }

  }, [])

  const searchBulk = async () => {

    const numbers = input
      .split('\n')
      .map((num) => num.trim())
      .filter(Boolean)

    if (!numbers.length) {

      alert(
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

        const key =
          row.sim_no

        if (!grouped[key]) {

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
      })

      const finalData =
        Object.values(grouped)

      setData(finalData)

      setOriginalData(finalData)

    } catch (error) {

      console.error(error)

      alert(
        'Search failed'
      )
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

  let months =
    [...allMonths]

  if (
    filterType ===
    '6months'
  ) {

    months =
      allMonths.slice(-6)
  }

  if (
    filterType ===
    '1year'
  ) {

    months =
      allMonths.slice(-12)
  }

  if (
    filterType ===
      'custom' &&
    fromMonth &&
    toMonth
  ) {

    months =
      allMonths.filter(
        (month: any) =>
          month >=
            fromMonth &&
          month <=
            toMonth
      )
  }

  const handleSort = (
    key: string,
    direction: string
  ) => {

    const sorted =
      [...data]

    sorted.sort(
      (
        a: any,
        b: any
      ) => {

        const valueA =
          a[key] || ''

        const valueB =
          b[key] || ''

        return direction ===
          'asc'
          ? valueA
              .toString()
              .localeCompare(
                valueB.toString()
              )
          : valueB
              .toString()
              .localeCompare(
                valueA.toString()
              )
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
      ...months.map(
        (month: any) =>
          `${month} (MB)`
      ),
    ]

    const rows =
      data.map(
        (row: any) => {

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
              (
                month: any
              ) =>
                row[
                  month
                ] || 0
            ),
          ]
        }
      )

    const csvContent =
      [
        headers.join(','),
        ...rows.map(
          (e: any) =>
            e.join(',')
        ),
      ].join('\n')

    const blob =
      new Blob(
        [csvContent],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      )

    const link =
      document.createElement(
        'a'
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const timestamp =
      new Date()
        .toISOString()
        .replace(
          /[:.]/g,
          '-'
        )

    link.href = url

    link.download =
      `sim_usage_report_${timestamp}.csv`

    link.click()
  }

  return (

    <div className="min-h-screen bg-gray-100 p-4">

      <div className="bg-white rounded-xl shadow-lg p-4">

        <div className="flex justify-between items-center mb-4">

          <h1 className="text-2xl font-bold">
            Datix Master
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
                text-sm
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  w-7
                  h-7
                  rounded-full
                  bg-white
                  text-black
                  flex
                  items-center
                  justify-center
                  font-bold
                "
              >
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

              <div
                className="
                  absolute
                  right-0
                  mt-2
                  w-72
                  bg-white
                  border
                  rounded-lg
                  shadow-lg
                  z-50
                "
              >

                <div className="p-4 border-b space-y-3">

                  <div>

                    <p className="text-[11px] text-gray-500">
                      Username
                    </p>

                    <p className="font-semibold text-sm break-all">
                      {
                        loggedUser?.username ||
                        '-'
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] text-gray-500">
                      Name
                    </p>

                    <p className="font-semibold text-sm break-all">
                      {
                        loggedUser?.name ||
                        '-'
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] text-gray-500">
                      Email
                    </p>

                    <p className="font-semibold text-sm break-all">
                      {
                        loggedUser?.email ||
                        '-'
                      }
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => {

                    localStorage.removeItem(
                      'user'
                    )

                    window.location.reload()
                  }}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    hover:bg-gray-100
                    text-red-600
                    text-sm
                  "
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        <div className="mb-4">

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
              max-w-lg
              border
              border-gray-300
              rounded-lg
              p-2
              text-sm
              resize-none
            "
          />

        </div>

        <div className="flex flex-wrap gap-3 mb-4">

          <button
            onClick={searchBulk}
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-lg
              text-sm
            "
          >
            Search
          </button>

          <button
            onClick={downloadCSV}
            className="
              bg-green-600
              text-white
              px-4
              py-2
              rounded-lg
              text-sm
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
              text-sm
            "
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
            className="
              border
              rounded-lg
              px-3
              py-2
              text-sm
            "
          >

            <option value="all">
              All Months
            </option>

            <option value="6months">
              Last 6 Months
            </option>

            <option value="1year">
              Last 1 Year
            </option>

            <option value="custom">
              Month Range
            </option>

          </select>

        </div>

      </div>

    </div>
  )
}