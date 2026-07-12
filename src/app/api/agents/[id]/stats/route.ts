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

// GET /api/agents/[id]/stats - Get agent stats (daily stats for last 30 days + overall summary)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded()
    const { id } = await params

    const agent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const dailyStats = await prisma.aIAgentDailyStat.findMany({
      where: {
        agentId: id,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate aggregate stats from daily stats
    const aggregate = dailyStats.reduce(
      (acc, stat) => ({
        tasksCreated: acc.tasksCreated + stat.tasksCreated,
        tasksCompleted: acc.tasksCompleted + stat.tasksCompleted,
        tasksFailed: acc.tasksFailed + stat.tasksFailed,
        emailsSent: acc.emailsSent + stat.emailsSent,
        emailsDelivered: acc.emailsDelivered + stat.emailsDelivered,
        emailsOpened: acc.emailsOpened + stat.emailsOpened,
        emailsReplied: acc.emailsReplied + stat.emailsReplied,
        emailsBounced: acc.emailsBounced + stat.emailsBounced,
        companiesScraped: acc.companiesScraped + stat.companiesScraped,
        contactsFound: acc.contactsFound + stat.contactsFound,
        jobsApplied: acc.jobsApplied + stat.jobsApplied,
        interviewsScheduled: acc.interviewsScheduled + stat.interviewsScheduled,
        onboardingsStarted: acc.onboardingsStarted + stat.onboardingsStarted,
        onboardingsCompleted: acc.onboardingsCompleted + stat.onboardingsCompleted,
      }),
      {
        tasksCreated: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        emailsSent: 0,
        emailsDelivered: 0,
        emailsOpened: 0,
        emailsReplied: 0,
        emailsBounced: 0,
        companiesScraped: 0,
        contactsFound: 0,
        jobsApplied: 0,
        interviewsScheduled: 0,
        onboardingsStarted: 0,
        onboardingsCompleted: 0,
      }
    )

    // Calculate derived rates from aggregates
    const last30DayRates = {
      deliveryRate: aggregate.emailsSent > 0 ? aggregate.emailsDelivered / aggregate.emailsSent : 0,
      openRate: aggregate.emailsDelivered > 0 ? aggregate.emailsOpened / aggregate.emailsDelivered : 0,
      replyRate: aggregate.emailsOpened > 0 ? aggregate.emailsReplied / aggregate.emailsOpened : 0,
      bounceRate: aggregate.emailsSent > 0 ? aggregate.emailsBounced / aggregate.emailsSent : 0,
      conversionRate: aggregate.emailsReplied > 0 ? aggregate.onboardingsCompleted / aggregate.emailsReplied : 0,
      taskSuccessRate: aggregate.tasksCreated > 0 ? aggregate.tasksCompleted / aggregate.tasksCreated : 0,
    }

    // Overall summary from the agent record itself
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

    // Task status breakdown
    const taskStatusBreakdown = await prisma.aIAgentTask.groupBy({
      by: ['status'],
      where: { agentId: id },
      _count: { status: true },
    })

    // Email status breakdown
    const emailStatusBreakdown = await prisma.aIAgentEmail.groupBy({
      by: ['status'],
      where: { agentId: id },
      _count: { status: true },
    })

    return NextResponse.json({
      agentId: id,
      agentName: agent.name,
      agentType: agent.type,
      dailyStats,
      aggregate,
      last30DayRates,
      overallSummary,
      taskStatusBreakdown: taskStatusBreakdown.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      emailStatusBreakdown: emailStatusBreakdown.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    })
  } catch (error) {
    console.error('Agent stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 })
  }
}
