'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LineChart,
  UploadCloud,
  MessageSquare,
  Users,
  Menu,
  X,
  LogOut,
  Settings,
  Zap,
  Layers
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LineChart },
  { name: 'Upload Data', href: '/dashboard/upload', icon: UploadCloud },
  { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: MessageSquare },
  { name: 'Local CRM', href: '/dashboard/crm', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground font-sans selection:bg-vivid-red/20">
      {/* Background Glows (Subtle for light mode) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-purple/5 rounded-full blur-[120px] pointer-events-none opacity-40"></div>
      
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition-transform duration-300 ease-in-out border-r border-black/5 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none ring-2 ring-vivid-red/20"
            >
              <X className="h-6 w-6 text-foreground" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-vivid-red to-vivid-purple flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-heading font-black tracking-tighter text-foreground">
                Datawiser
              </span>
            </div>
            <nav className="mt-8 px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== '/dashboard')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-3 py-3 text-base font-bold rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-vivid-red text-white shadow-lg shadow-vivid-red/20'
                        : 'text-foreground/60 hover:bg-black/5 hover:text-foreground'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-white' : 'text-foreground/30 group-hover:text-vivid-red'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 bg-background border-r border-black/5">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 glass-panel border-none rounded-r-[40px] m-4 mr-0 shadow-xl border border-black/[0.02]">
            <div className="flex-1 flex flex-col pt-10 pb-4 overflow-y-auto">
              <div className="flex items-center px-8 flex-shrink-0 mb-10 gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vivid-red to-vivid-purple flex items-center justify-center shadow-lg shadow-vivid-red/20 animate-pulse-glow">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-heading font-black tracking-tighter text-foreground">
                  Datawiser
                </span>
              </div>
              <nav className="mt-4 flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== '/dashboard')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-500 relative overflow-hidden ${
                        isActive
                          ? 'text-white scale-[1.02]'
                          : 'text-foreground/40 hover:text-foreground hover:bg-black/5'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-vivid-red to-vivid-purple z-0"></div>
                      )}
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 relative z-10 ${
                          isActive ? 'text-white' : 'text-foreground/20 group-hover:text-vivid-red'
                        }`}
                      />
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 p-6">
              <div className="rounded-[32px] bg-black/5 p-4 border border-black/5">
                <button onClick={handleLogout} className="w-full group">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-electric-purple to-vivid-rose text-white flex items-center justify-center shadow-sm">
                      <UserIcon className="w-5 h-5"/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-foreground leading-none mb-1 tracking-tight">Ecosystem</p>
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest group-hover:text-vivid-rose transition-colors">Sign Out</p>
                    </div>
                    <LogOut className="w-4 h-4 text-foreground/10 group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-none z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-vivid-red flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
            </div>
            <span className="text-xl font-heading font-black tracking-tighter text-foreground">
              Datawiser
            </span>
          </div>
          <div className="w-10"></div>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-mesh">
          <div className="py-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
