import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyCalendar, getTopBusiestDays } from '@/lib/square'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Square is not configured' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()))

    const [calendar, topDays] = await Promise.all([
      getMonthlyCalendar(year, month),
      getTopBusiestDays(10)
    ])

    return NextResponse.json({ calendar, topDays })
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar' },
      { status: 500 }
    )
  }
}

