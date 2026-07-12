import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents - List all agents with stats summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get('type') || undefined

    const agents = await memoryStore.getAgents(typeFilter)
    return NextResponse.json({ agents, total: agents.length })
  } catch (error) {
    console.error('Agents fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, description, strategy, dailyLimit, createdBy } = body

    if (!name || !type || !createdBy) {
      return NextResponse.json(
        { error: 'Name, type, and createdBy are required' },
        { status: 400 }
      )
    }

    const validTypes = [
      'CANDIDATE_BUDDY',
      'ADMIN_OUTREACH_COMPANY',
      'ADMIN_OUTREACH_CANDIDATE',
      'ADMIN_OUTREACH_HR',
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid agent type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const agent = await memoryStore.createAgent({
      name, type, description, strategy, dailyLimit, createdBy,
    })

    return NextResponse.json({ agent, message: 'Agent created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Agent create error:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}
