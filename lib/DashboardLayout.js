'use client'

import { useRouter } from 'next/navigation'

const MENUS = [
  { title: 'Home', route: '/' },
  { title: 'Usage Intelligence', route: '/datix' },
  { title: 'Command Center', route: '/command-center' },
  { title: 'SIM Overview', route: '/control-tower' },
  { title: 'SIM Explorer', route: '/sim-explorer' },
]

export default function DashboardLayout({ children, activeTitle, user }) {
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Sidebar */}
      <div className="w-[260px] bg-white border-r flex flex-col justify-between">
        <div>
          <div className="p-6 border-b flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">
              I
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">IntelliSIM</h1>
              <p className="text-xs text-gray-500 mt-0.5">SIM Intelligence & Control</p>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {MENUS.map((menu) => (
              <button
                key={menu.title}
                onClick={() => router.push(menu.route)}
                className={`w-full flex items-center px-4 py-3 rounded-2xl font-medium transition-all text-left ${
                  menu.title === activeTitle
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {menu.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white h-[72px] border-b flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold">{activeTitle}</h1>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
