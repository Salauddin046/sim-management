'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [userCaptcha, setUserCaptcha] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { generateCaptcha() }, [])

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let val = ''
    for (let i = 0; i < 6; i++) {
      val += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptcha(val)
  }

  const loginUser = async () => {
    if (!email || !password || !userCaptcha) {
      alert('Please fill all fields')
      return
    }
    if (userCaptcha !== captcha) {
      alert('Invalid captcha')
      generateCaptcha()
      setUserCaptcha('')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json()

      if (!result.success) {
        alert(result.message)
        generateCaptcha()
        setUserCaptcha('')
        return
      }

      router.push('/')
    } catch {
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-700 to-fuchsia-500 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Login</h1>
          <p className="text-white/70">Sign in to IntelliSIM</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loginUser()}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loginUser()}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />

          <div className="flex gap-3 items-center">
            <div className="bg-black text-white px-4 py-3 rounded-2xl font-bold tracking-[5px] flex-1 text-center select-none">
              {captcha}
            </div>
            <button
              onClick={generateCaptcha}
              className="bg-white text-black px-4 py-3 rounded-2xl font-semibold"
            >
              ↺
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter Captcha"
            value={userCaptcha}
            onChange={(e) => setUserCaptcha(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loginUser()}
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 outline-none placeholder:text-white/60"
          />

          <button
            onClick={loginUser}
            disabled={loading}
            className="w-full bg-white text-violet-700 py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <button
            onClick={() => router.push('/signup')}
            className="w-full border border-white/20 py-4 rounded-2xl font-semibold"
          >
            Create Account
          </button>

          <button
            onClick={() => router.push('/forgot-password')}
            className="w-full text-sm text-white/80"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  )
}
