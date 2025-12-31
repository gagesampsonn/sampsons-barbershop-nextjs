import { Client, Environment } from 'square'

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'sandbox' 
    ? Environment.Sandbox 
    : Environment.Production,
})

export interface DailySales {
  date: string
  grossSales: number
  netSales: number
  tips: number
  transactionCount: number
}

export interface PaymentSummary {
  today: DailySales
  yesterday: DailySales
  thisWeek: DailySales
  thisMonth: DailySales
  topDays: DailySales[]
}

// Helper to convert BigInt to number safely
function bigIntToNumber(value: bigint | undefined): number {
  if (value === undefined) return 0
  return Number(value) / 100 // Square amounts are in cents
}

// Get start of day in RFC3339 format
function getStartOfDay(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// Get end of day in RFC3339 format
function getEndOfDay(date: Date): string {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

// Fetch payments for a date range
export async function getPayments(startDate: Date, endDate: Date) {
  try {
    const { result } = await squareClient.paymentsApi.listPayments(
      getStartOfDay(startDate),
      getEndOfDay(endDate),
      undefined, // sortOrder
      undefined, // cursor
      undefined, // locationId
      undefined, // total
      undefined, // last4
      undefined, // cardBrand
      100 // limit
    )
    return result.payments || []
  } catch (error) {
    console.error('Error fetching Square payments:', error)
    return []
  }
}

// Calculate sales summary for a date range
export async function getSalesSummary(startDate: Date, endDate: Date): Promise<DailySales> {
  const payments = await getPayments(startDate, endDate)
  
  let grossSales = 0
  let tips = 0
  let transactionCount = 0

  for (const payment of payments) {
    if (payment.status === 'COMPLETED') {
      grossSales += bigIntToNumber(payment.totalMoney?.amount)
      tips += bigIntToNumber(payment.tipMoney?.amount)
      transactionCount++
    }
  }

  return {
    date: startDate.toISOString().split('T')[0],
    grossSales,
    netSales: grossSales - tips,
    tips,
    transactionCount,
  }
}

// Get today's sales
export async function getTodaySales(): Promise<DailySales> {
  const today = new Date()
  return getSalesSummary(today, today)
}

// Get yesterday's sales
export async function getYesterdaySales(): Promise<DailySales> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return getSalesSummary(yesterday, yesterday)
}

// Get this week's sales (Sunday to today)
export async function getThisWeekSales(): Promise<DailySales> {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  return getSalesSummary(startOfWeek, today)
}

// Get this month's sales
export async function getThisMonthSales(): Promise<DailySales> {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return getSalesSummary(startOfMonth, today)
}

// Get daily breakdown for the last N days
export async function getDailyBreakdown(days: number): Promise<DailySales[]> {
  const results: DailySales[] = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const summary = await getSalesSummary(date, date)
    results.push(summary)
  }
  
  return results
}

// Get top 10 busiest days in the last 90 days
export async function getTopBusiestDays(): Promise<DailySales[]> {
  const dailyData = await getDailyBreakdown(90)
  
  // Sort by transaction count descending
  return dailyData
    .filter(d => d.transactionCount > 0)
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 10)
}

// Get full payment summary
export async function getPaymentSummary(): Promise<PaymentSummary> {
  const [today, yesterday, thisWeek, thisMonth, topDays] = await Promise.all([
    getTodaySales(),
    getYesterdaySales(),
    getThisWeekSales(),
    getThisMonthSales(),
    getTopBusiestDays(),
  ])

  return {
    today,
    yesterday,
    thisWeek,
    thisMonth,
    topDays,
  }
}

// Get hourly breakdown for a specific day
export async function getHourlyBreakdown(date: Date): Promise<{ hour: number; count: number; amount: number }[]> {
  const payments = await getPayments(date, date)
  
  const hourlyData: { [key: number]: { count: number; amount: number } } = {}
  
  // Initialize all hours
  for (let h = 0; h < 24; h++) {
    hourlyData[h] = { count: 0, amount: 0 }
  }
  
  for (const payment of payments) {
    if (payment.status === 'COMPLETED' && payment.createdAt) {
      const paymentDate = new Date(payment.createdAt)
      const hour = paymentDate.getHours()
      hourlyData[hour].count++
      hourlyData[hour].amount += bigIntToNumber(payment.totalMoney?.amount)
    }
  }
  
  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    count: data.count,
    amount: data.amount,
  }))
}

