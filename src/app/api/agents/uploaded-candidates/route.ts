import { NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/uploaded-candidates - List all uploaded candidates from data entry agent
export async function GET() {
  try {
    const candidates = await memoryStore.getUploadedCandidates()
    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Uploaded candidates fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch uploaded candidates' }, { status: 500 })
  }
}
