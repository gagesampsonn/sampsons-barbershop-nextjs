'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw,
  Trophy,
  Banknote
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
    // Check auth
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--barber-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-blue)] mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading Square analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--barber-bg)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-red)]/20 flex items-center justify-center mx-auto mb-4">
            <DollarSign size={32} className="text-[var(--accent-red)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Analytics Unavailable</h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="admin-btn-secondary"
          >
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  if (!summary) return null

  const salesChange = getPercentChange(summary.today.grossSales, summary.yesterday.grossSales)
  const transactionChange = getPercentChange(summary.today.transactionCount, summary.yesterday.transactionCount)

  return (
    <div className="min-h-screen" style={{ background: 'var(--barber-bg)' }}>
      {/* Header */}
      <header className="border-b border-[var(--barber-border)] bg-[var(--barber-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg hover:bg-[var(--barber-border)] transition-colors"
            >
              <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">Square Analytics</h1>
              <p className="text-xs text-[var(--text-muted)]">
                {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="admin-btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Today's Stats */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Today&apos;s Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Gross Sales */}
            <div className="admin-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">Gross Sales</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)]">
                    {formatCurrency(summary.today.grossSales)}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  salesChange >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'
                }`}>
                  {salesChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(salesChange).toFixed(1)}%
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                vs yesterday: {formatCurrency(summary.yesterday.grossSales)}
              </p>
            </div>

            {/* Transactions */}
            <div className="admin-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">Transactions</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)]">
                    {summary.today.transactionCount}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  transactionChange >= 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-[var(--accent-red)]/20 text-[var(--accent-red)]'
                }`}>
                  {transactionChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(transactionChange).toFixed(1)}%
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                vs yesterday: {summary.yesterday.transactionCount}
              </p>
            </div>

            {/* Tips */}
            <div className="admin-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">Tips</p>
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(summary.today.tips)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Banknote size={20} className="text-green-400" />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {summary.today.grossSales > 0 
                  ? `${((summary.today.tips / summary.today.grossSales) * 100).toFixed(1)}% of sales`
                  : 'No sales yet'}
              </p>
            </div>

            {/* Average Transaction */}
            <div className="admin-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">Avg Transaction</p>
                  <p className="text-3xl font-bold text-[var(--accent-blue)]">
                    {summary.today.transactionCount > 0 
                      ? formatCurrency(summary.today.grossSales / summary.today.transactionCount)
                      : '$0.00'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                  <Users size={20} className="text-[var(--accent-blue)]" />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                per customer
              </p>
            </div>
          </div>
        </section>

        {/* Period Summaries */}
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Period Summaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* This Week */}
            <div className="admin-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                  <Calendar size={20} className="text-[var(--accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">This Week</h3>
                  <p className="text-xs text-[var(--text-muted)]">Sunday - Today</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Sales</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(summary.thisWeek.grossSales)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Transactions</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{summary.thisWeek.transactionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Tips</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(summary.thisWeek.tips)}</p>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="admin-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-red)]/20 flex items-center justify-center">
                  <Clock size={20} className="text-[var(--accent-red)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">This Month</h3>
                  <p className="text-xs text-[var(--text-muted)]">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Sales</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{formatCurrency(summary.thisMonth.grossSales)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Transactions</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{summary.thisMonth.transactionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Tips</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(summary.thisMonth.tips)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top 10 Busiest Days */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={20} className="text-yellow-400" />
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Top 10 Busiest Days (Last 90 Days)</h2>
          </div>
          <div className="admin-card">
            {summary.topDays.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <p>No transaction data available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.topDays.map((day, index) => (
                  <div 
                    key={day.date}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--barber-bg)] border border-[var(--barber-border)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-[var(--barber-border)] text-[var(--text-muted)]'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{formatDate(day.date)}</p>
                        <p className="text-xs text-[var(--text-muted)]">{day.transactionCount} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)]">{formatCurrency(day.grossSales)}</p>
                      <p className="text-xs text-green-400">+{formatCurrency(day.tips)} tips</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

