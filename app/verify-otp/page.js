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

        // VALIDATE OTP

        if (
          otp.length !== 6
        ) {

          alert(
            'Enter valid 6 digit OTP'
          )

          return
        }

        setLoading(true)

        // GET SIGNUP DATA

        const signupData =
          JSON.parse(

            localStorage.getItem(
              'signupData'
            )
          )

        // SESSION EXPIRED

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

        console.log(
          'Signup Data:',
          signupData
        )

        console.log(
          'Entered OTP:',
          otp
        )

        // VERIFY OTP

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
                  String(
                    signupData.email
                  )
                  .trim()
                  .toLowerCase(),

                otp:
                  String(
                    otp
                  ).trim(),
              }),
            }
          )

        const data =
          await response.json()

        console.log(
          'Verify Response:',
          data
        )

        // INVALID OTP

        if (
          !data.success
        ) {

          alert(
            data.message
          )

          return
        }

        // CREATE ACCOUNT

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

                otp:
                  String(
                    otp
                  ).trim(),
              }),
            }
          )

        const signupResult =
          await signupResponse.json()

        console.log(
          'Signup Result:',
          signupResult
        )

        // SIGNUP FAILED

        if (
          !signupResult.success
        ) {

          alert(
            signupResult.message
          )

          return
        }

        // CLEAR SESSION

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
          'VERIFY OTP ERROR:',
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

                  .replace(
                    /\D/g,
                    ''
                  )

                  .slice(0, 6)
              )
            }

            maxLength={6}

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
              hover:scale-[1.02]
              transition-all
            "
          >

            {
              loading

                ? 'Verifying...'

                : 'Verify OTP'
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
              border-white/30
              py-4
              rounded-2xl
              text-white
            "
          >
            Back
          </button>

        </div>

      </div>

    </div>
  )
}