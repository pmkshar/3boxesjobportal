import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/[id]/tasks - List tasks for an agent with pagination and status filter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined

    const agents = await memoryStore.getAgents()
    const agent = agents.find((a: any) => a.id === id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    let tasks = await memoryStore.getAgentTasks(id, 200) // Get enough for filtering

    // Apply filters
    if (status) tasks = tasks.filter((t: any) => t.status === status)
    if (type) tasks = tasks.filter((t: any) => t.type === type)

    const total = tasks.length
    const skip = (page - 1) * limit
    const pagedTasks = tasks.slice(skip, skip + limit)

    return NextResponse.json({
      tasks: pagedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Tasks fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/agents/[id]/tasks - Create a task for an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      type,
      targetEmail,
      targetName,
      targetCompany,
      targetUrl,
      targetData,
      priority,
      requiresApproval,
    } = body

    if (!type) {
      return NextResponse.json({ error: 'Task type is required' }, { status: 400 })
    }

    const agents = await memoryStore.getAgents()
    const agent = agents.find((a: any) => a.id === id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (agent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot create tasks for inactive agent' },
        { status: 400 }
      )
    }

    const task = await memoryStore.createAgentTask(id, {
      type,
      targetEmail: targetEmail || null,
      targetName: targetName || null,
      targetCompany: targetCompany || null,
      targetUrl: targetUrl || null,
      targetData: targetData ? (typeof targetData === 'string' ? targetData : JSON.stringify(targetData)) : null,
      priority: priority || 5,
      requiresApproval: requiresApproval || false,
      status: requiresApproval ? 'PENDING' : 'APPROVED',
    })

    // Update agent's totalTasks counter
    await memoryStore.updateAgent(id, {
      totalTasks: (agent.totalTasks || 0) + 1,
    })

    return NextResponse.json({ task, message: 'Task created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Task create error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
