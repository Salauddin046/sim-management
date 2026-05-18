'use client'

import { useState }
from 'react'

export default function CommandCenterPage() {

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [rows, setRows] =
    useState([])

  const [error, setError] =
    useState('')

  const searchData =
    async () => {

      if (!search.trim()) {

        alert(
          'Enter SIM Numbers'
        )

        return
      }

      const simNumbers =
        search
          .split('\n')
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean)

      if (
        simNumbers.length > 500
      ) {

        alert(
          'Maximum 500 searches allowed'
        )

        return
      }

      try {

        setLoading(true)

        setRows([])

        setError('')

        const allRows = []

        for (
          const simNo
          of simNumbers
        ) {

          try {

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

                    search:
                      simNo,
                  }),
                }
              )

            const result =
              await response.json()

            console.log(
              'RESULT:',
              result
            )

           const apiData = {

  sims:
    result.sims || [],

  deviceInfo:
    result.deviceInfo || [],
}

            console.log(
              'API DATA:',
              apiData
            )

            if (
              apiData &&
              apiData.sims
            ) {

              apiData.sims
                .forEach((sim) => {

                  const device =
                    apiData
                      .deviceInfo
                      ?.find(

                        (d) =>
                          d.simNo ===
                          sim.simNo
                      )

                  allRows.push({

                    simNumber:
                      sim.simNo ||
                      '-',

                    mobileNumber:
                      sim.mobileNo ||
                      '-',

                    simStatus:
                      sim.status ||
                      '-',

                    plan:
                      sim.planName ||
                      '-',

                    imei:
                      device
                        ?.deviceImei ||
                      '-',

                    activationDate:

                      sim.activationDate

                        ? sim
                            .activationDate
                            .split('T')[0]

                        : '-',

                    safeCustodyDate:

                      sim.safeCustodyDate

                        ? sim
                            .safeCustodyDate
                            .split('T')[0]

                        : '-',
                  })
                })
            }

          } catch (err) {

            console.log(
              'ROW ERROR:',
              err
            )
          }
        }

        console.log(
          'FINAL ROWS:',
          allRows
        )

        setRows(allRows)

      } catch (error) {

        console.log(
          'SEARCH ERROR:',
          error
        )

        setError(
          'Search failed'
        )

      } finally {

        setLoading(false)
      }
    }

  const downloadCSV =
    () => {

      if (
        rows.length === 0
      ) {

        alert(
          'No data available'
        )

        return
      }

      const headers = [

        'SIM Number',

        'Mobile Number',

        'SIM Status',

        'Plan',

        'IMEI No',

        'Activation Date',

        'Safe Custody Date',
      ]

      const csvRows = [

        headers.join(','),
      ]

      rows.forEach((row) => {

        csvRows.push(

          [

            row.simNumber,

            row.mobileNumber,

            row.simStatus,

            `"${row.plan}"`,

            row.imei,

            row.activationDate,

            row.safeCustodyDate,
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
            mb-6
          ">

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
              Bulk SIM Search
            </p>

          </div>

          <textarea
            placeholder="
Enter SIM Numbers
One per line
Maximum 500
            "
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            rows={10}
            className="
              w-full
              border
              rounded-2xl
              p-4
              outline-none
              mb-4
            "
          />

          <div className="
            flex
            gap-4
            mb-6
          ">

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
                px-8
                py-4
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

          {
            error && (

              <div className="
                bg-red-100
                text-red-700
                p-4
                rounded-2xl
                mb-6
              ">

                {error}

              </div>
            )
          }

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
                    Mobile Number
                  </th>

                  <th className="border p-3">
                    SIM Status
                  </th>

                  <th className="border p-3">
                    Plan
                  </th>

                  <th className="border p-3">
                    IMEI No
                  </th>

                  <th className="border p-3">
                    Activation Date
                  </th>

                  <th className="border p-3">
                    Safe Custody Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  rows.length === 0
                  ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="
                          border
                          p-8
                          text-center
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
                            {row.simNumber}
                          </td>

                          <td className="border p-3">
                            {row.mobileNumber}
                          </td>

                          <td className="border p-3">
                            {row.simStatus}
                          </td>

                          <td className="border p-3">
                            {row.plan}
                          </td>

                          <td className="border p-3">
                            {row.imei}
                          </td>

                          <td className="border p-3">
                            {row.activationDate}
                          </td>

                          <td className="border p-3">
                            {row.safeCustodyDate}
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