'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {

  const router =
    useRouter()

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

  const generateCaptcha =
    () => {

      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      let value = ''

      for (
        let i = 0;
        i < 6;
        i++
      ) {

        value +=
          chars.charAt(

            Math.floor(
              Math.random() *
              chars.length
            )
          )
      }

      setCaptcha(value)
    }

  const loginUser =
    async () => {

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

      try {

        setLoading(true)

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

        const result =
          await response.json()

        if (
          !result.success
        ) {

          alert(
            result.message
          )

          return
        }

        localStorage.setItem(

          'user',

          JSON.stringify(
            result.user
          )
        )

        localStorage.setItem(
          'loggedIn',
          'true'
        )

        router.push('/')

      } catch (error) {

        console.log(error)

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
      bg-gradient-to-r
      from-violet-700
      to-fuchsia-500
      flex
      items-center
      justify-center
      p-4
    ">

      <div className="
        bg-white/10
        backdrop-blur-xl
        border
        border-white/20
        w-full
        max-w-md
        rounded-3xl
        shadow-2xl
        p-8
        text-white
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
            text-white/70
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
              bg-white/10
              border
              border-white/20
              rounded-2xl
              p-4
              outline-none
              placeholder:text-white/60
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
              bg-white/10
              border
              border-white/20
              rounded-2xl
              p-4
              outline-none
              placeholder:text-white/60
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
              rounded-2xl
              font-bold
              tracking-[5px]
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
                bg-white
                text-black
                px-4
                py-3
                rounded-2xl
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
              bg-white/10
              border
              border-white/20
              rounded-2xl
              p-4
              outline-none
              placeholder:text-white/60
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
              bg-white
              text-violet-700
              py-4
              rounded-2xl
              font-bold
              text-lg
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
              border-white/20
              py-4
              rounded-2xl
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
              w-full
              text-sm
              text-white/80
            "
          >
            Forgot Password?
          </button>

        </div>

      </div>

    </div>
  )
}