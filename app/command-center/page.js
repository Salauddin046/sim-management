'use client'

import {
  useEffect,
  useState,
} from 'react'

export default function CommandCenterPage() {

  const [search, setSearch] =
    useState('')

  const [month, setMonth] =
    useState('')

  const [months, setMonths] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [rows, setRows] =
    useState([])

  useEffect(() => {

    loadMonths()

  }, [])

  const loadMonths =
    async () => {

      try {

        const response =
          await fetch(
            '/api/command-center/months'
          )

        const result =
          await response.json()

        if (
          result.success
        ) {

          setMonths(

            result.months.map(
              (item) =>
                item.month
            )
          )
        }

      } catch (error) {

        console.log(error)
      }
    }

  const searchData =
    async () => {

      try {

        setLoading(true)

        const response =
          await fetch(
            '/api/command-center',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                search,

                month,
              }),
            }
          )

        const result =
          await response.json()

        if (
          !result.success
        ) {

          alert(
            result.message
          )

          return
        }

        setRows(
          result.data
        )

      } catch (error) {

        console.log(error)

        alert(
          'Search failed'
        )

      } finally {

        setLoading(false)
      }
    }

  const clearData =
    () => {

      setSearch('')

      setMonth('')

      setRows([])
    }

  const downloadCSV =
    () => {

      if (
        rows.length === 0
      ) {

        alert(
          'No data found'
        )

        return
      }

      const headers = [

        'SIM Number',

        'Phone Number',

        'Device ID',

        'Client Name',

        'Activation Date',

        'Termination Date',

        'Safe Custody Move In',

        'Safe Custody Move Out',
      ]

      const csvRows = [

        headers.join(','),
      ]

      rows.forEach((row) => {

        csvRows.push(

          [

            row.sim_number,

            row.phone_number,

            row.device_id,

            `"${row.client_name}"`,

            row.activation_date,

            row.termination_date,

            row.safe_custody_move_in,

            row.safe_custody_move_out,
          ].join(',')
        )
      })

      const blob =
        new Blob(

          [csvRows.join('\n')],

          {
            type:
              'text/csv',
          }
        )

      const url =
        window.URL
          .createObjectURL(
            blob
          )

      const a =
        document
          .createElement('a')

      a.href = url

      a.download =
        `command_center_${Date.now()}.csv`

      a.click()
    }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-6
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
        ">

          <div className="
            flex
            items-center
            justify-between
            mb-6
            flex-wrap
            gap-4
          ">

            <div>

              <h1 className="
                text-4xl
                font-bold
                mb-2
              ">
                Command Center
              </h1>

              <p className="
                text-gray-500
              ">
                PostgreSQL SIM Database Search
              </p>

            </div>

            <button
              onClick={() =>
                window.history.back()
              }
              className="
                bg-black
                text-white
                px-6
                py-3
                rounded-2xl
                font-semibold
              "
            >
              Back
            </button>

          </div>

          <div className="
            grid
            md:grid-cols-3
            gap-4
            mb-6
          ">

            <input
              type="text"
              placeholder="
Search SIM / Phone / Client / Device ID
              "
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
                outline-none
              "
            />

            <select
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
                outline-none
              "
            >

              <option value="">
                Select Month
              </option>

              {
                months.map(
                  (
                    item,
                    index
                  ) => (

                    <option
                      key={index}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )
              }

            </select>

            <button
              onClick={
                searchData
              }
              disabled={
                loading
              }
              className="
                bg-black
                text-white
                rounded-2xl
                font-semibold
              "
            >

              {
                loading
                  ? 'Searching...'
                  : 'Search'
              }

            </button>

          </div>

          <div className="
            flex
            gap-4
            mb-6
            flex-wrap
          ">

            <button
              onClick={
                clearData
              }
              className="
                bg-red-600
                text-white
                px-8
                py-4
                rounded-2xl
                font-semibold
              "
            >
              Clear
            </button>

            <button
              onClick={
                downloadCSV
              }
              className="
                bg-green-600
                text-white
                px-8
                py-4
                rounded-2xl
                font-semibold
              "
            >
              Download CSV
            </button>

          </div>

          <div className="
            overflow-auto
          ">

            <table className="
              w-full
              border-collapse
              text-sm
            ">

              <thead>

                <tr className="
                  bg-black
                  text-white
                ">

                  <th className="border p-3">
                    SIM Number
                  </th>

                  <th className="border p-3">
                    Phone Number
                  </th>

                  <th className="border p-3">
                    Device ID
                  </th>

                  <th className="border p-3">
                    Client Name
                  </th>

                  <th className="border p-3">
                    Activation Date
                  </th>

                  <th className="border p-3">
                    Termination Date
                  </th>

                  <th className="border p-3">
                    Safe Custody Move In
                  </th>

                  <th className="border p-3">
                    Safe Custody Move Out
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  rows.length === 0
                  ? (

                    <tr>

                      <td
                        colSpan="8"
                        className="
                          border
                          p-10
                          text-center
                          text-gray-500
                        "
                      >
                        No data found
                      </td>

                    </tr>
                  )
                  : (

                    rows.map(
                      (
                        row,
                        index
                      ) => (

                        <tr
                          key={index}
                          className="
                            hover:bg-gray-100
                          "
                        >

                          <td className="border p-3">
                            {row.sim_number}
                          </td>

                          <td className="border p-3">
                            {row.phone_number}
                          </td>

                          <td className="border p-3">
                            {row.device_id}
                          </td>

                          <td className="border p-3">
                            {row.client_name}
                          </td>

                          <td className="border p-3">
                            {row.activation_date}
                          </td>

                          <td className="border p-3">
                            {row.termination_date}
                          </td>

                          <td className="border p-3">
                            {row.safe_custody_move_in}
                          </td>

                          <td className="border p-3">
                            {row.safe_custody_move_out}
                          </td>

                        </tr>
                      )
                    )
                  )
                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  )
}