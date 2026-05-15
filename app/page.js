'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

type DashboardType = {

  title: string

  description: string

  route: string
}

type UserType = {

  name: string

  email: string
}

export default function HomePage() {

  const router =
    useRouter()

  const [loading, setLoading] =
    useState<boolean>(true)

  const [user, setUser] =
    useState<UserType | null>(
      null
    )

  useEffect(() => {

    const loggedIn =
      localStorage.getItem(
        'loggedIn'
      )

    const savedUser =
      localStorage.getItem(
        'user'
      )

    if (
      !loggedIn ||
      !savedUser
    ) {

      router.push(
        '/login'
      )

      return
    }

    setUser(
      JSON.parse(
        savedUser
      )
    )

    setLoading(false)

  }, [router])

  const logout = () => {

    localStorage.removeItem(
      'loggedIn'
    )

    router.push(
      '/login'
    )
  }

  const dashboards:
    DashboardType[] = [

    {
      title:
        'Usage Intelligence',

      description:
        'SIM usage analytics, monthly data usage, filters and telecom insights.',

      route:
        '/datix',
    },

    {
      title:
        'Command Center',

      description:
        'Operations monitoring, alerts and operational management dashboard.',

      route:
        '/command-center',
    },

    {
      title:
        'Control Tower',

      description:
        'Centralized monitoring and enterprise level control dashboard.',

      route:
        '/control-tower',
    },
  ]

  if (loading) {

    return (

      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        text-2xl
        font-bold
      ">

        Loading...

      </div>
    )
  }

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-gray-100
      to-gray-200
      p-6
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        <div className="
          flex
          justify-between
          items-center
          mb-10
        ">

          <div>

            <h1 className="
              text-4xl
              font-bold
              text-gray-800
              mb-3
            ">
              Dashboard Home
            </h1>

            <p className="
              text-gray-600
              text-base
            ">
              Select a dashboard to continue
            </p>

          </div>

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              bg-white
              px-4
              py-2
              rounded-xl
              shadow
              text-sm
              font-semibold
            ">

              {user?.name}

            </div>

            <button
              onClick={
                logout
              }
              className="
                bg-red-600
                text-white
                px-4
                py-2
                rounded-xl
                font-semibold
              "
            >
              Logout
            </button>

          </div>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">

          {dashboards.map(
            (
              dashboard
            ) => (

              <div
                key={
                  dashboard.title
                }
                className="
                  bg-white
                  rounded-3xl
                  shadow-lg
                  border
                  border-gray-200
                  p-7
                  hover:shadow-2xl
                  hover:-translate-y-1
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

                    <div className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-black
                      text-white
                      flex
                      items-center
                      justify-center
                      text-2xl
                      font-bold
                      mb-5
                    ">

                      {
                        dashboard
                          .title[0]
                      }

                    </div>

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
                      mt-8
                      w-full
                      bg-black
                      text-white
                      py-3
                      rounded-2xl
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