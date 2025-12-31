'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ChevronRight
} from 'lucide-react'

interface DailySales {
  date: string
  grossSales: number
  netSales: number
  tips: number
  transactionCount: number
}

interface PaymentSummary {
  today: DailySales
  yesterday: DailySales
  thisWeek: DailySales
  thisMonth: DailySales
  topDays: DailySales[]
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/square/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setSummary(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics. Make sure Square is configured correctly.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }
      fetchAnalytics()
    }
    checkAuth()
  }, [supabase, router, fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50 text-sm">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-white font-medium mb-2">Unable to Load</h2>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            ← Back to Admin
          </button>
        </div>
      </div>
    )
  }

  if (!summary) return null

  const salesChange = getPercentChange(summary.today.grossSales, summary.yesterday.grossSales)
  const transactionChange = getPercentChange(summary.today.transactionCount, summary.yesterday.transactionCount)
  const avgTransaction = summary.today.transactionCount > 0 
    ? summary.today.grossSales / summary.today.transactionCount 
    : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span>Admin</span>
          </button>
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Refresh'}
            </span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-light text-white tracking-tight mb-1">Analytics</h1>
          <p className="text-white/40 text-sm">Square payment data overview</p>
        </header>

        {/* Today's Overview - Large Cards */}
        <section className="mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="col-span-2 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <span className="text-white/40 text-xs uppercase tracking-widest">Today&apos;s Revenue</span>
                <div className={`flex items-center gap-1 text-xs ${salesChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {salesChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(salesChange).toFixed(0)}%
                </div>
              </div>
              <div className="text-5xl font-light text-white tracking-tight mb-2">
                {formatCurrency(summary.today.grossSales)}
              </div>
              <div className="text-white/30 text-sm">
                Yesterday: {formatCurrencyDetailed(summary.yesterday.grossSales)}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <span className="text-white/40 text-xs uppercase tracking-widest">Transactions</span>
              <div className="mt-6">
                <div className="text-4xl font-light text-white tracking-tight">
                  {summary.today.transactionCount}
                </div>
                <div className={`flex items-center gap-1 mt-2 text-xs ${transactionChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {transactionChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(transactionChange).toFixed(0)}% vs yesterday
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <span className="text-white/40 text-xs uppercase tracking-widest">Tips</span>
              <div className="mt-6">
                <div className="text-4xl font-light text-emerald-400 tracking-tight">
                  {formatCurrency(summary.today.tips)}
                </div>
                <div className="text-white/30 text-xs mt-2">
                  {summary.today.grossSales > 0 
                    ? `${((summary.today.tips / summary.today.grossSales) * 100).toFixed(1)}% of sales`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Average ticket - small inline stat */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/40">Avg ticket:</span>
              <span className="text-white font-medium">{formatCurrencyDetailed(avgTransaction)}</span>
            </div>
          </div>
        </section>

        {/* Period Stats */}
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-6">Period Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {/* This Week */}
            <div className="bg-[#0a0a0a] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm">This Week</span>
                <span className="text-white/30 text-xs">Sun – Today</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-light text-white">{formatCurrency(summary.thisWeek.grossSales)}</div>
                  <div className="text-white/30 text-xs mt-1">revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-white">{summary.thisWeek.transactionCount}</div>
                  <div className="text-white/30 text-xs mt-1">customers</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-emerald-400">{formatCurrency(summary.thisWeek.tips)}</div>
                  <div className="text-white/30 text-xs mt-1">tips</div>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="bg-[#0a0a0a] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm">This Month</span>
                <span className="text-white/30 text-xs">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-light text-white">{formatCurrency(summary.thisMonth.grossSales)}</div>
                  <div className="text-white/30 text-xs mt-1">revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-white">{summary.thisMonth.transactionCount}</div>
                  <div className="text-white/30 text-xs mt-1">customers</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-emerald-400">{formatCurrency(summary.thisMonth.tips)}</div>
                  <div className="text-white/30 text-xs mt-1">tips</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Days */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-6">Busiest Days — Last 90 Days</h2>
          
          {summary.topDays.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              No transaction data available
            </div>
          ) : (
            <div className="space-y-1">
              {summary.topDays.slice(0, 10).map((day, index) => (
                <div 
                  key={day.date}
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 ? 'bg-amber-500/20 text-amber-400' :
                      index === 1 ? 'bg-white/10 text-white/60' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/5 text-white/30'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white text-sm">{formatDate(day.date)}</div>
                      <div className="text-white/30 text-xs">{day.transactionCount} customers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-white text-sm font-medium">{formatCurrencyDetailed(day.grossSales)}</div>
                      <div className="text-emerald-400/70 text-xs">+{formatCurrencyDetailed(day.tips)} tips</div>
                    </div>
                    <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
