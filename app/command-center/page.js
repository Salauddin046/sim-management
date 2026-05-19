'use client'

import {
  useState,
} from 'react'

export default function CommandCenterPage() {

  const [search, setSearch] =
    useState('')

  const [fromDate, setFromDate] =
    useState('')

  const [toDate, setToDate] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [rows, setRows] =
    useState([])

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

                fromDate,

                toDate,
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

      setFromDate('')

      setToDate('')

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

  const totalRecords =
    rows.length

  const activeSims =
    rows.filter(
      (item) =>
        !item.termination_date
    ).length

  const terminatedSims =
    rows.filter(
      (item) =>
        item.termination_date
    ).length

  const safeCustodyIn =
    rows.filter(
      (item) =>

        item.safe_custody_move_in

        &&

        item.safe_custody_move_in !== ''

    ).length

  const safeCustodyOut =
    rows.filter(
      (item) =>

        item.safe_custody_move_out

        &&

        item.safe_custody_move_out !== ''

    ).length

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
            md:grid-cols-4
            gap-4
            mb-6
          ">

            <input
              type="text"
              placeholder="
Search SIM / Phone / Client / Device
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

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
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

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
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
            grid
            grid-cols-2
            md:grid-cols-5
            gap-4
            mb-8
          ">

            <div className="
              bg-blue-600
              text-white
              rounded-3xl
              p-6
              shadow-lg
            ">

              <p className="
                text-sm
                opacity-80
                mb-2
              ">
                Total Records
              </p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {totalRecords}
              </h2>

            </div>

            <div className="
              bg-green-600
              text-white
              rounded-3xl
              p-6
              shadow-lg
            ">

              <p className="
                text-sm
                opacity-80
                mb-2
              ">
                Active SIMs
              </p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {activeSims}
              </h2>

            </div>

            <div className="
              bg-red-600
              text-white
              rounded-3xl
              p-6
              shadow-lg
            ">

              <p className="
                text-sm
                opacity-80
                mb-2
              ">
                Terminated
              </p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {terminatedSims}
              </h2>

            </div>

            <div className="
              bg-yellow-500
              text-white
              rounded-3xl
              p-6
              shadow-lg
            ">

              <p className="
                text-sm
                opacity-80
                mb-2
              ">
                Safe Custody IN
              </p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {safeCustodyIn}
              </h2>

            </div>

            <div className="
              bg-purple-600
              text-white
              rounded-3xl
              p-6
              shadow-lg
            ">

              <p className="
                text-sm
                opacity-80
                mb-2
              ">
                Safe Custody OUT
              </p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {safeCustodyOut}
              </h2>

            </div>

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