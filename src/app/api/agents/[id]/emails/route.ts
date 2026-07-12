import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET /api/agents/[id]/emails - List emails for an agent with pagination and status filter
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

    const agent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { agentId: id }
    if (status) where.status = status

    const skip = (page - 1) * limit

    const [emails, total] = await Promise.all([
      prisma.aIAgentEmail.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIAgentEmail.count({ where }),
    ])

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Emails fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}

// POST /api/agents/[id]/emails - Send an email via agent (simulated)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      toEmail,
      toName,
      company,
      subject,
      body: emailBody,
      templateId,
      templateData,
      followUpSequence,
      parentEmailId,
    } = body

    if (!toEmail || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'toEmail, subject, and body are required' },
        { status: 400 }
      )
    }

    const agent = await prisma.aIAgent.findUnique({ where: { id } })
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (agent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot send emails for inactive agent' },
        { status: 400 }
      )
    }

    // Check daily limit
    const now = new Date()
    const resetDate = new Date(agent.dailyResetAt)
    const needsReset = now.getDate() !== resetDate.getDate() ||
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()

    const currentDailySent = needsReset ? 0 : agent.dailySent

    if (currentDailySent >= agent.dailyLimit) {
      return NextResponse.json(
        { error: `Daily email limit (${agent.dailyLimit}) reached` },
        { status: 429 }
      )
    }

    // Create the email record
    const email = await prisma.aIAgentEmail.create({
      data: {
        agentId: id,
        toEmail,
        toName: toName || null,
        company: company || null,
        subject,
        body: emailBody,
        templateId: templateId || null,
        templateData: templateData ? (typeof templateData === 'string' ? templateData : JSON.stringify(templateData)) : null,
        followUpSequence: followUpSequence || 0,
        parentEmailId: parentEmailId || null,
        status: 'SENT', // Simulated: directly mark as SENT
        sentAt: new Date(),
      },
    })

    // Update agent counters
    const updateData: Record<string, unknown> = {
      totalEmailsSent: { increment: 1 },
    }

    if (needsReset) {
      updateData.dailySent = 1
      updateData.dailyResetAt = new Date()
    } else {
      updateData.dailySent = { increment: 1 }
    }

    await prisma.aIAgent.update({
      where: { id },
      data: updateData,
    })

    // Update or create daily stat
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Simulate some delivery metrics (80-95% delivery rate)
    const delivered = Math.random() > 0.1 // 90% delivery rate
    const opened = delivered && Math.random() > 0.5 // 50% of delivered get opened
    const replied = opened && Math.random() > 0.7 // 30% of opened get replies

    // Update email status based on simulation
    if (delivered) {
      await prisma.aIAgentEmail.update({
        where: { id: email.id },
        data: {
          status: replied ? 'REPLIED' : opened ? 'OPENED' : 'DELIVERED',
          deliveredAt: new Date(),
          openedAt: opened ? new Date() : null,
          openCount: opened ? 1 : 0,
          repliedAt: replied ? new Date() : null,
          replyCount: replied ? 1 : 0,
        },
      })

      // Update agent response/conversion counters
      if (replied) {
        await prisma.aIAgent.update({
          where: { id },
          data: {
            totalResponses: { increment: 1 },
          },
        })
      }
    } else {
      await prisma.aIAgentEmail.update({
        where: { id: email.id },
        data: {
          status: 'BOUNCED',
          bouncedReason: 'Simulated: recipient not found',
        },
      })
    }

    // Update daily stats
    const dailyStatUpdate: Record<string, unknown> = {
      emailsSent: { increment: 1 },
    }
    if (delivered) dailyStatUpdate.emailsDelivered = { increment: 1 }
    else dailyStatUpdate.emailsBounced = { increment: 1 }
    if (opened) dailyStatUpdate.emailsOpened = { increment: 1 }
    if (replied) dailyStatUpdate.emailsReplied = { increment: 1 }

    await prisma.aIAgentDailyStat.upsert({
      where: { agentId_date: { agentId: id, date: today } },
      create: {
        agentId: id,
        date: today,
        emailsSent: 1,
        emailsDelivered: delivered ? 1 : 0,
        emailsBounced: delivered ? 0 : 1,
        emailsOpened: opened ? 1 : 0,
        emailsReplied: replied ? 1 : 0,
      },
      update: dailyStatUpdate,
    })

    // Recalculate daily rates
    const todayStat = await prisma.aIAgentDailyStat.findUnique({
      where: { agentId_date: { agentId: id, date: today } },
    })
    if (todayStat && todayStat.emailsSent > 0) {
      await prisma.aIAgentDailyStat.update({
        where: { id: todayStat.id },
        data: {
          deliveryRate: todayStat.emailsDelivered / todayStat.emailsSent,
          openRate: todayStat.emailsOpened / todayStat.emailsSent,
          replyRate: todayStat.emailsReplied / todayStat.emailsSent,
          bounceRate: todayStat.emailsBounced / todayStat.emailsSent,
        },
      })

      // Update agent's average response rate
      const totalSent = agent.totalEmailsSent + 1
      const totalResp = agent.totalResponses + (replied ? 1 : 0)
      await prisma.aIAgent.update({
        where: { id },
        data: {
          avgResponseRate: totalResp / totalSent,
        },
      })
    }

    return NextResponse.json(
      {
        email,
        message: 'Email sent successfully (simulated)',
        simulation: { delivered, opened, replied },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
