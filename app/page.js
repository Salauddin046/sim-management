'use client'

import {useEffect,useState,} from 'react'

import {useRouter,} from 'next/navigation'

export default function HomePage() {

const router =useRouter()

const [user, setUser] =useState(null)

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

const logout =() => {

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
    'SIM Overview',

  route:
    '/control-tower',
},

{
  title:
    'SIM Explorer',

  route:
    '/sim-explorer',
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
    'SIM Overview',

  route:
    '/control-tower',
},

{
  title:
    'SIM Explorer',

  route:
    '/sim-explorer',
},

]

return (

<div className="
  flex
  min-h-screen
  bg-[#f5f5f7]
">

  <div className="
    w-[260px]
    bg-white
    border-r
    flex
    flex-col
    justify-between
  ">

    <div>

      <div className="
        p-6
        border-b
        flex
        items-center
        gap-4
      ">

        <div className="
          w-12
          h-12
          rounded-2xl
          bg-black
          text-white
          flex
          items-center
          justify-center
          text-2xl
          font-bold
        ">
          I
        </div>

        <div>

         <h1 className="text-3xl font-bold tracking-tight text-gray-900">
           IntelliSIM
        </h1>

         <h3 className="text-sm font-medium text-gray-500 mt-1 tracking-wide">
         SIM Intelligence & Control Platform
           </h3>

        </div>

      </div>

      <div className="
        p-4
        space-y-2
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
                  px-4
                  py-3
                  rounded-2xl
                  font-medium
                  transition-all

                  ${
                    menu.title ===
                    'Home'

                      ? 'bg-black text-white'

                      : 'hover:bg-gray-100'
                  }
                `}
              >

                {menu.title}

              </button>
            )
          )
        }

      </div>

    </div>

    <div className="
      p-4
    ">

      <button
        onClick={
          logout
        }
        className="
          w-full
          px-4
          py-3
          rounded-2xl
          bg-red-50
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
      h-[90px]
      border-b
      flex
      items-center
      justify-between
      px-8
    ">

      <div className="
        flex
        items-center
        gap-5
      ">

        <div className="
          text-3xl
          font-bold
        ">
          ☰
        </div>

        <h1 className="
          text-3xl
          font-bold
        ">
          Home
        </h1>

      </div>

      <div className="
        flex
        items-center
        gap-3
      ">

        <div className="
          w-11
          h-11
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
            text-base
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
      p-8
    ">

      <h1 className="
        text-4xl
        font-bold
        mb-3
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
        text-lg
        mb-10
      ">

        Data-driven visibility into SIM intelligence infrastructure

      </p>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
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
                  p-6
                  hover:shadow-xl
                  transition-all
                "
              >

                <h2 className="
                  text-2xl
                  font-bold
                  mb-10
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
                    py-3
                    rounded-2xl
                    font-semibold
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

)}