import { NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/dashboard - Get super admin dashboard data
export async function GET() {
  try {
    const data = await memoryStore.getAgentDashboard()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
