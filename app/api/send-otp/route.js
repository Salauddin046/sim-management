'use client'

import { useState } from 'react'

export default function SendOtpPage() {

  const [email, setEmail] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const sendOtp =
    async () => {

      // VALIDATE EMAIL

      if (!email) {

        alert(
          'Enter Email ID'
        )

        return
      }

      try {

        setLoading(true)

        const cleanEmail =

          String(email)

            .trim()

            .toLowerCase()

        console.log(
          'Sending OTP To:',
          cleanEmail
        )

        // SEND OTP API

        const response =
          await fetch(
            '/api/send-otp',
            {

              method: 'POST',

              headers: {

                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                email:
                  cleanEmail,
              }),
            }
          )

        const result =
          await response.json()

        console.log(
          'OTP API Result:',
          result
        )

        // FAILED

        if (
          !result.success
        ) {

          alert(

            result.message
            ||

            'Failed to Send OTP'
          )

          return
        }

        // SAVE EMAIL FOR VERIFY PAGE

        localStorage.setItem(

          'signupData',

          JSON.stringify({

            email:
              cleanEmail,
          })
        )

        console.log(
          'Email Saved In LocalStorage'
        )

        alert(
          'OTP Sent Successfully'
        )

        // REDIRECT

        window.location.href =
          '/verify-otp'

      } catch (error) {

        console.error(
          'SEND OTP ERROR:',
          error
        )

        alert(
          'Something went wrong'
        )

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
      p-4
    ">

      <div className="
        bg-white
        w-full
        max-w-md
        rounded-2xl
        shadow-lg
        p-8
      ">

        <h1 className="
          text-3xl
          font-bold
          mb-2
          text-center
        ">
          Send OTP
        </h1>

        <p className="
          text-gray-500
          text-sm
          mb-6
          text-center
        ">
          Enter your registered email ID
        </p>

        <input

          type="email"

          value={email}

          onChange={(e) =>

            setEmail(
              e.target.value
            )
          }

          placeholder="Enter Email ID"

          className="
            w-full
            border
            rounded-xl
            p-3
            mb-5
            outline-none
            focus:ring-2
            focus:ring-black
          "
        />

        <button

          onClick={
            sendOtp
          }

          disabled={
            loading
          }

          className="
            w-full
            bg-black
            text-white
            p-3
            rounded-xl
            font-semibold
            hover:bg-gray-800
            transition-all
          "
        >

          {
            loading

              ? 'Sending OTP...'

              : 'Send OTP'
          }

        </button>

        <button

          onClick={() =>
            window.location.href = '/'
          }

          className="
            w-full
            mt-3
            border
            p-3
            rounded-xl
            text-sm
          "
        >
          Back To Home
        </button>

      </div>

    </div>
  )
}