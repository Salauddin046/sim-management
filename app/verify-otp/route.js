'use client'

import {
  useState
} from 'react'

import {
  useRouter
} from 'next/navigation'

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

        localStorage.setItem(
          'user',
          JSON.stringify(
            signupResult.user
          )
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
            Verify OTP
          </h1>

          <p className="
            text-sm
            text-gray-500
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
              border
              rounded-xl
              p-4
              outline-none
              text-center
              text-xl
              tracking-[10px]
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
              bg-black
              text-white
              py-4
              rounded-xl
              font-semibold
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