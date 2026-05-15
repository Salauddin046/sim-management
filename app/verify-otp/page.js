'use client'

import { useState } from 'react'

import { useRouter }
from 'next/navigation'

export default function VerifyOtpPage() {

  const router =
    useRouter()

  const [otp, setOtp] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const verifyOtp =
    async () => {

      try {

        setLoading(true)

        const signupData =
          JSON.parse(
            localStorage.getItem(
              'signupData'
            )
          )

        if (
          !signupData
        ) {

          alert(
            'Signup session expired'
          )

          router.push(
            '/signup'
          )

          return
        }

        const response =
          await fetch(
            '/api/verify-otp',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                email:
                  signupData.email,

                otp,
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

        const signupResponse =
          await fetch(
            '/api/signup',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                name:
                  signupData.name,

                email:
                  signupData.email,

                password:
                  signupData.password,

                otp,
              }),
            }
          )

        const signupResult =
          await signupResponse.json()

        if (
          !signupResult.success
        ) {

          alert(
            signupResult.message
          )

          return
        }

        localStorage.removeItem(
          'signupData'
        )

        alert(
          'Account created successfully'
        )

        router.push(
          '/login'
        )

      } catch (error) {

        console.error(
          error
        )

        alert(
          'OTP verification failed'
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
          mb-8
          text-center
        ">

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">
            Verify OTP
          </h1>

          <p className="
            text-white/70
          ">
            Enter OTP sent to email
          </p>

        </div>

        <div className="
          space-y-4
        ">

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(
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
              text-center
              text-2xl
              tracking-[10px]
              placeholder:text-white/60
            "
          />

          <button
            onClick={
              verifyOtp
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
            "
          >

            {
              loading
                ? 'Verifying...'
                : 'Verify OTP'
            }

          </button>

        </div>

      </div>

    </div>
  )
}