import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

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

    const agents = await memoryStore.getAgents()
    const agent = agents.find((a: any) => a.id === id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    let emails = await memoryStore.getAgentEmails(id, 200) // Get enough for filtering

    // Apply filters
    if (status) emails = emails.filter((e: any) => e.status === status)

    const total = emails.length
    const skip = (page - 1) * limit
    const pagedEmails = emails.slice(skip, skip + limit)

    return NextResponse.json({
      emails: pagedEmails,
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

    const agents = await memoryStore.getAgents()
    const agent = agents.find((a: any) => a.id === id)
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

    // Simulate delivery metrics
    const delivered = Math.random() > 0.1
    const opened = delivered && Math.random() > 0.5
    const replied = opened && Math.random() > 0.7
    const emailStatus = replied ? 'REPLIED' : opened ? 'OPENED' : delivered ? 'DELIVERED' : 'BOUNCED'

    // Create the email record
    const email = await memoryStore.createAgentEmail(id, {
      toEmail,
      toName: toName || null,
      company: company || null,
      subject,
      body: emailBody,
      templateId: templateId || null,
      templateData: templateData ? (typeof templateData === 'string' ? templateData : JSON.stringify(templateData)) : null,
      followUpSequence: followUpSequence || 0,
      parentEmailId: parentEmailId || null,
      status: emailStatus,
      sentAt: new Date().toISOString(),
      deliveredAt: delivered ? new Date().toISOString() : null,
      openedAt: opened ? new Date().toISOString() : null,
      repliedAt: replied ? new Date().toISOString() : null,
      openCount: opened ? 1 : 0,
      replyCount: replied ? 1 : 0,
      bouncedReason: delivered ? null : 'Simulated: recipient not found',
    })

    // Update agent counters
    const agentUpdate: Record<string, unknown> = {
      totalEmailsSent: (agent.totalEmailsSent || 0) + 1,
    }

    if (needsReset) {
      agentUpdate.dailySent = 1
      agentUpdate.dailyResetAt = new Date().toISOString()
    } else {
      agentUpdate.dailySent = (agent.dailySent || 0) + 1
    }

    if (replied) {
      agentUpdate.totalResponses = (agent.totalResponses || 0) + 1
    }

    // Update avg response rate
    const totalSent = (agent.totalEmailsSent || 0) + 1
    const totalResp = (agent.totalResponses || 0) + (replied ? 1 : 0)
    agentUpdate.avgResponseRate = totalResp / totalSent

    await memoryStore.updateAgent(id, agentUpdate)

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
