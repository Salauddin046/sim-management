'use client'

import { useEffect, useState } from 'react'

export default function ControlTowerPage() {

  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])

  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {

    fetchData()

  }, [])

  const fetchData = async () => {

    try {

      setLoading(true)

      const response =
        await fetch('/api/control-tower')

      const result =
        await response.json()

      console.log(result)

      let apiData = []

      if (
        Array.isArray(result.data)
      ) {

        apiData = result.data
      }

      setRows(apiData)
      setFilteredRows(apiData)

    } catch (error) {

      console.log(error)

      alert('No data found')

    } finally {

      setLoading(false)
    }
  }

  const handleSearch = () => {

    let filtered = [...rows]

    if (search) {

      filtered =
        filtered.filter((item) =>

          item.sim_no
            ?.toString()
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )

          ||

          item.mobile_no
            ?.toString()
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
    }

    if (status) {

      filtered =
        filtered.filter((item) =>

          item.status
            ?.toLowerCase()
            ===
          status.toLowerCase()
        )
    }

    setFilteredRows(filtered)
  }

  const uniqueStatus = [

    ...new Set(

      rows
        .map((item) =>
          item.status
        )
        .filter(Boolean)
    ),
  ]

  const downloadCSV = () => {

    if (
      filteredRows.length === 0
    ) {

      alert('No data found')
      return
    }

    const headers = [

      'SIM No',
      'Mobile No',
      'Status',
      'Activation Date',
      'Safe Custody Date',
    ]

    const csvRows = [
      headers.join(',')
    ]

    filteredRows.forEach((row) => {

      csvRows.push([

        row.sim_no || '',
        row.mobile_no || '',
        row.status || '',
        row.activation_date || '',
        row.safeCustody_date || '',

      ].join(','))
    })

    const blob = new Blob(

      [csvRows.join('\n')],

      {
        type: 'text/csv',
      }
    )

    const url =
      window.URL.createObjectURL(blob)

    const a =
      document.createElement('a')

    a.href = url

    a.download =
      'control_tower.csv'

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
        bg-white
        rounded-3xl
        shadow-xl
        p-6
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-6
          flex-wrap
          gap-4
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
            ">
              Control Tower
            </h1>

            <p className="
              text-gray-500
            ">
              SIM Overview
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

          <div className="
            flex
            gap-2
          ">

            <input
              type="text"
              placeholder="
Search SIM / Mobile
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
                w-full
              "
            />

            <button
              onClick={handleSearch}
              className="
                bg-blue-600
                text-white
                px-6
                rounded-2xl
                font-semibold
              "
            >
              Search
            </button>

          </div>

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

          <button
            onClick={handleSearch}
            className="
              bg-green-600
              text-white
              rounded-2xl
              font-semibold
            "
          >
            Apply Filter
          </button>

          <button
            onClick={downloadCSV}
            className="
              bg-purple-600
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
          md:grid-cols-3
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

              {
                filteredRows.filter(
                  (item) =>

                    item.status
                      ?.toLowerCase()
                      === 'active'
                ).length
              }

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

              {
                filteredRows.filter(
                  (item) =>

                    item.status
                      ?.toLowerCase()
                      === 'inactive'
                ).length
              }

            </h2>

          </div>

        </div>

        <div className="
          overflow-auto
          border
          rounded-2xl
        ">

          <table className="
            w-full
            border-collapse
          ">

            <thead>

              <tr className="
                bg-black
                text-white
              ">

                <th className="
                  border
                  p-4
                ">
                  SIM No
                </th>

                <th className="
                  border
                  p-4
                ">
                  Mobile No
                </th>

                <th className="
                  border
                  p-4
                ">
                  Status
                </th>

                <th className="
                  border
                  p-4
                ">
                  Activation Date
                </th>

                <th className="
                  border
                  p-4
                ">
                  Safe Custody Date
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
                        text-center
                        p-10
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
                        text-center
                        p-10
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

                        <td className="
                          border
                          p-3
                        ">
                          {row.sim_no}
                        </td>

                        <td className="
                          border
                          p-3
                        ">
                          {row.mobile_no}
                        </td>

                        <td className="
                          border
                          p-3
                        ">
                          {row.status}
                        </td>

                        <td className="
                          border
                          p-3
                        ">
                          {
                            row.activation_date
                            || '-'
                          }
                        </td>

                        <td className="
                          border
                          p-3
                        ">
                          {
                            row.safeCustody_date
                            || '-'
                          }
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
  )
}