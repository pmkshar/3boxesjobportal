import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

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

    const agents = await memoryStore.getAgents()
    const agent = agents.find((a: any) => a.id === id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get tasks for this agent
    const allTasks = await memoryStore.getAgentTasks(id, 500)

    // Find tasks that match the requested IDs, belong to this agent, and are PENDING
    const pendingTasks = allTasks.filter(
      (t: any) => taskIds.includes(t.id) && t.status === 'PENDING' && t.requiresApproval === true
    )

    if (pendingTasks.length === 0) {
      return NextResponse.json(
        { error: 'No pending tasks found requiring approval' },
        { status: 404 }
      )
    }

    const approvedIds = pendingTasks.map((t: any) => t.id)

    // Approve tasks via memoryStore
    await memoryStore.approveTasks(id, approvedIds)

    // Fetch updated tasks to return
    const updatedTasks = await memoryStore.getAgentTasks(id, 500)
    const approvedTasks = updatedTasks.filter((t: any) => approvedIds.includes(t.id))

    // Task IDs that were not found or not eligible
    const notApproved = taskIds.filter((tid: string) => !approvedIds.includes(tid))

    return NextResponse.json({
      message: `${approvedIds.length} task(s) approved successfully`,
      approvedTasks,
      notApproved: notApproved.length > 0
        ? { ids: notApproved, reason: 'Not found, not PENDING, or does not require approval' }
        : undefined,
    })
  } catch (error) {
    console.error('Task approval error:', error)
    return NextResponse.json({ error: 'Failed to approve tasks' }, { status: 500 })
  }
}
