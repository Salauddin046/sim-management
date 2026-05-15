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

  const [showLogin, setShowLogin] =
    useState(false)

  const [showSignup, setShowSignup] =
    useState(false)

  const [loggedUser, setLoggedUser] =
    useState(null)

  const [loginData, setLoginData] =
    useState({
      email: '',
      password: '',
    })

  const [signupData, setSignupData] =
    useState({
      name: '',
      email: '',
      password: '',
    })

  useEffect(() => {

    const user =
      localStorage.getItem(
        'user'
      )

    if (user) {

      setLoggedUser(
        JSON.parse(user)
      )
    }

  }, [])

  const dashboards = [

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

  const signup = () => {

    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password
    ) {

      alert(
        'Fill all fields'
      )

      return
    }

    localStorage.setItem(
      'user',
      JSON.stringify(
        signupData
      )
    )

    setLoggedUser(
      signupData
    )

    setShowSignup(
      false
    )

    alert(
      'Signup successful'
    )
  }

  const login = () => {

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          'user'
        )
      )

    if (
      savedUser?.email ===
        loginData.email &&
      savedUser?.password ===
        loginData.password
    ) {

      setLoggedUser(
        savedUser
      )

      setShowLogin(
        false
      )

      alert(
        'Login successful'
      )

    } else {

      alert(
        'Invalid credentials'
      )
    }
  }

  const logout = () => {

    localStorage.removeItem(
      'user'
    )

    setLoggedUser(
      null
    )

    alert(
      'Logged out'
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
              mb-2
            ">
              Dashboard Home
            </h1>

            <p className="
              text-gray-600
            ">
              Select a dashboard to continue
            </p>

          </div>

          <div className="
            flex
            items-center
            gap-3
          ">

            {loggedUser ? (

              <>

                <div className="
                  bg-white
                  px-4
                  py-2
                  rounded-xl
                  shadow
                  text-sm
                  font-medium
                ">

                  {loggedUser.name}

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
                  "
                >
                  Logout
                </button>

              </>

            ) : (

              <>

                <button
                  onClick={() =>
                    setShowLogin(
                      true
                    )
                  }
                  className="
                    bg-black
                    text-white
                    px-4
                    py-2
                    rounded-xl
                  "
                >
                  Login
                </button>

                <button
                  onClick={() =>
                    setShowSignup(
                      true
                    )
                  }
                  className="
                    bg-green-600
                    text-white
                    px-4
                    py-2
                    rounded-xl
                  "
                >
                  Signup
                </button>

              </>

            )}

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
            (dashboard) => (

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
                  transition-all
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
                    "
                  >
                    Open Dashboard
                  </button>

                </div>

              </div>
            )
          )}

        </div>

        {showLogin && (

          <div className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
          ">

            <div className="
              bg-white
              p-6
              rounded-2xl
              w-full
              max-w-md
            ">

              <h2 className="
                text-2xl
                font-bold
                mb-4
              ">
                Login
              </h2>

              <input
                type="email"
                placeholder="Email"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-3
                "
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email:
                      e.target
                        .value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-4
                "
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password:
                      e.target
                        .value,
                  })
                }
              />

              <div className="
                flex
                gap-3
              ">

                <button
                  onClick={
                    login
                  }
                  className="
                    flex-1
                    bg-black
                    text-white
                    py-3
                    rounded-lg
                  "
                >
                  Login
                </button>

                <button
                  onClick={() =>
                    setShowLogin(
                      false
                    )
                  }
                  className="
                    flex-1
                    bg-gray-300
                    py-3
                    rounded-lg
                  "
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

        {showSignup && (

          <div className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
          ">

            <div className="
              bg-white
              p-6
              rounded-2xl
              w-full
              max-w-md
            ">

              <h2 className="
                text-2xl
                font-bold
                mb-4
              ">
                Signup
              </h2>

              <input
                type="text"
                placeholder="Name"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-3
                "
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    name:
                      e.target
                        .value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Email"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-3
                "
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    email:
                      e.target
                        .value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="
                  w-full
                  border
                  p-3
                  rounded-lg
                  mb-4
                "
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    password:
                      e.target
                        .value,
                  })
                }
              />

              <div className="
                flex
                gap-3
              ">

                <button
                  onClick={
                    signup
                  }
                  className="
                    flex-1
                    bg-green-600
                    text-white
                    py-3
                    rounded-lg
                  "
                >
                  Signup
                </button>

                <button
                  onClick={() =>
                    setShowSignup(
                      false
                    )
                  }
                  className="
                    flex-1
                    bg-gray-300
                    py-3
                    rounded-lg
                  "
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}