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
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8a8a8a] text-sm tracking-wide">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b2635]/20 to-[#5c1a23]/10 flex items-center justify-center mx-auto mb-5 border border-[#8b2635]/20">
            <span className="text-[#c9a227] text-xl">!</span>
          </div>
          <h2 className="text-[#e8e8e8] font-medium text-lg mb-2">Unable to Load</h2>
          <p className="text-[#6a6a6a] text-sm mb-8 max-w-xs">{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="text-sm text-[#c9a227] hover:text-[#d4af37] transition-colors py-2 px-4"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!summary) return null

  const salesChange = getPercentChange(summary.today.grossSales, summary.yesterday.grossSales)
  const transactionChange = getPercentChange(summary.today.transactionCount, summary.yesterday.transactionCount)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#1a1a1a]/80 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between px-5 h-16">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-[#8a8a8a] hover:text-[#c9a227] active:text-[#c9a227] transition-colors p-2 -ml-2"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="text-center">
            <span className="text-[#e8e8e8] font-medium tracking-wide text-sm">Square Analytics</span>
          </div>
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 -mr-2 text-[#8a8a8a] hover:text-[#c9a227] active:text-[#c9a227] transition-colors"
          >
            <RefreshCw size={16} strokeWidth={1.5} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="px-5 py-8 pb-24 max-w-lg mx-auto">
        {/* Today's Revenue - Hero */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f1f1f] via-[#1a1a1a] to-[#141414] border border-[#2a2a2a] p-6">
            {/* Subtle gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/30 to-transparent"></div>
            
            <div className="text-center">
              <p className="text-[#6a6a6a] text-xs uppercase tracking-[0.2em] mb-4">Today&apos;s Revenue</p>
              
              {/* Main number with soft glow */}
              <div className="relative inline-block">
                <div 
                  className="text-5xl font-light text-[#f5f5f5] tracking-tight"
                  style={{ 
                    textShadow: summary.today.grossSales > 0 ? '0 0 40px rgba(201, 162, 39, 0.15)' : 'none' 
                  }}
                >
                  {formatCurrency(summary.today.grossSales)}
                </div>
              </div>

              {/* Change indicator */}
              <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs tracking-wide ${
                salesChange >= 0 
                  ? 'bg-[#1a2f1a] text-[#5a9a5a] border border-[#2a3f2a]' 
                  : 'bg-[#2f1a1a] text-[#9a5a5a] border border-[#3f2a2a]'
              }`}>
                {salesChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(salesChange).toFixed(0)}% vs yesterday
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Row */}
        <section className="mb-10">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#161616] rounded-2xl p-4 text-center border border-[#222]">
              <div 
                className="text-2xl font-light text-[#f0f0f0] mb-1"
                style={{ textShadow: '0 0 30px rgba(201, 162, 39, 0.1)' }}
              >
                {summary.today.transactionCount}
              </div>
              <div className="text-[#5a5a5a] text-[10px] uppercase tracking-[0.15em]">Customers</div>
            </div>
            
            <div className="bg-[#161616] rounded-2xl p-4 text-center border border-[#222]">
              <div 
                className="text-2xl font-light text-[#c9a227] mb-1"
                style={{ textShadow: '0 0 30px rgba(201, 162, 39, 0.2)' }}
              >
                {formatCurrency(summary.today.tips)}
              </div>
              <div className="text-[#5a5a5a] text-[10px] uppercase tracking-[0.15em]">Tips</div>
            </div>
            
            <div className="bg-[#161616] rounded-2xl p-4 text-center border border-[#222]">
              <div className="text-2xl font-light text-[#f0f0f0] mb-1">
                {summary.today.transactionCount > 0 
                  ? formatCurrency(summary.today.grossSales / summary.today.transactionCount)
                  : '$0'}
              </div>
              <div className="text-[#5a5a5a] text-[10px] uppercase tracking-[0.15em]">Avg Ticket</div>
            </div>
          </div>
        </section>

        {/* Period Summary */}
        <section className="mb-10">
          <h2 className="text-[#5a5a5a] text-[10px] uppercase tracking-[0.2em] mb-4 px-1">Period Summary</h2>
          
          <div className="space-y-3">
            {/* This Week */}
            <div className="bg-[#161616] rounded-2xl p-5 border border-[#222]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#c9c9c9] font-medium text-sm">This Week</span>
                <span className="text-[#4a4a4a] text-xs">Sun – Today</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div 
                    className="text-3xl font-light text-[#f0f0f0] tracking-tight"
                    style={{ textShadow: '0 0 30px rgba(201, 162, 39, 0.08)' }}
                  >
                    {formatCurrency(summary.thisWeek.grossSales)}
                  </div>
                  <div className="text-[#5a5a5a] text-xs mt-1">{summary.thisWeek.transactionCount} customers</div>
                </div>
                <div className="text-right">
                  <div className="text-[#c9a227] text-sm">+{formatCurrencyDetailed(summary.thisWeek.tips)}</div>
                  <div className="text-[#4a4a4a] text-xs">tips</div>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1816] to-[#161616] rounded-2xl p-5 border border-[#2a2520]">
              {/* Subtle red accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#8b2635]/5 to-transparent rounded-tl-full"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#c9c9c9] font-medium text-sm">This Month</span>
                  <span className="text-[#4a4a4a] text-xs">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div 
                      className="text-3xl font-light text-[#f0f0f0] tracking-tight"
                      style={{ textShadow: '0 0 40px rgba(201, 162, 39, 0.1)' }}
                    >
                      {formatCurrency(summary.thisMonth.grossSales)}
                    </div>
                    <div className="text-[#5a5a5a] text-xs mt-1">{summary.thisMonth.transactionCount} customers</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#c9a227] text-sm">+{formatCurrencyDetailed(summary.thisMonth.tips)}</div>
                    <div className="text-[#4a4a4a] text-xs">tips</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Days */}
        <section>
          <h2 className="text-[#5a5a5a] text-[10px] uppercase tracking-[0.2em] mb-4 px-1">Busiest Days — 90 Days</h2>
          
          {summary.topDays.length === 0 ? (
            <div className="text-center py-16 text-[#4a4a4a] text-sm">
              No data available
            </div>
          ) : (
            <div className="bg-[#161616] rounded-2xl border border-[#222] overflow-hidden">
              {summary.topDays.slice(0, 10).map((day, index) => (
                <div 
                  key={day.date}
                  className={`flex items-center justify-between p-4 ${
                    index !== summary.topDays.length - 1 && index !== 9 ? 'border-b border-[#1f1f1f]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 
                        ? 'bg-gradient-to-br from-[#c9a227]/20 to-[#8b7019]/10 text-[#c9a227] border border-[#c9a227]/20' 
                        : index === 1 
                        ? 'bg-gradient-to-br from-[#888]/15 to-[#666]/10 text-[#999] border border-[#666]/20'
                        : index === 2 
                        ? 'bg-gradient-to-br from-[#8b2635]/20 to-[#5c1a23]/10 text-[#c46b6b] border border-[#8b2635]/20'
                        : 'bg-[#1a1a1a] text-[#4a4a4a] border border-[#252525]'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-[#d0d0d0] text-sm">{formatDate(day.date)}</div>
                      <div className="text-[#4a4a4a] text-xs">{day.transactionCount} customers</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#e8e8e8] font-medium text-sm">{formatCurrencyDetailed(day.grossSales)}</div>
                    <div className="text-[#7a6a3a] text-xs">+{formatCurrencyDetailed(day.tips)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        {lastUpdated && (
          <div className="text-center mt-10">
            <p className="text-[#3a3a3a] text-xs tracking-wide">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
