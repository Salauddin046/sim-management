'use client'

import {
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

export default function LoginPage() {

  const router =
    useRouter()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const loginUser =
    async () => {

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

        <h1 className="
          text-3xl
          font-bold
          text-center
          mb-8
        ">
          Login
        </h1>

        <div className="
          space-y-4
        ">

          <input
            type="email"
            placeholder="Email"
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
            "
          />

          <button
            onClick={
              loginUser
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
            Login
          </button>

          <button
            onClick={() =>
              router.push(
                '/signup'
              )
            }
            className="
              w-full
              border
              py-4
              rounded-xl
            "
          >
            Signup
          </button>

        </div>

      </div>

    </div>
  )
}