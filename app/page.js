'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

export default function HomePage() {

  const router =
    useRouter()

  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState(null)

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

  useEffect(() => {

    let logoutTimer

    const resetTimer =
      () => {

        clearTimeout(
          logoutTimer
        )

        logoutTimer =
          setTimeout(() => {

            localStorage.removeItem(
              'loggedIn'
            )

            localStorage.removeItem(
              'user'
            )

            alert(
              'Session expired due to inactivity'
            )

            router.push(
              '/login'
            )

          }, 10 * 60 * 1000)
      }

    const events = [

      'mousemove',

      'keydown',

      'click',

      'scroll',
    ]

    events.forEach(
      (event) => {

        window.addEventListener(
          event,
          resetTimer
        )
      }
    )

    resetTimer()

    return () => {

      clearTimeout(
        logoutTimer
      )

      events.forEach(
        (event) => {

          window.removeEventListener(
            event,
            resetTimer
          )
        }
      )
    }

  }, [router])

  const logout = () => {

    localStorage.removeItem(
      'loggedIn'
    )

    localStorage.removeItem(
      'user'
    )

    router.push(
      '/login'
    )
  }

  const dashboards = [

    {
      title:
        'Usage Intelligence',

      route:
        '/datix',
    },

    {
      title:
        'Command Center',

      route:
        '/command-center',
    },

    {
      title:
        'Control Tower',

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
          flex-wrap
          gap-4
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

          <button
            onClick={
              logout
            }
            className="
              bg-red-600
              text-white
              px-5
              py-3
              rounded-2xl
              font-semibold
            "
          >
            Logout
          </button>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
          mb-8
          flex
          items-center
          gap-5
        ">

          <div className="
            w-20
            h-20
            rounded-full
            bg-black
            text-white
            flex
            items-center
            justify-center
            text-3xl
            font-bold
          ">

            {
              user?.name
                ?.charAt(0)
                ?.toUpperCase()
            }

          </div>

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-gray-800
            ">

              {
                user?.name
              }

            </h2>

            <p className="
              text-gray-500
              mt-1
            ">

              {
                user?.email
              }

            </p>

            <p className="
              text-sm
              text-green-600
              font-semibold
              mt-2
            ">
              Active Session
            </p>

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