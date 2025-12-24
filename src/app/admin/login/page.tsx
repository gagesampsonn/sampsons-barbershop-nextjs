'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Scissors, Mail, Lock, AlertCircle } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const errorFromUrl = searchParams.get('error')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <>
      {/* Error messages */}
      {(errorFromUrl === 'unauthorized' || error) && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/30 flex items-start gap-3">
          <AlertCircle size={20} className="text-[var(--accent-red)] flex-shrink-0 mt-0.5" />
          <p className="text-[var(--accent-red)] text-sm">
            {errorFromUrl === 'unauthorized' 
              ? 'Your account is not authorized to access the admin panel.'
              : error}
          </p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="admin-card space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Email
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input pl-12"
              placeholder="admin@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input pl-12"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="admin-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </>
  )
}

function LoginFormFallback() {
  return (
    <div className="admin-card space-y-6">
      <div className="animate-pulse">
        <div className="h-4 bg-[var(--barber-border)] rounded w-1/4 mb-2"></div>
        <div className="h-12 bg-[var(--barber-border)] rounded"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-[var(--barber-border)] rounded w-1/4 mb-2"></div>
        <div className="h-12 bg-[var(--barber-border)] rounded"></div>
      </div>
      <div className="h-12 bg-[var(--barber-border)] rounded animate-pulse"></div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--barber-bg)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-red)] to-[var(--accent-red-light)] shadow-glow-red mb-4">
            <Scissors size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Login</h1>
          <p className="text-[var(--text-muted)] mt-2">Sampson&apos;s Barbershop</p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          <a href="/" className="hover:text-[var(--text-secondary)] transition-colors">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  )
}
