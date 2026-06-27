'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    if (!email) {
      alert('Please enter your email')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()

      if (!result.success) {
        alert(result.message)
        return
      }

      sessionStorage.setItem('resetEmail', email)
      alert('OTP sent to your email')
      router.push('/reset-password')
    } catch {
      alert('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-700 to-fuchsia-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Forgot Password</h1>
          <p className="text-white/70">Enter your email to receive an OTP</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />

          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-white text-violet-700 py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <button
            onClick={() => router.push('/login')}
            className="w-full border border-white/20 py-4 rounded-2xl font-semibold"
          >
            Back To Login
          </button>
        </div>
      </div>
    </div>
  )
}
