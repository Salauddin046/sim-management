'use client'

import {
  useMemo,
  useState,
} from 'react'

export default function Home() {

  const [input, setInput] =
    useState('')

  const [data, setData] =
    useState([])

  const [originalData, setOriginalData] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [filterType, setFilterType] =
    useState('all')

  const [fromMonth, setFromMonth] =
    useState('')

  const [toMonth, setToMonth] =
    useState('')

  const searchBulk = async () => {

    const numbers =
      input
        .split('\n')
        .map(
          (v) => v.trim()
        )
        .filter(Boolean)

    if (
      numbers.length > 1000
    ) {

      alert(
        'Maximum 1000 SIM numbers allowed'
      )

      return
    }

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
          row.used_data_mb || 0
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
        'Search failed'
      )

    } finally {

      setLoading(false)
    }
  }

  const allMonths =
    useMemo(() => {

      const months =
        Array.from(

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
        )

      return months.sort(
        (a, b) =>
          new Date(a) -
          new Date(b)
      )

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

  const downloadCSV = () => {

    const headers = [

      'SIM',

      'MSISDN',

      'MIN',

      'MAX',

      'TOTAL',

      'AVG',

      'USED_MONTHS',

      'ZERO_MONTHS',

      ...visibleMonths,
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

          const usedMonths =
            values.filter(
              (
                value
              ) =>
                value > 0
            ).length

          const zeroMonths =
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

            total,

            avg,

            usedMonths,

            zeroMonths,

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
          (r) =>
            r.join(',')
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

    const link =
      document.createElement(
        'a'
      )

    link.href =
      URL.createObjectURL(
        blob
      )

    link.download =
      `data_usage_report_${Date.now()}.csv`

    link.click()
  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-2
    ">

      <div className="
        bg-white
        rounded-lg
        shadow-md
        p-3
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-3
        ">

          <h1 className="
            text-2xl
            font-bold
          ">
            Usage Intelligence
          </h1>

          <button
            onClick={() =>
              window.location.href = '/'
            }
            className="
              bg-black
              text-white
              px-3
              py-1
              rounded-lg
              text-sm
            "
          >
            Back
          </button>

        </div>

        <textarea
          rows={4}
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="
Enter SIM Numbers
One Per Line
Maximum 1000 Numbers
          "
          className="
            w-full
            border
            rounded-lg
            p-2
            mb-3
            text-sm
          "
        />

        <div className="
          flex
          flex-wrap
          gap-2
          mb-3
        ">

          <button
            onClick={
              searchBulk
            }
            className="
              bg-black
              text-white
              px-3
              py-2
              rounded-lg
              text-sm
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
              px-3
              py-2
              rounded-lg
              text-sm
            "
          >
            Download CSV
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
              rounded-lg
              px-2
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
              Custom
            </option>

          </select>

        </div>

        <div className="
          overflow-auto
          border
          rounded-lg
          max-h-[75vh]
        ">

          <table className="
            w-full
            border-collapse
            text-[11px]
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
                          p-1
                          min-w-[130px]
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          gap-1
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
                                !value
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

                          </select>

                          <input
                            type="text"
                            placeholder="Filter"
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
                          p-1
                          min-w-[70px]
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          gap-1
                        ">

                          <span>
                            {
                              month
                            }
                          </span>

                          <select
                            onChange={(e) => {

                              const value =
                                e.target
                                  .value

                              if (
                                !value
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

                    const usedMonths =
                      values.filter(
                        (
                          value
                        ) =>
                          value > 0
                      ).length

                    const zeroMonths =
                      values.filter(
                        (
                          value
                        ) =>
                          value === 0
                      ).length

                    return (

                      <tr
                        key={
                          index
                        }
                      >

                        <td className="
                          border
                          p-1
                        ">
                          {
                            row.sim_no
                          }
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {
                            row.msisdn
                          }
                        </td>

                        <td className="
                          border
                          p-1
                          bg-yellow-200
                        ">
                          {
                            min.toFixed(2)
                          }
                        </td>

                        <td className="
                          border
                          p-1
                          bg-green-300
                        ">
                          {
                            max.toFixed(2)
                          }
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {
                            total.toFixed(2)
                          }
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {avg}
                        </td>

                        <td className="
                          border
                          p-1
                        ">
                          {
                            usedMonths
                          }
                        </td>

                        <td className="
                          border
                          p-1
                          bg-red-200/60
                        ">
                          {
                            zeroMonths
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
                                    p-1

                                    ${
                                      value === 0
                                        ? 'bg-red-200/60'
                                        : ''
                                    }

                                    ${
                                      value === max &&
                                      value !== 0
                                        ? 'bg-green-300 font-bold'
                                        : ''
                                    }

                                    ${
                                      value === min &&
                                      value !== 0 &&
                                      value !== max
                                        ? 'bg-yellow-200'
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