import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/agents - List all agents with stats summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get('type')

    const where: any = {}
    if (typeFilter) {
      where.type = typeFilter
    }

    const agents = await prisma.aIAgent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: true,
            emails: true,
          },
        },
        stats: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    const agentsWithSummary = agents.map((agent) => {
      const todayStat = agent.stats[0] || null
      return {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        description: agent.description,
        strategy: agent.strategy,
        dailyLimit: agent.dailyLimit,
        dailySent: agent.dailySent,
        totalTasks: agent.totalTasks,
        totalSuccess: agent.totalSuccess,
        totalFailed: agent.totalFailed,
        totalEmailsSent: agent.totalEmailsSent,
        totalResponses: agent.totalResponses,
        totalConversions: agent.totalConversions,
        avgResponseRate: agent.avgResponseRate,
        lastRunAt: agent.lastRunAt,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        taskCount: agent._count.tasks,
        emailCount: agent._count.emails,
        todayStats: todayStat,
      }
    })

    return NextResponse.json({ agents: agentsWithSummary, total: agents.length })
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

    const agent = await prisma.aIAgent.create({
      data: {
        name,
        type,
        description: description || null,
        strategy: strategy ? JSON.stringify(strategy) : null,
        dailyLimit: dailyLimit || 50,
        createdBy,
        status: 'ACTIVE',
        dailyResetAt: new Date(),
      },
    })

    return NextResponse.json({ agent, message: 'Agent created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Agent create error:', error)
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
  }
}
