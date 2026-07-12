import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/[id]/stats - Get agent stats (daily stats for last 30 days + overall summary)
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

    // Get stats from memoryStore
    const statsData = await memoryStore.getAgentStats(id)

    if (!statsData) {
      return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 })
    }

    // Get tasks and emails for status breakdowns
    const [tasks, emails] = await Promise.all([
      memoryStore.getAgentTasks(id, 500),
      memoryStore.getAgentEmails(id, 500),
    ])

    // Task status breakdown
    const taskStatusMap: Record<string, number> = {}
    for (const task of tasks) {
      const status = task.status || 'UNKNOWN'
      taskStatusMap[status] = (taskStatusMap[status] || 0) + 1
    }
    const taskStatusBreakdown = Object.entries(taskStatusMap).map(([status, count]) => ({
      status,
      count,
    }))

    // Email status breakdown
    const emailStatusMap: Record<string, number> = {}
    for (const email of emails) {
      const status = email.status || 'UNKNOWN'
      emailStatusMap[status] = (emailStatusMap[status] || 0) + 1
    }
    const emailStatusBreakdown = Object.entries(emailStatusMap).map(([status, count]) => ({
      status,
      count,
    }))

    // Get daily stats and calculate aggregates
    const dailyStats = statsData.dailyStats || []
    const aggregate = statsData.aggregate || {
      tasksCreated: 0, tasksCompleted: 0, tasksFailed: 0,
      emailsSent: 0, emailsDelivered: 0, emailsOpened: 0,
      emailsReplied: 0, emailsBounced: 0, companiesScraped: 0,
      contactsFound: 0, jobsApplied: 0, interviewsScheduled: 0,
      onboardingsStarted: 0, onboardingsCompleted: 0,
    }

    // Calculate derived rates from aggregates
    const last30DayRates = {
      deliveryRate: aggregate.emailsSent > 0 ? aggregate.emailsDelivered / aggregate.emailsSent : 0,
      openRate: aggregate.emailsDelivered > 0 ? aggregate.emailsOpened / aggregate.emailsDelivered : 0,
      replyRate: aggregate.emailsOpened > 0 ? aggregate.emailsReplied / aggregate.emailsOpened : 0,
      bounceRate: aggregate.emailsSent > 0 ? aggregate.emailsBounced / aggregate.emailsSent : 0,
      conversionRate: aggregate.emailsReplied > 0 ? aggregate.onboardingsCompleted / aggregate.emailsReplied : 0,
      taskSuccessRate: aggregate.tasksCreated > 0 ? aggregate.tasksCompleted / aggregate.tasksCreated : 0,
    }

    // Overall summary from the agent record
    const overallSummary = {
      totalTasks: agent.totalTasks,
      totalSuccess: agent.totalSuccess,
      totalFailed: agent.totalFailed,
      totalEmailsSent: agent.totalEmailsSent,
      totalResponses: agent.totalResponses,
      totalConversions: agent.totalConversions,
      avgResponseRate: agent.avgResponseRate,
      dailyLimit: agent.dailyLimit,
      dailySent: agent.dailySent,
      lastRunAt: agent.lastRunAt,
      status: agent.status,
    }

    return NextResponse.json({
      agentId: id,
      agentName: agent.name,
      agentType: agent.type,
      dailyStats,
      aggregate,
      last30DayRates,
      overallSummary,
      taskStatusBreakdown,
      emailStatusBreakdown,
    })
  } catch (error) {
    console.error('Agent stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 })
  }
}
