'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Lock, AlertCircle, Loader2, X, Layers } from 'lucide-react'
import { login, signup } from '@/app/actions/auth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const res = isLogin ? await login(formData) : await signup(formData)
      
      if (res?.error) {
        setError(res.error)
      }
    } catch (err: any) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/70 backdrop-blur-xl border border-black/5 rounded-[40px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Glow effects - adapted to the new light-mode aesthetic */}
        <div className="absolute -top-24 -left-20 w-48 h-48 bg-vivid-red/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-24 -right-20 w-48 h-48 bg-vivid-purple/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-foreground/40 hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-vivid-red to-vivid-purple rounded-2xl flex items-center justify-center transform rotate-3 shadow-lg group hover:rotate-6 transition-transform duration-300">
              <Layers className="w-8 h-8 text-white -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
            </div>
          </div>

          <h2 className="text-3xl font-heading font-black text-center mb-2 tracking-tight text-foreground">
            {isLogin ? 'Welcome Back' : 'Join Datawiser'}
          </h2>
          <p className="text-foreground/40 font-medium text-center mb-8 text-sm max-w-[280px] mx-auto leading-relaxed">
            {isLogin ? 'Enter your credentials to resume your journey.' : 'Create an account to start analyzing your data.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-foreground/20 group-focus-within:text-vivid-purple transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-white border border-black/5 text-foreground rounded-2xl focus:ring-4 focus:ring-vivid-purple/10 focus:border-vivid-purple block pl-12 p-3.5 outline-none transition-all shadow-sm font-medium placeholder:text-foreground/20"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-foreground/20 group-focus-within:text-vivid-purple transition-colors" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-white border border-black/5 text-foreground rounded-2xl focus:ring-4 focus:ring-vivid-purple/10 focus:border-vivid-purple block pl-12 p-3.5 outline-none transition-all shadow-sm font-medium placeholder:text-foreground/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-vivid-rose/5 border border-vivid-rose/20 text-vivid-rose text-xs font-bold flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden flex justify-center py-4 px-4 rounded-2xl text-sm font-black text-white bg-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-vivid-red to-vivid-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLogin ? (
                  'Access Datalink'
                ) : (
                  'Initialize Account'
                )}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-foreground/40">
            {isLogin ? "New to the ecosystem? " : "Already connected? "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-black text-vivid-purple hover:text-vivid-red transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-vivid-red after:scale-x-0 overflow-hidden after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}
