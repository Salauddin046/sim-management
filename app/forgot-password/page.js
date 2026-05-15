'use client'

export default function ForgotPasswordPage() {

  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
    ">

      <div className="
        bg-white
        p-8
        rounded-xl
        shadow-lg
        w-full
        max-w-md
      ">

        <h1 className="
          text-2xl
          font-bold
          mb-4
        ">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          className="
            w-full
            border
            rounded-lg
            p-3
            mb-4
          "
        />

        <button
          className="
            w-full
            bg-black
            text-white
            p-3
            rounded-lg
          "
        >
          Reset Password
        </button>

      </div>

    </div>
  )
}