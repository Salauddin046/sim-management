'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

export default function DatixPage() {

  const router =
    useRouter()

  const [loading, setLoading] =
    useState(false)

  const [pageLoading, setPageLoading] =
    useState(true)

  const [input, setInput] =
    useState('')

  const [data, setData] =
    useState([])

  const [originalData, setOriginalData] =
    useState([])

  const [filterType, setFilterType] =
    useState('all')

  const [fromMonth, setFromMonth] =
    useState('')

  const [toMonth, setToMonth] =
    useState('')

  useEffect(() => {

    const loggedIn =
      localStorage.getItem(
        'loggedIn'
      )

    if (!loggedIn) {

      router.push(
        '/login'
      )

      return
    }

    setPageLoading(false)

  }, [router])

  const searchBulk =
    async () => {

      const numbers =
        input
          .split('\n')
          .map(
            (v) =>
              v.trim()
          )
          .filter(Boolean)

      if (
        !numbers.length
      ) {

        alert(
          'Enter SIM numbers'
        )

        return
      }

      try {

        setLoading(true)

        const response =
          await fetch(
            '/api/sim',
            {

              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  numbers,
                }),
            }
          )

        const result =
          await response.json()

        const grouped = {}

        for (
          const row of result
        ) {

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
            }
          }

          grouped[key][
            row.usage_month
          ] = Number(
            row.used_data_mb ||
              0
          )
        }

        const finalData =
          Object.values(
            grouped
          )

        setData(
          finalData
        )

        setOriginalData(
          finalData
        )

      } catch (error) {

        console.error(
          error
        )

        alert(
          'Failed to fetch data'
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
            (row) =>

              Object.keys(
                row
              ).filter(
                (key) =>

                  ![
                    'sim_no',
                    'msisdn',
                  ].includes(
                    key
                  )
              )
          )
        )
      ).sort()

    }, [data])

  const visibleMonths =
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
            month
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
    key,
    direction,
    numeric = false
  ) => {

    const sorted =
      [...data]

    sorted.sort(
      (
        a,
        b
      ) => {

        const valueA =
          numeric
            ? Number(
                a[key] || 0
              )
            : (
                a[key] || ''
              )
                .toString()

        const valueB =
          numeric
            ? Number(
                b[key] || 0
              )
            : (
                b[key] || ''
              )
                .toString()

        if (
          numeric
        ) {

          return direction ===
            'asc'
            ? valueA -
                valueB
            : valueB -
                valueA
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

  const filterData = (
    key,
    value
  ) => {

    if (!value) {

      setData(
        originalData
      )

      return
    }

    const filtered =
      originalData.filter(
        (row) =>

          (
            row[key] || ''
          )
            .toString()
            .toLowerCase()
            .includes(
              value.toLowerCase()
            )
      )

    setData(filtered)
  }

  const downloadCSV =
    () => {

      const headers = [

        'SIM',

        'MSISDN',

        'Min Data',

        'Max Data',

        'Total Data',

        'Average Data',

        'Used Months',

        'Zero Usage Months',

        ...visibleMonths.map(
          (month) =>
            `${month} (MB)`
        ),
      ]

      const rows =
        data.map(
          (row) => {

            const values =
              visibleMonths.map(
                (
                  month
                ) =>
                  Number(
                    row[
                      month
                    ] || 0
                  )
              )

            const min =
              Math.min(
                ...values
              )

            const max =
              Math.max(
                ...values
              )

            const total =
              values.reduce(
                (
                  a,
                  b
                ) =>
                  a + b,
                0
              )

            const avg =
              (
                total /
                values.length
              ).toFixed(2)

            const used =
              values.filter(
                (
                  value
                ) =>
                  value > 0
              ).length

            const zero =
              values.filter(
                (
                  value
                ) =>
                  value === 0
              ).length

            return [

              row.sim_no,

              row.msisdn,

              min,

              max,

              total.toFixed(
                2
              ),

              avg,

              used,

              zero,

              ...visibleMonths.map(
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
        'usage-report.csv'

      link.click()
    }

  if (pageLoading) {

    return (

      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        text-2xl
        font-bold
      ">

        Loading...

      </div>
    )
  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-4
    ">

      <div className="
        bg-white
        rounded-2xl
        shadow-lg
        p-4
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-4
        ">

          <h1 className="
            text-3xl
            font-bold
          ">
            Usage Intelligence
          </h1>

          <button
            onClick={() =>
              router.push(
                '/'
              )
            }
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-xl
            "
          >
            Back
          </button>

        </div>

        <textarea
          rows={5}
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="
Enter SIM numbers
One per line
          "
          className="
            w-full
            border
            rounded-xl
            p-4
            mb-4
            resize-none
          "
        />

        <div className="
          flex
          flex-wrap
          gap-3
          mb-4
        ">

          <button
            onClick={
              searchBulk
            }
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-xl
            "
          >

            {
              loading
                ? 'Loading...'
                : 'Search'
            }

          </button>

          <button
            onClick={
              downloadCSV
            }
            className="
              bg-green-600
              text-white
              px-4
              py-2
              rounded-xl
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
              rounded-xl
            "
          >
            Reset
          </button>

          <select
            value={
              filterType
            }
            onChange={(e) =>
              setFilterType(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              px-4
              py-2
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
              Custom Range
            </option>

          </select>

          {
            filterType ===
              'custom' && (

              <>

                <select
                  value={
                    fromMonth
                  }
                  onChange={(e) =>
                    setFromMonth(
                      e.target
                        .value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    px-4
                    py-2
                  "
                >

                  <option value="">
                    From Month
                  </option>

                  {
                    allMonths.map(
                      (
                        month
                      ) => (

                        <option
                          key={
                            month
                          }
                          value={
                            month
                          }
                        >
                          {
                            month
                          }
                        </option>
                      )
                    )
                  }

                </select>

                <select
                  value={
                    toMonth
                  }
                  onChange={(e) =>
                    setToMonth(
                      e.target
                        .value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    px-4
                    py-2
                  "
                >

                  <option value="">
                    To Month
                  </option>

                  {
                    allMonths.map(
                      (
                        month
                      ) => (

                        <option
                          key={
                            month
                          }
                          value={
                            month
                          }
                        >
                          {
                            month
                          }
                        </option>
                      )
                    )
                  }

                </select>

              </>
            )
          }

        </div>

        <div className="
          overflow-auto
          max-h-[700px]
          border
          rounded-xl
        ">

          <table className="
            w-full
            border-collapse
            text-xs
          ">

            <thead className="
              sticky
              top-0
              bg-gray-200
              z-10
            ">

              <tr>

                {
                  [
                    {
                      label:
                        'SIM',

                      key:
                        'sim_no',
                    },

                    {
                      label:
                        'MSISDN',

                      key:
                        'msisdn',
                    },
                  ].map(
                    (
                      item
                    ) => (

                      <th
                        key={
                          item.key
                        }
                        className="
                          border
                          p-2
                          min-w-[150px]
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          gap-2
                        ">

                          <span>
                            {
                              item.label
                            }
                          </span>

                          <select
                            onChange={(e) => {

                              const value =
                                e.target
                                  .value

                              if (
                                value ===
                                'reset'
                              ) {

                                setData(
                                  originalData
                                )

                                return
                              }

                              sortData(
                                item.key,
                                value
                              )
                            }}
                            className="
                              border
                              rounded
                              text-[10px]
                            "
                          >

                            <option value="">
                              Sort
                            </option>

                            <option value="asc">
                              A-Z
                            </option>

                            <option value="desc">
                              Z-A
                            </option>

                            <option value="reset">
                              Reset
                            </option>

                          </select>

                          <input
                            type="text"
                            placeholder="Search"
                            onChange={(e) =>
                              filterData(
                                item.key,
                                e.target
                                  .value
                              )
                            }
                            className="
                              border
                              rounded
                              px-1
                              py-1
                              text-[10px]
                            "
                          />

                        </div>

                      </th>
                    )
                  )
                }

                {
                  visibleMonths.map(
                    (
                      month
                    ) => (

                      <th
                        key={
                          month
                        }
                        className="
                          border
                          p-2
                          min-w-[85px]
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          gap-2
                        ">

                          <span>
                            {
                              month
                            } (MB)
                          </span>

                          <select
                            onChange={(e) => {

                              const value =
                                e.target
                                  .value

                              if (
                                value ===
                                'reset'
                              ) {

                                setData(
                                  originalData
                                )

                                return
                              }

                              sortData(
                                month,
                                value,
                                true
                              )
                            }}
                            className="
                              border
                              rounded
                              text-[10px]
                            "
                          >

                            <option value="">
                              Sort
                            </option>

                            <option value="asc">
                              Low-High
                            </option>

                            <option value="desc">
                              High-Low
                            </option>

                            <option value="reset">
                              Reset
                            </option>

                          </select>

                        </div>

                      </th>
                    )
                  )
                }

              </tr>

            </thead>

            <tbody>

              {
                data.map(
                  (
                    row,
                    index
                  ) => {

                    const values =
                      visibleMonths.map(
                        (
                          month
                        ) =>
                          Number(
                            row[
                              month
                            ] || 0
                          )
                      )

                    const max =
                      Math.max(
                        ...values
                      )

                    return (

                      <tr
                        key={
                          index
                        }
                        className="
                          hover:bg-gray-50
                        "
                      >

                        <td className="
                          border
                          p-2
                          text-center
                        ">
                          {
                            row.sim_no
                          }
                        </td>

                        <td className="
                          border
                          p-2
                          text-center
                        ">
                          {
                            row.msisdn
                          }
                        </td>

                        {
                          visibleMonths.map(
                            (
                              month
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
                                    p-2
                                    text-center
                                    ${
                                      value ===
                                        max &&
                                      value !== 0
                                        ? 'bg-green-300 font-bold'
                                        : ''
                                    }
                                  `}
                                >

                                  {
                                    value.toFixed(
                                      2
                                    )
                                  }

                                </td>
                              )
                            }
                          )
                        }

                      </tr>
                    )
                  }
                )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}