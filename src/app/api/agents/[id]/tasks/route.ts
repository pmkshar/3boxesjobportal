import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Helper: ensure DB is seeded before any agent operation
async function ensureSeeded() {
  try {
    const { ensureSeedData } = await import('@/lib/db')
    await ensureSeedData()
  } catch {}
}

// GET /api/agents/[id]/tasks - List tasks for an agent with pagination and status filter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded()
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined

    const agent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { agentId: id }
    if (status) where.status = status
    if (type) where.type = type

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      prisma.aIAgentTask.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.aIAgentTask.count({ where }),
    ])

    return NextResponse.json({
      tasks,
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
    await ensureSeeded()
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

    const agent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (agent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot create tasks for inactive agent' },
        { status: 400 }
      )
    }

    const task = await prisma.aIAgentTask.create({
      data: {
        agentId: id,
        type,
        targetEmail: targetEmail || null,
        targetName: targetName || null,
        targetCompany: targetCompany || null,
        targetUrl: targetUrl || null,
        targetData: targetData ? (typeof targetData === 'string' ? targetData : JSON.stringify(targetData)) : null,
        priority: priority || 5,
        requiresApproval: requiresApproval || false,
        status: requiresApproval ? 'PENDING' : 'APPROVED',
      },
    })

    // Update agent's totalTasks counter
    await prisma.aIAgent.update({
      where: { id },
      data: { totalTasks: { increment: 1 } },
    })

    // Update daily stat
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await prisma.aIAgentDailyStat.upsert({
      where: { agentId_date: { agentId: id, date: today } },
      create: {
        agentId: id,
        date: today,
        tasksCreated: 1,
      },
      update: {
        tasksCreated: { increment: 1 },
      },
    })

    return NextResponse.json({ task, message: 'Task created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Task create error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
