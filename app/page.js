'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/lib/DashboardLayout'
import { useAuth } from '@/lib/useAuth'

const CARDS = [
  { title: 'Usage Intelligence', route: '/datix' },
  { title: 'Command Center', route: '/command-center' },
  { title: 'SIM Overview', route: '/control-tower' },
  { title: 'SIM Explorer', route: '/sim-explorer' },
]

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout activeTitle="Home" user={user}>
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-3">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          Data-driven visibility into SIM intelligence infrastructure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-3xl shadow-sm border p-6 hover:shadow-xl transition-all"
            >
              <h2 className="text-xl font-bold mb-10">{card.title}</h2>
              <button
                onClick={() => router.push(card.route)}
                className="w-full bg-black text-white py-3 rounded-2xl font-semibold"
              >
                Open Dashboard
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
