import { NextResponse } from 'next/server'
import { getTopCustomers } from '@/lib/square'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Square is not configured' },
        { status: 500 }
      )
    }

    const customers = await getTopCustomers(90, 10)
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

