'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const update = (key, val) => setFormData((p) => ({ ...p, [key]: val }))

  const signupUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill all fields')
      return
    }

    try {
      setLoading(true)

      // Step 1: send OTP
      const otpRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      const otpData = await otpRes.json()

      if (!otpData.success) {
        alert(otpData.message)
        return
      }

      // Store signup intent in sessionStorage (not localStorage — clears on tab close)
      sessionStorage.setItem('signupData', JSON.stringify(formData))
      alert('OTP sent to your email')
      router.push('/verify-otp')
    } catch {
      alert('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-700 to-fuchsia-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Create Account</h1>
          <p className="text-sm text-white/80">Join IntelliSIM</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />

          <button
            onClick={signupUser}
            disabled={loading}
            className="w-full bg-white text-violet-700 py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send OTP & Continue'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-white/80">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="ml-1 font-semibold text-white">
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
