'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      alert('Enter a valid 6-digit OTP')
      return
    }

    const signupData = JSON.parse(sessionStorage.getItem('signupData') || 'null')

    if (!signupData) {
      alert('Session expired. Please start signup again.')
      router.push('/signup')
      return
    }

    try {
      setLoading(true)

      // Step 1: verify OTP
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        alert(verifyData.message)
        return
      }

      // Step 2: create account
      const signupRes = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      })
      const signupResult = await signupRes.json()

      if (!signupResult.success) {
        alert(signupResult.message)
        return
      }

      sessionStorage.removeItem('signupData')
      alert('Account created successfully!')
      router.push('/login')
    } catch {
      alert('OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-700 to-fuchsia-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Verify OTP</h1>
          <p className="text-white/70">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            maxLength={6}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none text-center text-3xl tracking-[12px] placeholder:text-white/40"
          />

          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full bg-white text-violet-700 py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            onClick={() => router.push('/signup')}
            className="w-full border border-white/30 py-4 rounded-2xl text-white"
          >
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  )
}
