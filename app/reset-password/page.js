'use client'

import { useState }
from 'react'

import { useRouter }
from 'next/navigation'

export default function ResetPasswordPage() {

  const router =
    useRouter()

  const [loading, setLoading] =
    useState(false)

  const [formData, setFormData] =
    useState({

      email: '',

      otp: '',

      password: '',

      confirmPassword: '',
    })

  const resetPassword =
    async () => {

      if (
        !formData.email ||
        !formData.otp ||
        !formData.password ||
        !formData.confirmPassword
      ) {

        alert(
          'Please fill all fields'
        )

        return
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {

        alert(
          'Passwords do not match'
        )

        return
      }

      try {

        setLoading(true)

        const response =
          await fetch(
            '/api/reset-password',
            {

              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({

                email:
                  formData.email,

                otp:
                  formData.otp,

                newPassword:
                  formData.password,
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

        alert(
          'Password updated successfully'
        )

        router.push(
          '/login'
        )

      } catch (error) {

        console.log(
          error
        )

        alert(
          'Reset password failed'
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
            Reset Password
          </h1>

          <p className="
            text-white/70
          ">
            Update your account password
          </p>

        </div>

        <div className="
          space-y-4
        ">

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
                  e.target.value,
              })
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
            type="text"
            placeholder="Enter OTP"
            value={
              formData.otp
            }
            onChange={(e) =>
              setFormData({

                ...formData,

                otp:
                  e.target.value,
              })
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
              tracking-[8px]
              placeholder:text-white/60
            "
          />

          <input
            type="password"
            placeholder="New Password"
            value={
              formData.password
            }
            onChange={(e) =>
              setFormData({

                ...formData,

                password:
                  e.target.value,
              })
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
            placeholder="Confirm Password"
            value={
              formData.confirmPassword
            }
            onChange={(e) =>
              setFormData({

                ...formData,

                confirmPassword:
                  e.target.value,
              })
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
              resetPassword
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
                ? 'Updating...'
                : 'Update Password'
            }

          </button>

        </div>

      </div>

    </div>
  )
}