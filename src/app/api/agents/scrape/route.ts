import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// POST /api/agents/scrape - Scrape a company website (simulated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Use memoryStore to scrape company
    const scrape = await memoryStore.scrapeCompany(url)

    return NextResponse.json({
      message: 'Company scraped successfully (simulated)',
      scrape,
      cached: false,
    }, { status: 201 })
  } catch (error) {
    console.error('Company scrape error:', error)
    return NextResponse.json({ error: 'Failed to scrape company' }, { status: 500 })
  }
}
