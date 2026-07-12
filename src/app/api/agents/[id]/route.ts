import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/[id] - Get single agent with tasks, emails, and recent stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const agents = await memoryStore.getAgents()
    const agent = agents.find((a: any) => a.id === id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Enrich with tasks, emails, and stats
    const [tasks, emails, statsData] = await Promise.all([
      memoryStore.getAgentTasks(id, 20),
      memoryStore.getAgentEmails(id, 20),
      memoryStore.getAgentStats(id),
    ])

    const enrichedAgent = {
      ...agent,
      tasks: tasks || [],
      emails: emails || [],
      stats: statsData?.dailyStats?.slice(0, 30) || [],
    }

    return NextResponse.json({ agent: enrichedAgent })
  } catch (error) {
    console.error('Agent fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
  }
}

// PUT /api/agents/[id] - Update agent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const agents = await memoryStore.getAgents()
    const existingAgent = agents.find((a: any) => a.id === id)
    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const validStatuses = ['ACTIVE', 'PAUSED', 'STOPPED', 'ERROR']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.strategy !== undefined) updateData.strategy = typeof body.strategy === 'string' ? body.strategy : JSON.stringify(body.strategy)
    if (body.dailyLimit !== undefined) updateData.dailyLimit = body.dailyLimit
    if (body.dailySent !== undefined) updateData.dailySent = body.dailySent

    const agent = await memoryStore.updateAgent(id, updateData)

    return NextResponse.json({ agent, message: 'Agent updated successfully' })
  } catch (error) {
    console.error('Agent update error:', error)
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const agents = await memoryStore.getAgents()
    const existingAgent = agents.find((a: any) => a.id === id)
    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    await memoryStore.deleteAgent(id)

    return NextResponse.json({ message: 'Agent deleted successfully' })
  } catch (error) {
    console.error('Agent delete error:', error)
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
  }
}
