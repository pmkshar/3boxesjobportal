import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/agents/[id] - Get single agent with tasks, emails, and recent stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const agent = await prisma.aIAgent.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        emails: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        stats: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json({ agent })
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

    const existingAgent = await prisma.aIAgent.findUnique({ where: { id } })
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

    const agent = await prisma.aIAgent.update({
      where: { id },
      data: updateData,
    })

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

    const existingAgent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Delete cascade will handle tasks, emails, and stats
    await prisma.aIAgent.delete({ where: { id } })

    return NextResponse.json({ message: 'Agent deleted successfully' })
  } catch (error) {
    console.error('Agent delete error:', error)
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
  }
}
