'use client'

import { useState } from 'react'

export default function SendOtpPage() {

  const [email, setEmail] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const sendOtp = async () => {

    if (!email) {

      alert(
        'Enter Email ID'
      )

      return
    }

    setLoading(true)

    try {

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
              email,
            }),
          }
        )

      const result =
        await response.json()

      if (
        result.success
      ) {

        alert(
          'OTP Sent Successfully'
        )

        window.location.href =
          '/verify-otp'

      } else {

        alert(
          result.message ||
          'Failed to Send OTP'
        )
      }

    } catch (error) {

      console.error(
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
          onClick={sendOtp}
          disabled={loading}
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