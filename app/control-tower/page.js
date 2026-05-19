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

        let allData = []

        let page = 1

        let hasMore = true

        while (hasMore) {

          const response =
            await fetch(

              'https://airtelsim.intellicar.in/api/v1/airtel/sims/list',

              {

                method: 'POST',

                headers: {

                  accept:
                    'application/json, text/plain, */*',

                  authorization:
                    'Basic YWlydGVsYXBpOkFpcnRlSW50ZWxsaWNhckAjMTIzNDU=',

                  'content-type':
                    'application/json',
                },

                credentials:
                  'include',

                body: JSON.stringify({

                  page_no: page,
                }),
              }
            )

          const result =
            await response.json()

          console.log(result)

          let pageData = []

          if (
            Array.isArray(
              result?.data
            )
          ) {

            pageData =
              result.data
          }

          else if (

            Array.isArray(
              result?.data?.rows
            )

          ) {

            pageData =
              result.data.rows
          }

          else if (

            Array.isArray(
              result?.data?.sims
            )

          ) {

            pageData =
              result.data.sims
          }

          if (
            pageData.length === 0
          ) {

            hasMore = false
          }

          else {

            allData = [

              ...allData,

              ...pageData,
            ]

            page++
          }
        }

        setRows(allData)

        setFilteredRows(allData)

      } catch (error) {

  console.log(
    'FULL ERROR:',
    error
  )

  alert(
    JSON.stringify(error)
  )
}

 finally {

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

    setFilteredRows(filtered)

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

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-6
    ">

      <div className="
        grid
        grid-cols-2
        md:grid-cols-4
        gap-4
        mb-6
      ">

        <div className="
          bg-blue-600
          text-white
          p-6
          rounded-3xl
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
          p-6
          rounded-3xl
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

      </div>

    </div>
  )
}