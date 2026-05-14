'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] =
    useState('')

  const [otpSent, setOtpSent] = useState(false)

  const [message, setMessage] = useState('')

  const [captcha, setCaptcha] = useState('')
  const [captchaInput, setCaptchaInput] =
    useState('')

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

    let text = ''

    for (let i = 0; i < 6; i++) {
      text += chars.charAt(
        Math.floor(Math.random() * chars.length)
      )
    }

    setCaptcha(text)
  }

  const sendOtp = async () => {
    setMessage('')

    try {
      const response = await fetch(
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

      const result = await response.json()

      if (response.ok) {
        setGeneratedOtp(result.otp)
        setOtpSent(true)
        setMessage('OTP sent to email')
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('OTP failed')
    }
  }

  const verifyOtpAndSignup = async () => {
    setMessage('')

    if (otp !== generatedOtp) {
      setMessage('Invalid OTP')
      return
    }

    try {
      const response = await fetch(
        '/api/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            username,
            password,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        setMessage(
          'Account created successfully'
        )

        setIsLogin(true)

        setName('')
        setEmail('')
        setUsername('')
        setPassword('')
        setOtp('')
        setOtpSent(false)
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('Signup failed')
    }
  }

  const handleLogin = async () => {
    setMessage('')

    if (
      captchaInput.toUpperCase() !== captcha
    ) {
      setMessage('Invalid CAPTCHA')
      generateCaptcha()
      return
    }

    try {
      const response = await fetch(
        '/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      )

      const result = await response.json()

      if (response.ok) {
        setLoggedIn(true)
      } else {
        setMessage(result.error)
      }
    } catch (error) {
      console.error(error)
      setMessage('Login failed')
    }
  }

  const handleForgotPassword = async () => {
    const mail = prompt(
      'Enter your registered email'
    )

    if (!mail) return

    try {
      const response = await fetch(
        '/api/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: mail,
          }),
        }
      )

      const result = await response.json()

      setMessage(
        result.message || result.error
      )
    } catch (error) {
      console.error(error)
      setMessage('Failed')
    }
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

          <h1 className="text-3xl font-bold text-center mb-6">
            {isLogin ? 'Login' : 'Signup'}
          </h1>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              />
            </>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          />

          {!isLogin && otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />
          )}

          {isLogin && (
            <>
              <div className="bg-gray-200 text-center p-3 rounded-lg mb-3 text-xl font-bold tracking-widest">
                {captcha}
              </div>

              <input
                type="text"
                placeholder="Enter CAPTCHA"
                value={captchaInput}
                onChange={(e) =>
                  setCaptchaInput(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              />
            </>
          )}

          {isLogin ? (
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              Login
            </button>
          ) : otpSent ? (
            <button
              onClick={verifyOtpAndSignup}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Verify OTP & Signup
            </button>
          ) : (
            <button
              onClick={sendOtp}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              Send OTP
            </button>
          )}

          {isLogin && (
            <button
              onClick={handleForgotPassword}
              className="w-full mt-4 text-blue-600"
            >
              Forgot Password?
            </button>
          )}

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            className="w-full mt-4 text-blue-600"
          >
            {isLogin
              ? 'Create New Account'
              : 'Already have account? Login'}
          </button>

          {message && (
            <p className="text-center mt-4 text-red-600">
              {message}
            </p>
          )}

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow-lg">

        <h1 className="text-4xl font-bold mb-4">
          Telecom Dashboard
        </h1>

        <p className="text-gray-600">
          Login successful
        </p>

      </div>

    </div>
  )
}