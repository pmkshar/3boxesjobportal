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

// GET /api/agents/dashboard - Get super admin dashboard data
export async function GET() {
  try {
    await ensureSeeded()
    // Get all agents with their stats
    const agents = await prisma.aIAgent.findMany({
      include: {
        stats: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            tasks: true,
            emails: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Today's date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's stats across all agents
    const todayStats = await prisma.aIAgentDailyStat.findMany({
      where: { date: today },
    })

    // Aggregate today's metrics
    const todayAggregate = todayStats.reduce(
      (acc, stat) => ({
        emailsSent: acc.emailsSent + stat.emailsSent,
        emailsDelivered: acc.emailsDelivered + stat.emailsDelivered,
        emailsOpened: acc.emailsOpened + stat.emailsOpened,
        emailsReplied: acc.emailsReplied + stat.emailsReplied,
        emailsBounced: acc.emailsBounced + stat.emailsBounced,
        tasksCreated: acc.tasksCreated + stat.tasksCreated,
        tasksCompleted: acc.tasksCompleted + stat.tasksCompleted,
        tasksFailed: acc.tasksFailed + stat.tasksFailed,
        companiesScraped: acc.companiesScraped + stat.companiesScraped,
        contactsFound: acc.contactsFound + stat.contactsFound,
        jobsApplied: acc.jobsApplied + stat.jobsApplied,
        interviewsScheduled: acc.interviewsScheduled + stat.interviewsScheduled,
        onboardingsStarted: acc.onboardingsStarted + stat.onboardingsStarted,
        onboardingsCompleted: acc.onboardingsCompleted + stat.onboardingsCompleted,
      }),
      {
        emailsSent: 0,
        emailsDelivered: 0,
        emailsOpened: 0,
        emailsReplied: 0,
        emailsBounced: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        companiesScraped: 0,
        contactsFound: 0,
        jobsApplied: 0,
        interviewsScheduled: 0,
        onboardingsStarted: 0,
        onboardingsCompleted: 0,
      }
    )

    // Overall aggregate metrics from all agents
    const overallTotals = agents.reduce(
      (acc, agent) => ({
        totalTasks: acc.totalTasks + agent.totalTasks,
        totalSuccess: acc.totalSuccess + agent.totalSuccess,
        totalFailed: acc.totalFailed + agent.totalFailed,
        totalEmailsSent: acc.totalEmailsSent + agent.totalEmailsSent,
        totalResponses: acc.totalResponses + agent.totalResponses,
        totalConversions: acc.totalConversions + agent.totalConversions,
      }),
      {
        totalTasks: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalEmailsSent: 0,
        totalResponses: 0,
        totalConversions: 0,
      }
    )

    // Conversion rates
    const overallRates = {
      responseRate: overallTotals.totalEmailsSent > 0
        ? overallTotals.totalResponses / overallTotals.totalEmailsSent
        : 0,
      conversionRate: overallTotals.totalResponses > 0
        ? overallTotals.totalConversions / overallTotals.totalResponses
        : 0,
      taskSuccessRate: overallTotals.totalTasks > 0
        ? overallTotals.totalSuccess / overallTotals.totalTasks
        : 0,
      todayDeliveryRate: todayAggregate.emailsSent > 0
        ? todayAggregate.emailsDelivered / todayAggregate.emailsSent
        : 0,
      todayOpenRate: todayAggregate.emailsDelivered > 0
        ? todayAggregate.emailsOpened / todayAggregate.emailsDelivered
        : 0,
      todayReplyRate: todayAggregate.emailsOpened > 0
        ? todayAggregate.emailsReplied / todayAggregate.emailsOpened
        : 0,
      todayBounceRate: todayAggregate.emailsSent > 0
        ? todayAggregate.emailsBounced / todayAggregate.emailsSent
        : 0,
    }

    // Per-agent-type breakdowns
    const agentTypeBreakdown: Record<string, {
      count: number
      totalEmailsSent: number
      totalResponses: number
      totalConversions: number
      totalTasks: number
      totalSuccess: number
      avgResponseRate: number
      activeCount: number
    }> = {}

    for (const agent of agents) {
      const type = agent.type
      if (!agentTypeBreakdown[type]) {
        agentTypeBreakdown[type] = {
          count: 0,
          totalEmailsSent: 0,
          totalResponses: 0,
          totalConversions: 0,
          totalTasks: 0,
          totalSuccess: 0,
          avgResponseRate: 0,
          activeCount: 0,
        }
      }
      const breakdown = agentTypeBreakdown[type]
      breakdown.count += 1
      breakdown.totalEmailsSent += agent.totalEmailsSent
      breakdown.totalResponses += agent.totalResponses
      breakdown.totalConversions += agent.totalConversions
      breakdown.totalTasks += agent.totalTasks
      breakdown.totalSuccess += agent.totalSuccess
      if (agent.status === 'ACTIVE') breakdown.activeCount += 1
      if (breakdown.totalEmailsSent > 0) {
        breakdown.avgResponseRate = breakdown.totalResponses / breakdown.totalEmailsSent
      }
    }

    // Agents with summary data
    const agentsWithSummary = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      dailyLimit: agent.dailyLimit,
      dailySent: agent.dailySent,
      totalEmailsSent: agent.totalEmailsSent,
      totalResponses: agent.totalResponses,
      totalConversions: agent.totalConversions,
      avgResponseRate: agent.avgResponseRate,
      lastRunAt: agent.lastRunAt,
      createdAt: agent.createdAt,
      taskCount: agent._count.tasks,
      emailCount: agent._count.emails,
      todayStats: agent.stats[0] || null,
    }))

    // Recent activity feed (latest 20 tasks + emails across all agents)
    const agentIds = agents.map((a) => a.id)

    const [recentTasks, recentEmails] = await Promise.all([
      prisma.aIAgentTask.findMany({
        where: { agentId: { in: agentIds } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          agentId: true,
          type: true,
          status: true,
          targetCompany: true,
          targetName: true,
          createdAt: true,
          completedAt: true,
          agent: {
            select: { name: true, type: true },
          },
        },
      }),
      prisma.aIAgentEmail.findMany({
        where: { agentId: { in: agentIds } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          agentId: true,
          toEmail: true,
          toName: true,
          company: true,
          subject: true,
          status: true,
          createdAt: true,
          sentAt: true,
          agent: {
            select: { name: true, type: true },
          },
        },
      }),
    ])

    // Merge and sort the activity feed
    const activityFeed = [
      ...recentTasks.map((task) => ({
        id: task.id,
        type: 'task' as const,
        taskType: task.type,
        agentId: task.agentId,
        agentName: task.agent.name,
        agentType: task.agent.type,
        status: task.status,
        target: task.targetCompany || task.targetName || 'N/A',
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      })),
      ...recentEmails.map((email) => ({
        id: email.id,
        type: 'email' as const,
        taskType: 'email',
        agentId: email.agentId,
        agentName: email.agent.name,
        agentType: email.agent.type,
        status: email.status,
        target: email.company || email.toName || email.toEmail,
        subject: email.subject,
        createdAt: email.createdAt,
        sentAt: email.sentAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)

    // Agent status distribution
    const statusDistribution: Record<string, number> = {}
    for (const agent of agents) {
      statusDistribution[agent.status] = (statusDistribution[agent.status] || 0) + 1
    }

    return NextResponse.json({
      overview: {
        totalAgents: agents.length,
        activeAgents: agents.filter((a) => a.status === 'ACTIVE').length,
        pausedAgents: agents.filter((a) => a.status === 'PAUSED').length,
        stoppedAgents: agents.filter((a) => a.status === 'STOPPED').length,
        errorAgents: agents.filter((a) => a.status === 'ERROR').length,
      },
      todayMetrics: todayAggregate,
      overallTotals,
      overallRates,
      agentTypeBreakdown,
      statusDistribution,
      agents: agentsWithSummary,
      activityFeed,
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
