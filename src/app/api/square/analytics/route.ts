import { NextResponse } from 'next/server'
import { getPaymentSummary } from '@/lib/square'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if Square is configured
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Square is not configured' },
        { status: 500 }
      )
    }

    const summary = await getPaymentSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching Square analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

