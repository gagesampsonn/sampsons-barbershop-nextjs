'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown
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
      weekday: 'short',
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <h2 className="text-white font-medium mb-2">Unable to Load</h2>
          <p className="text-white/40 text-sm mb-6">{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="text-sm text-white/60 active:text-white py-2 px-4"
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

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-white/60 active:text-white p-2 -ml-2"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-white font-medium">Analytics</span>
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 -mr-2 text-white/60 active:text-white"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 pb-20">
        {/* Today Hero */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Today</p>
            <div className="text-5xl font-light text-white tracking-tight">
              {formatCurrency(summary.today.grossSales)}
            </div>
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs ${
              salesChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {salesChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(salesChange).toFixed(0)}% vs yesterday
            </div>
          </div>

          {/* Today's Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center">
              <div className="text-2xl font-light text-white">{summary.today.transactionCount}</div>
              <div className="text-white/30 text-xs mt-1">customers</div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center">
              <div className="text-2xl font-light text-emerald-400">{formatCurrency(summary.today.tips)}</div>
              <div className="text-white/30 text-xs mt-1">tips</div>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center">
              <div className="text-2xl font-light text-white">
                {summary.today.transactionCount > 0 
                  ? formatCurrency(summary.today.grossSales / summary.today.transactionCount)
                  : '$0'}
              </div>
              <div className="text-white/30 text-xs mt-1">avg ticket</div>
            </div>
          </div>
        </section>

        {/* Period Cards */}
        <section className="mb-8 space-y-3">
          {/* This Week */}
          <div className="bg-white/[0.03] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">This Week</span>
              <span className="text-white/30 text-xs">Sun – Today</span>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-light text-white">{formatCurrency(summary.thisWeek.grossSales)}</div>
              <div className="text-white/40 text-sm">{summary.thisWeek.transactionCount} customers</div>
            </div>
            <div className="text-emerald-400/70 text-sm mt-1">+{formatCurrencyDetailed(summary.thisWeek.tips)} tips</div>
          </div>

          {/* This Month */}
          <div className="bg-white/[0.03] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">This Month</span>
              <span className="text-white/30 text-xs">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-light text-white">{formatCurrency(summary.thisMonth.grossSales)}</div>
              <div className="text-white/40 text-sm">{summary.thisMonth.transactionCount} customers</div>
            </div>
            <div className="text-emerald-400/70 text-sm mt-1">+{formatCurrencyDetailed(summary.thisMonth.tips)} tips</div>
          </div>
        </section>

        {/* Top Days */}
        <section>
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">Top Days — 90 Days</h2>
          
          {summary.topDays.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              No data yet
            </div>
          ) : (
            <div className="space-y-2">
              {summary.topDays.slice(0, 10).map((day, index) => (
                <div 
                  key={day.date}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-amber-500/20 text-amber-400' :
                      index === 1 ? 'bg-zinc-500/20 text-zinc-300' :
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
                  <div className="text-right">
                    <div className="text-white font-medium">{formatCurrencyDetailed(day.grossSales)}</div>
                    <div className="text-emerald-400/60 text-xs">+{formatCurrencyDetailed(day.tips)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center mt-8 text-white/20 text-xs">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </main>
    </div>
  )
}
