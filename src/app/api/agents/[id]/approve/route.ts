import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// POST /api/agents/[id]/approve - Approve pending tasks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { taskIds, approvedBy } = body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'taskIds array is required and must not be empty' },
        { status: 400 }
      )
    }

    const agent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Find tasks that belong to this agent and are PENDING
    const pendingTasks = await prisma.aIAgentTask.findMany({
      where: {
        id: { in: taskIds },
        agentId: id,
        status: 'PENDING',
        requiresApproval: true,
      },
    })

    if (pendingTasks.length === 0) {
      return NextResponse.json(
        { error: 'No pending tasks found requiring approval' },
        { status: 404 }
      )
    }

    const now = new Date()
    const approvedIds = pendingTasks.map((t) => t.id)

    // Update all matching tasks to APPROVED
    await prisma.aIAgentTask.updateMany({
      where: {
        id: { in: approvedIds },
      },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'admin',
        approvedAt: now,
      },
    })

    // Fetch the updated tasks
    const updatedTasks = await prisma.aIAgentTask.findMany({
      where: { id: { in: approvedIds } },
    })

    // Task IDs that were not found or not eligible
    const notApproved = taskIds.filter((tid: string) => !approvedIds.includes(tid))

    return NextResponse.json({
      message: `${approvedIds.length} task(s) approved successfully`,
      approvedTasks: updatedTasks,
      notApproved: notApproved.length > 0
        ? { ids: notApproved, reason: 'Not found, not PENDING, or does not require approval' }
        : undefined,
    })
  } catch (error) {
    console.error('Task approval error:', error)
    return NextResponse.json({ error: 'Failed to approve tasks' }, { status: 500 })
  }
}
