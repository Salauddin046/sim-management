'use client'

import {
  useState
} from 'react'

import {
  useRouter
} from 'next/navigation'

export default function LoginPage() {

  const router =
    useRouter()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const loginUser =
    async () => {

      if (
        !email ||
        !password
      ) {

        alert(
          'Enter email and password'
        )

        return
      }

      try {

        setLoading(true)

        const savedUser =
          JSON.parse(
            localStorage.getItem(
              'user'
            )
          )

        if (
          !savedUser
        ) {

          alert(
            'No account found'
          )

          return
        }

        if (
          savedUser.email !==
            email
        ) {

          alert(
            'Invalid email'
          )

          return
        }

        const response =
          await fetch(
            '/api/login',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                email,
                password,
              }),
            }
          )

        const data =
          await response.json()

        if (
          !data.success
        ) {

          alert(
            data.message
          )

          return
        }

        localStorage.setItem(
          'loggedIn',
          'true'
        )

        alert(
          'Login successful'
        )

        router.push(
          '/'
        )

      } catch (error) {

        console.error(
          error
        )

        alert(
          'Login failed'
        )

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      flex
      items-center
      justify-center
      p-4
    ">

      <div className="
        bg-white
        w-full
        max-w-md
        rounded-3xl
        shadow-xl
        p-8
      ">

        <div className="
          mb-8
          text-center
        ">

          <h1 className="
            text-3xl
            font-bold
            text-gray-800
            mb-2
          ">
            Login
          </h1>

          <p className="
            text-sm
            text-gray-500
          ">
            Login to continue
          </p>

        </div>

        <div className="
          space-y-4
        ">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-xl
              p-4
              outline-none
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-xl
              p-4
              outline-none
            "
          />

          <button
            onClick={
              loginUser
            }
            disabled={
              loading
            }
            className="
              w-full
              bg-black
              text-white
              py-4
              rounded-xl
              font-semibold
            "
          >

            {
              loading
                ? 'Logging in...'
                : 'Login'
            }

          </button>

        </div>

        <div className="
          mt-6
          flex
          justify-between
          text-sm
        ">

          <button
            onClick={() =>
              router.push(
                '/signup'
              )
            }
            className="
              text-blue-600
              font-semibold
            "
          >
            Signup
          </button>

          <button
            onClick={() =>
              router.push(
                '/forgot-password'
              )
            }
            className="
              text-red-600
              font-semibold
            "
          >
            Forgot Password
          </button>

        </div>

      </div>

    </div>
  )
}