'use client'

import { useState }
from 'react'

export default function CommandCenterPage() {

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [data, setData] =
    useState(null)

  const [error, setError] =
    useState('')

  const searchData =
    async () => {

      if (!search.trim()) {

        alert(
          'Enter SIM Number'
        )

        return
      }

      try {

        setLoading(true)

        setError('')

        setData(null)

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
              }),
            }
          )

        const result =
          await response.json()

        if (
          !result.success
        ) {

          setError(
            result.message
          )

          return
        }

        setData(
          result.data
        )

      } catch (error) {

        console.log(error)

        setError(
          'Search failed'
        )

      } finally {

        setLoading(false)
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
              Search Airtel SIM Details
            </p>

          </div>

          <div className="
            flex
            flex-col
            md:flex-row
            gap-4
            mb-6
          ">

            <input
              type="text"
              placeholder="Enter SIM Number"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                flex-1
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
                px-8
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

          {
            data && (

              <div className="
                overflow-auto
              ">

                <table className="
                  w-full
                  border-collapse
                ">

                  <tbody>

                    {
                      Object.entries(
                        data
                      ).map(
                        (
                          [key, value]
                        ) => (

                          <tr
                            key={key}
                            className="
                              hover:bg-gray-50
                            "
                          >

                            <td className="
                              border
                              p-4
                              font-semibold
                              bg-gray-100
                              w-[300px]
                            ">

                              {key}

                            </td>

                            <td className="
                              border
                              p-4
                            ">

                              {
                                typeof value ===
                                'object'

                                ? JSON.stringify(
                                    value
                                  )

                                : String(
                                    value
                                  )
                              }

                            </td>

                          </tr>
                        )
                      )
                    }

                  </tbody>

                </table>

              </div>
            )
          }

        </div>

      </div>

    </div>
  )
}