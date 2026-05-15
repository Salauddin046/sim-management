'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [captcha, setCaptcha] =
    useState('')

  const [userCaptcha, setUserCaptcha] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {

    generateCaptcha()

  }, [])

  const generateCaptcha = () => {

    const upper =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    const lower =
      'abcdefghijklmnopqrstuvwxyz'

    const numbers =
      '0123456789'

    const symbols =
      '!@#$%^&*'

    const all =
      upper +
      lower +
      numbers +
      symbols

    let value = ''

    value +=
      upper[
        Math.floor(
          Math.random() *
            upper.length
        )
      ]

    value +=
      lower[
        Math.floor(
          Math.random() *
            lower.length
        )
      ]

    value +=
      numbers[
        Math.floor(
          Math.random() *
            numbers.length
        )
      ]

    value +=
      symbols[
        Math.floor(
          Math.random() *
            symbols.length
        )
      ]

    for (
      let i = 0;
      i < 2;
      i++
    ) {

      value +=
        all[
          Math.floor(
            Math.random() *
              all.length
          )
        ]
    }

    value = value
      .split('')
      .sort(
        () =>
          Math.random() -
          0.5
      )
      .join('')

    setCaptcha(value)
  }

  const loginUser = () => {

    if (
      !email ||
      !password ||
      !userCaptcha
    ) {

      alert(
        'Please fill all fields'
      )

      return
    }

    if (
      userCaptcha !==
      captcha
    ) {

      alert(
        'Invalid captcha'
      )

      generateCaptcha()

      setUserCaptcha('')

      return
    }

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          'user'
        )
      )

    if (!savedUser) {

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

    setLoading(true)

    localStorage.setItem(
      'loggedIn',
      'true'
    )

    alert(
      'Login successful'
    )

    router.push('/')
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
          text-center
          mb-8
        ">

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">
            Login
          </h1>

          <p className="
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

          <div className="
            flex
            gap-3
            items-center
          ">

            <div className="
              bg-black
              text-white
              px-4
              py-3
              rounded-xl
              font-bold
              tracking-[3px]
              flex-1
              text-center
            ">

              {captcha}

            </div>

            <button
              onClick={
                generateCaptcha
              }
              className="
                bg-gray-200
                px-4
                py-3
                rounded-xl
                font-semibold
              "
            >
              Refresh
            </button>

          </div>

          <input
            type="text"
            placeholder="Enter Captcha"
            value={userCaptcha}
            onChange={(e) =>
              setUserCaptcha(
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
            disabled={loading}
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
              font-semibold
            "
          >
            Signup
          </button>

        </div>

      </div>

    </div>
  )
}