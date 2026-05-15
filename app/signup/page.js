'use client'

import {
  useState
} from 'react'

import {
  useRouter
} from 'next/navigation'

export default function SignupPage() {

  const router =
    useRouter()

  const [loading, setLoading] =
    useState(false)

  const [formData, setFormData] =
    useState({

      name: '',

      email: '',

      password: '',
    })

  const signupUser =
    async () => {

      if (
        !formData.name ||
        !formData.email ||
        !formData.password
      ) {

        alert(
          'Please fill all fields'
        )

        return
      }

      try {

        setLoading(true)

        const otpResponse =
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
                  formData.email,
              }),
            }
          )

        const otpData =
          await otpResponse.json()

        if (
          !otpData.success
        ) {

          alert(
            otpData.message
          )

          return
        }

        localStorage.setItem(
          'signupData',
          JSON.stringify({
            ...formData,
            otp:
              otpData.otp,
          })
        )

        alert(
          `OTP Sent Successfully\n\nTest OTP: ${otpData.otp}`
        )

        router.push(
          '/verify-otp'
        )

      } catch (error) {

        console.error(
          error
        )

        alert(
          'Signup failed'
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
            Signup
          </h1>

          <p className="
            text-sm
            text-gray-500
          ">
            Create your account
          </p>

        </div>

        <div className="
          space-y-4
        ">

          <input
            type="text"
            placeholder="Full Name"
            value={
              formData.name
            }
            onChange={(e) =>
              setFormData({

                ...formData,

                name:
                  e.target
                    .value,
              })
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
            type="email"
            placeholder="Email Address"
            value={
              formData.email
            }
            onChange={(e) =>
              setFormData({

                ...formData,

                email:
                  e.target
                    .value,
              })
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
            value={
              formData.password
            }
            onChange={(e) =>
              setFormData({

                ...formData,

                password:
                  e.target
                    .value,
              })
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
              signupUser
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
                ? 'Sending OTP...'
                : 'Send OTP'
            }

          </button>

        </div>

        <div className="
          mt-6
          text-center
          text-sm
        ">

          Already have account?

          <button
            onClick={() =>
              router.push(
                '/login'
              )
            }
            className="
              ml-2
              font-semibold
              text-blue-600
            "
          >
            Login
          </button>

        </div>

      </div>

    </div>
  )
}