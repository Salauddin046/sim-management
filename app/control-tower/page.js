'use client'

import { useEffect, useState } from 'react'

export default function ControlTowerPage() {

  const [rows, setRows] =
    useState([])

  const [
    filteredRows,
    setFilteredRows,
  ] = useState([])

  const [loading, setLoading] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [status, setStatus] =
    useState('')

  const [totalCount, setTotalCount] =
    useState(0)

  const [initialCount, setInitialCount] =
    useState(0)

  const [activeCount, setActiveCount] =
    useState(0)

  const [
    tempDisconnectCount,
    setTempDisconnectCount,
  ] = useState(0)

  const [
    safeCustodyCount,
    setSafeCustodyCount,
  ] = useState(0)

  const [
    activeTestModeCount,
    setActiveTestModeCount,
  ] = useState(0)

  useEffect(() => {

    fetchData()

  }, [])

  const fetchData = async () => {

    try {

      setLoading(true)

      const response =
        await fetch(
          '/api/control-tower'
        )

      const result =
        await response.json()

      console.log(result)

      const apiData =
        result.data || []

      setRows(apiData)

      setFilteredRows(apiData)

      setTotalCount(
        result.totalCount || 0
      )

      setInitialCount(
        result.initialCount || 0
      )

      setActiveCount(
        result.activeCount || 0
      )

      setTempDisconnectCount(
        result.tempDisconnectCount || 0
      )

      setSafeCustodyCount(
        result.safeCustodyCount || 0
      )

      setActiveTestModeCount(
        result.activeTestModeCount || 0
      )

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
        .map(
          (item) =>
            item.status
        )
        .filter(Boolean)
    ),
  ]

  const downloadCSV =
    async () => {

      try {

        const response =
          await fetch(

            '/api/control-tower?download=true'
          )

        const result =
          await response.json()

        const data =
          result.data || []

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

        data.forEach((row) => {

          csvRows.push([

            row.sim_no || '',

            row.mobile_no || '',

            row.status || '',

            row.activation_date || '',

            row.safeCustody_date || '',

          ].join(','))
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
            .createObjectURL(blob)

        const a =
          document
            .createElement('a')

        a.href = url

        a.download =
          'all_sim_data.csv'

        a.click()

      } catch (error) {

        console.log(error)

        alert(
          'CSV Download Failed'
        )
      }
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
              Airtel SIM Dashboard
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
              onClick={
                handleSearch
              }
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
            onClick={
              handleSearch
            }
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
            onClick={
              downloadCSV
            }
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
          md:grid-cols-6
          gap-4
          mb-8
        ">

          <div className="
            bg-indigo-600
            text-white
            rounded-3xl
            p-6
          ">

            <p>Total Records</p>

            <h2 className="
              text-3xl
              font-bold
            ">
              {totalCount}
            </h2>

          </div>

          <div className="
            bg-cyan-600
            text-white
            rounded-3xl
            p-6
          ">

            <p>Available</p>

            <h2 className="
              text-3xl
              font-bold
            ">
              {initialCount}
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
            bg-pink-600
            text-white
            rounded-3xl
            p-6
          ">

            <p>
              Test Mode
            </p>

            <h2 className="
              text-3xl
              font-bold
            ">
              {
                activeTestModeCount
              }
            </h2>

          </div>

          <div className="
            bg-yellow-500
            text-white
            rounded-3xl
            p-6
          ">

            <p>
              Temp Disconnect
            </p>

            <h2 className="
              text-3xl
              font-bold
            ">
              {
                tempDisconnectCount
              }
            </h2>

          </div>

          <div className="
            bg-red-600
            text-white
            rounded-3xl
            p-6
          ">

            <p>
              Safe Custody
            </p>

            <h2 className="
              text-3xl
              font-bold
            ">
              {
                safeCustodyCount
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

                          <span
                            className={`
                              text-white
                              px-3
                              py-1
                              rounded-full
                              text-sm

                              ${
                                row.status
                                  ?.toLowerCase()
                                  === 'active'

                                ? 'bg-green-600'

                                : row.status
                                    ?.toLowerCase()
                                    .includes('temp')

                                ? 'bg-yellow-500'

                                : row.status
                                    ?.toLowerCase()
                                    .includes('safe')

                                ? 'bg-red-600'

                                : row.status
                                    ?.toLowerCase()
                                    .includes('test')

                                ? 'bg-pink-600'

                                : 'bg-gray-500'
                              }
                            `}
                          >

                            {row.status}

                          </span>

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