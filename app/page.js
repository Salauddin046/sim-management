'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {

  const router = useRouter()

  const dashboards = [

    {
      title:
        'Usage Intelligence',

      description:
        'SIM usage analytics, monthly data usage, filters, CSV export and telecom insights.',

      route:
        '/datix',
    },

    {
      title:
        'Command Center',

      description:
        'Operations monitoring, alerts, live tracking and operational management dashboard.',

      route:
        '/command-center',
    },

    {
      title:
        'Control Tower',

      description:
        'Centralized monitoring, KPI visibility and enterprise level control dashboard.',

      route:
        '/control-tower',
    },
  ]

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
          mb-10
        ">

          <h1 className="
            text-4xl
            font-bold
            text-gray-800
            mb-2
          ">
            Dashboard Home
          </h1>

          <p className="
            text-gray-600
            text-sm
          ">
            Select a dashboard to continue
          </p>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">

          {dashboards.map(
            (dashboard) => (

              <div
                key={
                  dashboard.title
                }
                className="
                  bg-white
                  rounded-2xl
                  shadow-lg
                  border
                  border-gray-200
                  p-6
                  hover:shadow-2xl
                  transition-all
                  duration-300
                "
              >

                <div className="
                  flex
                  flex-col
                  h-full
                  justify-between
                ">

                  <div>

                    <h2 className="
                      text-2xl
                      font-bold
                      text-gray-800
                      mb-3
                    ">
                      {
                        dashboard.title
                      }
                    </h2>

                    <p className="
                      text-sm
                      text-gray-600
                      leading-6
                    ">
                      {
                        dashboard.description
                      }
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        dashboard.route
                      )
                    }
                    className="
                      mt-6
                      w-full
                      bg-black
                      text-white
                      py-3
                      rounded-xl
                      text-sm
                      font-semibold
                      hover:bg-gray-800
                      transition-all
                    "
                  >
                    Open Dashboard
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  )
}