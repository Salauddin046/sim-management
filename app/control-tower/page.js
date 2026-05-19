'use client'

import {
  useEffect,
  useState,
} from 'react'

export default function ControlTowerPage() {

  const [rows, setRows] =
    useState([])

  const [filteredRows, setFilteredRows] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [status, setStatus] =
    useState('')

  const [plan, setPlan] =
    useState('')

  const fetchData =
    async () => {

      try {

        setLoading(true)

        const response =
          await fetch(
            '/api/control-tower'
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

        setFilteredRows(
          result.data
        )

      } catch (error) {

        console.log(error)

        alert(
          'Failed to load data'
        )

      } finally {

        setLoading(false)
      }
    }

  useEffect(() => {

    fetchData()

  }, [])

  useEffect(() => {

    let filtered =
      [...rows]

    if (search) {

      filtered =
        filtered.filter(
          (item) =>

            item.sim_number
              ?.toString()
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )

            ||

            item.phone_number
              ?.toString()
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )

            ||

            item.client_name
              ?.toString()
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        )
    }

    if (status) {

      filtered =
        filtered.filter(
          (item) =>

            item.status
              ?.toString()
              .toLowerCase()
              ===
            status.toLowerCase()
        )
    }

    if (plan) {

      filtered =
        filtered.filter(
          (item) =>

            item.plan
              ?.toString()
              .toLowerCase()
              ===
            plan.toLowerCase()
        )
    }

    setFilteredRows(
      filtered
    )

  }, [
    search,
    status,
    plan,
    rows,
  ])

  const uniqueStatus =
    [
      ...new Set(

        rows
          .map(
            (item) =>
              item.status
          )
          .filter(Boolean)
      ),
    ]

  const uniquePlans =
    [
      ...new Set(

        rows
          .map(
            (item) =>
              item.plan
          )
          .filter(Boolean)
      ),
    ]

  const activeCount =
    filteredRows.filter(
      (item) =>
        item.status
          ?.toLowerCase()
          === 'active'
    ).length

  const inactiveCount =
    filteredRows.filter(
      (item) =>
        item.status
          ?.toLowerCase()
          === 'inactive'
    ).length

  const downloadCSV =
    () => {

      if (
        filteredRows.length === 0
      ) {

        alert(
          'No data found'
        )

        return
      }

      const headers = [

        'SIM Number',

        'Phone Number',

        'Client Name',

        'Status',

        'Plan',
      ]

      const csvRows = [

        headers.join(','),
      ]

      filteredRows.forEach((row) => {

        csvRows.push(

          [

            row.sim_number,

            row.phone_number,

            `"${row.client_name || ''}"`,

            row.status,

            row.plan,
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
        `control_tower_${Date.now()}.csv`

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
                Control Tower
              </h1>

              <p className="
                text-gray-500
              ">
                Airtel SIM Control Dashboard
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
Search SIM / Phone / Client
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
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            >

              <option value="">
                All Status
              </option>

              {
                uniqueStatus.map(
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

            <select
              value={plan}
              onChange={(e) =>
                setPlan(
                  e.target.value
                )
              }
              className="
                border
                rounded-2xl
                p-4
              "
            >

              <option value="">
                All Plans
              </option>

              {
                uniquePlans.map(
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
                downloadCSV
              }
              className="
                bg-green-600
                text-white
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
            md:grid-cols-4
            gap-4
            mb-8
          ">

            <div className="
              bg-blue-600
              text-white
              rounded-3xl
              p-6
            ">

              <p>Total Records</p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {filteredRows.length}
              </h2>

            </div>

            <div className="
              bg-green-600
              text-white
              rounded-3xl
              p-6
            ">

              <p>Active</p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {activeCount}
              </h2>

            </div>

            <div className="
              bg-red-600
              text-white
              rounded-3xl
              p-6
            ">

              <p>Inactive</p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {inactiveCount}
              </h2>

            </div>

            <div className="
              bg-purple-600
              text-white
              rounded-3xl
              p-6
            ">

              <p>Plans</p>

              <h2 className="
                text-3xl
                font-bold
              ">
                {uniquePlans.length}
              </h2>

            </div>

          </div>

          <div className="
            overflow-auto
            rounded-2xl
            border
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
                    Client Name
                  </th>

                  <th className="border p-3">
                    Status
                  </th>

                  <th className="border p-3">
                    Plan
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  loading
                  ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="
                          border
                          p-10
                          text-center
                        "
                      >
                        Loading...
                      </td>

                    </tr>
                  )
                  : filteredRows.length === 0
                  ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="
                          border
                          p-10
                          text-center
                        "
                      >
                        No data found
                      </td>

                    </tr>
                  )
                  : (

                    filteredRows.map(
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
                            {row.client_name}
                          </td>

                          <td className="border p-3">
                            {row.status}
                          </td>

                          <td className="border p-3">
                            {row.plan}
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