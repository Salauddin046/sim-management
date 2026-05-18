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
              'Session expired'
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

  const logout =
    () => {

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

  const menus = [

    {
      title:
        'Home',

      route:
        '/',
    },

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

    {
      title:
        'SIM Explorer',

      route:
        '/sim-search',
    },
  ]

  const cards = [

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

  return (

    <div className="
      flex
      min-h-screen
      bg-[#f5f5f7]
    ">

      <div className="
        w-[280px]
        bg-white
        border-r
        flex
        flex-col
        justify-between
      ">

        <div>

          <div className="
            p-8
            border-b
            flex
            items-center
            gap-4
          ">

            <div className="
              w-14
              h-14
              rounded-2xl
              bg-black
              text-white
              flex
              items-center
              justify-center
              text-3xl
              font-bold
            ">
              U
            </div>

            <div>

              <h1 className="
                text-2xl
                font-bold
                leading-tight
              ">
                Universal
                <br />
                Teleservices
              </h1>

            </div>

          </div>

          <div className="
            p-5
            space-y-3
          ">

            {
              menus.map(
                (menu) => (

                  <button
                    key={
                      menu.title
                    }
                    onClick={() =>
                      router.push(
                        menu.route
                      )
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      gap-4
                      px-5
                      py-4
                      rounded-2xl
                      font-semibold
                      transition-all

                      ${
                        menu.title ===
                        'Home'

                          ? 'bg-black text-white'

                          : 'hover:bg-gray-100'
                      }
                    `}
                  >

                    <div className="
                      w-9
                      h-9
                      rounded-xl
                      bg-black
                      text-white
                      flex
                      items-center
                      justify-center
                      text-sm
                      font-bold
                    ">

                      {
                        menu.title[0]
                      }

                    </div>

                    {menu.title}

                  </button>
                )
              )
            }

          </div>

        </div>

        <div className="
          p-5
        ">

          <button
            onClick={
              logout
            }
            className="
              w-full
              flex
              items-center
              gap-4
              px-5
              py-4
              rounded-2xl
              hover:bg-red-100
              text-red-600
              font-semibold
            "
          >

            Logout

          </button>

        </div>

      </div>

      <div className="
        flex-1
      ">

        <div className="
          bg-white
          h-[100px]
          border-b
          flex
          items-center
          justify-between
          px-10
        ">

          <div className="
            flex
            items-center
            gap-6
          ">

            <div className="
              text-4xl
              font-bold
            ">
              ☰
            </div>

            <h1 className="
              text-4xl
              font-bold
            ">
              Home
            </h1>

          </div>

          <div className="
            flex
            items-center
            gap-4
          ">

            <div className="
              w-12
              h-12
              rounded-full
              bg-black
              text-white
              flex
              items-center
              justify-center
              text-lg
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
                text-lg
                font-bold
              ">

                {
                  user?.name ||
                  'User'
                }

              </h2>

              <p className="
                text-sm
                text-gray-500
              ">

                {
                  user?.email
                }

              </p>

            </div>

          </div>

        </div>

        <div className="
          p-10
        ">

          <h1 className="
            text-5xl
            font-bold
            mb-4
          ">

            Welcome back,
            {' '}
            {
              user?.name ||
              'User'
            }!

          </h1>

          <p className="
            text-gray-600
            text-xl
            mb-12
          ">

            Here's what's happening with your system today.

          </p>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-8
          ">

            {
              cards.map(
                (card) => (

                  <div
                    key={
                      card.title
                    }
                    className="
                      bg-white
                      rounded-3xl
                      shadow-sm
                      border
                      p-8
                      hover:shadow-xl
                      transition-all
                    "
                  >

                    <div className="
                      w-16
                      h-16
                      rounded-2xl
                      bg-black
                      text-white
                      flex
                      items-center
                      justify-center
                      text-3xl
                      font-bold
                      mb-8
                    ">

                      {
                        card.title[0]
                      }

                    </div>

                    <h2 className="
                      text-3xl
                      font-bold
                      mb-16
                    ">

                      {
                        card.title
                      }

                    </h2>

                    <button
                      onClick={() =>
                        router.push(
                          card.route
                        )
                      }
                      className="
                        w-full
                        bg-black
                        text-white
                        py-4
                        rounded-2xl
                        font-semibold
                        text-lg
                      "
                    >
                      Open Dashboard
                    </button>

                  </div>
                )
              )
            }

          </div>

        </div>

      </div>

    </div>
  )
}