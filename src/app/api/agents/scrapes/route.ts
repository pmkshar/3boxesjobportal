import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/scrapes - List all scraped companies with contact details
export async function GET(request: NextRequest) {
  try {
    const scrapes = await memoryStore.getCompanyScrapes()
    return NextResponse.json({ scrapes })
  } catch (error) {
    console.error('Scraped companies fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch scraped companies' }, { status: 500 })
  }
}
