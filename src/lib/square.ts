import { SquareClient, SquareEnvironment } from 'square'

// Initialize Square client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'sandbox' 
    ? SquareEnvironment.Sandbox 
    : SquareEnvironment.Production,
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

export interface TopCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  totalSpent: number
  visitCount: number
}

// Helper to convert BigInt to number safely
function bigIntToNumber(value: bigint | number | undefined): number {
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
    const allPayments: any[] = []
    
    // Get the async iterator and iterate through pages
    const paymentsIterator = await squareClient.payments.list({
      beginTime: getStartOfDay(startDate),
      endTime: getEndOfDay(endDate),
      limit: 100,
    })
    
    // Collect all payments from the paginated response
    for await (const payment of paymentsIterator) {
      allPayments.push(payment)
    }
    
    return allPayments
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

// Get top busiest days in the last 90 days
export async function getTopBusiestDays(limit: number = 10): Promise<DailySales[]> {
  const dailyData = await getDailyBreakdown(90)
  
  // Sort by gross sales descending (highest earning days)
  return dailyData
    .filter(d => d.grossSales > 0)
    .sort((a, b) => b.grossSales - a.grossSales)
    .slice(0, limit)
}

// Get monthly calendar data for a specific month
export async function getMonthlyCalendar(year: number, month: number): Promise<{ [day: number]: DailySales }> {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0) // Last day of month
  
  const payments = await getPayments(startDate, endDate)
  
  // Group payments by day
  const dailyData: { [day: number]: { grossSales: number; tips: number; count: number } } = {}
  
  for (const payment of payments) {
    if (payment.status === 'COMPLETED' && payment.createdAt) {
      const paymentDate = new Date(payment.createdAt)
      const day = paymentDate.getDate()
      
      if (!dailyData[day]) {
        dailyData[day] = { grossSales: 0, tips: 0, count: 0 }
      }
      
      dailyData[day].grossSales += bigIntToNumber(payment.totalMoney?.amount)
      dailyData[day].tips += bigIntToNumber(payment.tipMoney?.amount)
      dailyData[day].count++
    }
  }
  
  // Convert to DailySales format
  const result: { [day: number]: DailySales } = {}
  for (const [day, data] of Object.entries(dailyData)) {
    const dayNum = parseInt(day)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    result[dayNum] = {
      date: dateStr,
      grossSales: data.grossSales,
      netSales: data.grossSales - data.tips,
      tips: data.tips,
      transactionCount: data.count,
    }
  }
  
  return result
}

// Get top customers by spending in the last N days
export async function getTopCustomers(days: number = 90, limit: number = 10): Promise<TopCustomer[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const endDate = new Date()
  
  const payments = await getPayments(startDate, endDate)
  
  // Aggregate spending by customer ID
  const customerSpending: { [customerId: string]: { total: number; visits: number } } = {}
  
  for (const payment of payments) {
    if (payment.status === 'COMPLETED' && payment.customerId) {
      if (!customerSpending[payment.customerId]) {
        customerSpending[payment.customerId] = { total: 0, visits: 0 }
      }
      customerSpending[payment.customerId].total += bigIntToNumber(payment.totalMoney?.amount)
      customerSpending[payment.customerId].visits++
    }
  }
  
  // Sort by total spending
  const sortedCustomers = Object.entries(customerSpending)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, limit)
  
  // Fetch customer details
  const topCustomers: TopCustomer[] = []
  
  for (const [customerId, spending] of sortedCustomers) {
    try {
      const response = await squareClient.customers.get({ customerId })
      const customer = response as any
      
      const givenName = customer.givenName || ''
      const familyName = customer.familyName || ''
      const name = `${givenName} ${familyName}`.trim() || 'Unknown Customer'
      
      topCustomers.push({
        id: customerId,
        name,
        email: customer.emailAddress,
        phone: customer.phoneNumber,
        totalSpent: spending.total,
        visitCount: spending.visits,
      })
    } catch (error) {
      // Customer might have been deleted
      topCustomers.push({
        id: customerId,
        name: 'Unknown Customer',
        totalSpent: spending.total,
        visitCount: spending.visits,
      })
    }
  }
  
  return topCustomers
}

// Get a single customer's all-time spending
export async function getCustomerAllTimeSpending(customerId: string): Promise<{ totalSpent: number; visitCount: number }> {
  try {
    // Get payments for the last 2 years (max reasonable range)
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2)
    const endDate = new Date()
    
    const payments = await getPayments(startDate, endDate)
    
    let totalSpent = 0
    let visitCount = 0
    
    for (const payment of payments) {
      if (payment.status === 'COMPLETED' && payment.customerId === customerId) {
        totalSpent += bigIntToNumber(payment.totalMoney?.amount)
        visitCount++
      }
    }
    
    return { totalSpent, visitCount }
  } catch (error) {
    console.error('Error fetching customer spending:', error)
    return { totalSpent: 0, visitCount: 0 }
  }
}

// Get full payment summary
export async function getPaymentSummary(): Promise<PaymentSummary> {
  const [today, yesterday, thisWeek, thisMonth, topDays] = await Promise.all([
    getTodaySales(),
    getYesterdaySales(),
    getThisWeekSales(),
    getThisMonthSales(),
    getTopBusiestDays(10),
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
