'use client'

import { useEffect, useState } from 'react'

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
          a[key] || 0

        const valueB =
          b[key] || 0

        if (
          typeof valueA ===
          'string'
        ) {

          return direction ===
            'asc'
            ? valueA.localeCompare(
                valueB
              )
            : valueB.localeCompare(
                valueA
              )
        }

        return direction ===
          'asc'
          ? Number(
              valueA
            ) -
              Number(
                valueB
              )
          : Number(
              valueB
            ) -
              Number(
                valueA
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
      ...months,
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

          <button
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Profile
          </button>

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

          <p className="text-xs text-gray-500 mt-1">
            Maximum 1000 SIM numbers
          </p>

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

          {filterType ===
            'custom' && (
            <>
              <select
                value={
                  fromMonth
                }
                onChange={(
                  e
                ) =>
                  setFromMonth(
                    e.target
                      .value
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

                <option value="">
                  From Month
                </option>

                {allMonths.map(
                  (
                    month: any
                  ) => (
                    <option
                      key={
                        month
                      }
                      value={
                        month
                      }
                    >
                      {month}
                    </option>
                  )
                )}

              </select>

              <select
                value={
                  toMonth
                }
                onChange={(
                  e
                ) =>
                  setToMonth(
                    e.target
                      .value
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

                <option value="">
                  To Month
                </option>

                {allMonths.map(
                  (
                    month: any
                  ) => (
                    <option
                      key={
                        month
                      }
                      value={
                        month
                      }
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
          <p className="mb-3 text-sm">
            Loading...
          </p>
        )}

        <div className="
          overflow-auto
          rounded-lg
          border
          border-gray-300
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

                {[
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

                  {
                    label:
                      'Status',
                    key:
                      'sim_status',
                  },

                  {
                    label:
                      'Plan',
                    key:
                      'plan',
                  },
                ].map(
                  (
                    header: any
                  ) => (

                    <th
                      key={
                        header.key
                      }
                      className="
                        border
                        p-1
                        min-w-[120px]
                      "
                    >

                      <div className="
                        flex
                        flex-col
                        gap-1
                      ">

                        <span className="
                          font-semibold
                          text-[11px]
                        ">
                          {
                            header.label
                          }
                        </span>

                        <select
                          className="
                            border
                            rounded
                            px-1
                            py-1
                            text-[10px]
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
                  (
                    month: any
                  ) => (

                    <th
                      key={
                        month
                      }
                      className="
                        border
                        p-1
                        min-w-[140px]
                      "
                    >

                      <div className="
                        flex
                        flex-col
                        gap-1
                      ">

                        <span className="
                          text-[11px]
                          font-semibold
                        ">
                          {month}
                        </span>

                        <select
                          className="
                            border
                            rounded
                            px-1
                            py-1
                            text-[10px]
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
                            Highlight
                          </option>

                        </select>

                        <input
                          type="number"
                          placeholder="Value"
                          className="
                            border
                            rounded
                            px-1
                            py-1
                            text-[10px]
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
                      className="
                        hover:bg-gray-50
                      "
                    >

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {row.sim_no}
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {row.msisdn}
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {
                          row.sim_status
                        }
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {row.plan}
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {minValue}
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {maxValue}
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                        font-semibold
                      ">
                        {totalUsage}
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {
                          averageValue
                        }
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
                        {
                          consumedMonths
                        }
                      </td>

                      <td className="
                        border
                        p-1
                        text-center
                      ">
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
                                p-1
                                text-center
                                text-[11px]
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