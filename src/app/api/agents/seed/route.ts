import { NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// POST /api/agents/seed - Explicitly seed default AI agents (for Vercel where auto-seed may fail)
export async function POST() {
  try {
    // Check if agents already exist
    const existing = await memoryStore.getAgents()

    if (existing.length > 0) {
      return NextResponse.json({
        message: 'Agents already seeded',
        count: existing.length,
        agents: existing.map((a: any) => ({ id: a.id, name: a.name, type: a.type, status: a.status })),
      })
    }

    // Force re-initialize memory store by importing it fresh
    // The memory store auto-seeds on import, so if we get here with 0 agents,
    // something went wrong. Let's create agents manually.
    const now = new Date()
    const companies = ['TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'Google India', 'Microsoft India', 'Amazon India', 'Flipkart', 'Razorpay']

    // Create 3 default agents via the API
    const agentDefs = [
      {
        name: 'Company Outreach Agent',
        type: 'ADMIN_OUTREACH_COMPANY',
        description: 'Automatically reaches out to companies for partnership opportunities, job postings, and recruitment collaborations.',
        dailyLimit: 50,
        status: 'ACTIVE',
        strategy: JSON.stringify({
          targetIndustry: 'Technology',
          emailTemplate: 'Company Introduction',
          followUpInterval: '3_days',
          maxFollowUps: '3',
          linkedInSearch: 'true',
        }),
      },
      {
        name: 'Candidate Outreach Agent',
        type: 'ADMIN_OUTREACH_CANDIDATE',
        description: 'Engages potential candidates with personalized job recommendations, platform benefits, and career opportunities.',
        dailyLimit: 100,
        status: 'ACTIVE',
        strategy: JSON.stringify({
          targetSkills: 'React, Node.js, Python, AWS, Data Science',
          emailTemplate: 'Candidate Introduction',
          followUpInterval: '5_days',
          maxFollowUps: '2',
          jobRecommendations: 'true',
        }),
      },
      {
        name: 'HR Outreach Agent',
        type: 'ADMIN_OUTREACH_HR',
        description: 'Connects with HR professionals and recruitment teams to promote the platform and establish hiring partnerships.',
        dailyLimit: 75,
        status: 'ACTIVE',
        strategy: JSON.stringify({
          targetIndustry: 'All Industries',
          emailTemplate: 'HR Introduction',
          followUpInterval: '4_days',
          maxFollowUps: '4',
          linkedInSearch: 'true',
        }),
      },
    ]

    const createdAgents = []
    for (const def of agentDefs) {
      const agent = await memoryStore.createAgent({
        ...def,
        createdBy: 'demo-admin-001',
        totalTasks: Math.floor(Math.random() * 20) + 10,
        totalSuccess: Math.floor(Math.random() * 15) + 5,
        totalFailed: Math.floor(Math.random() * 3),
        totalEmailsSent: Math.floor(Math.random() * 50) + 20,
        totalResponses: Math.floor(Math.random() * 15) + 5,
        totalConversions: Math.floor(Math.random() * 8) + 2,
        avgResponseRate: 0.15 + Math.random() * 0.2,
        dailySent: Math.floor(Math.random() * 10),
        lastRunAt: new Date(now.getTime() - 1800000).toISOString(),
        dailyResetAt: now.toISOString(),
      })
      createdAgents.push(agent)

      // Create sample tasks for this agent
      for (let i = 0; i < 5; i++) {
        const taskTypes = ['scrape_company', 'send_email', 'follow_up', 'search_jobs']
        const taskStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'APPROVED']
        await memoryStore.createAgentTask(agent.id, {
          type: taskTypes[i % taskTypes.length],
          status: taskStatuses[i % taskStatuses.length],
          priority: Math.floor(Math.random() * 3) + 1,
          targetEmail: `hr@${companies[i].toLowerCase().replace(/\s/g, '')}.com`,
          targetName: 'HR Manager',
          targetCompany: companies[i],
          targetUrl: `https://${companies[i].toLowerCase().replace(/\s/g, '')}.com/careers`,
          scheduledAt: new Date(now.getTime() - (i + 1) * 3600000).toISOString(),
          result: 'Completed successfully',
          requiresApproval: i % 3 === 0,
          approvedBy: i % 3 === 0 ? 'demo-admin-001' : null,
        })
      }

      // Create sample emails for this agent
      const emailStatuses = ['SENT', 'DELIVERED', 'OPENED', 'REPLIED']
      for (let i = 0; i < 4; i++) {
        const status = emailStatuses[i]
        await memoryStore.createAgentEmail(agent.id, {
          taskId: null,
          toEmail: `contact@${companies[i].toLowerCase().replace(/\s/g, '')}.com`,
          toName: `${companies[i]} HR Team`,
          company: companies[i],
          subject: `Partnership Opportunity - 3 Boxes Jobs x ${companies[i]}`,
          body: `<p>Dear ${companies[i]} HR Team,</p><p>I hope this email finds you well. I'm reaching out from 3 Boxes Jobs, India's fastest-growing AI-powered recruitment platform.</p><p>We'd love to explore how we can help ${companies[i]} streamline your hiring process.</p><p>Best regards,<br/>3 Boxes Jobs Team</p>`,
          status,
          sentAt: new Date(now.getTime() - (i + 1) * 7200000).toISOString(),
          deliveredAt: ['DELIVERED', 'OPENED', 'REPLIED'].includes(status) ? new Date(now.getTime() - i * 7200000).toISOString() : null,
          openedAt: ['OPENED', 'REPLIED'].includes(status) ? new Date(now.getTime() - i * 3600000).toISOString() : null,
          repliedAt: status === 'REPLIED' ? new Date(now.getTime() - i * 1800000).toISOString() : null,
          openCount: ['OPENED', 'REPLIED'].includes(status) ? Math.floor(Math.random() * 3) + 1 : 0,
          replyCount: status === 'REPLIED' ? 1 : 0,
          followUpSequence: i,
        })
      }
    }

    // Create default email templates
    const templates = await memoryStore.getEmailTemplates()
    if (templates.length === 0) {
      await memoryStore.createEmailTemplate({
        name: 'Company Introduction',
        agentType: 'ADMIN_OUTREACH_COMPANY',
        subject: "3 Boxes Jobs - India's AI-Powered Recruitment Platform | Partnership Opportunity",
        body: `Dear {{recipientName}},\n\nI hope this email finds you well. I'm reaching out from 3 Boxes Jobs, India's fastest-growing AI-powered recruitment platform that connects top talent with leading companies like {{companyName}}.\n\nI'd love to explore how 3 Boxes Jobs can streamline your hiring process at {{companyName}}.\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
        category: 'introduction',
        isActive: true,
      })
      await memoryStore.createEmailTemplate({
        name: 'Company Follow-up',
        agentType: 'ADMIN_OUTREACH_COMPANY',
        subject: 'Following up - 3 Boxes Jobs Partnership',
        body: `Dear {{recipientName}},\n\nI wanted to follow up on my previous email about partnering with 3 Boxes Jobs for your hiring needs at {{companyName}}.\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
        category: 'follow_up',
        isActive: true,
      })
      await memoryStore.createEmailTemplate({
        name: 'Candidate Introduction',
        agentType: 'ADMIN_OUTREACH_CANDIDATE',
        subject: 'Your Dream Job is Waiting | 3 Boxes Jobs',
        body: `Hi {{recipientName}},\n\nI noticed your impressive background and wanted to introduce you to 3 Boxes Jobs.\n\nSign up now: {{portalUrl}}\n\nBest regards,\nThe 3 Boxes Jobs Team`,
        category: 'introduction',
        isActive: true,
      })
      await memoryStore.createEmailTemplate({
        name: 'HR Introduction',
        agentType: 'ADMIN_OUTREACH_HR',
        subject: 'Transform Your Hiring with 3 Boxes Jobs | Special Invitation for HR Leaders',
        body: `Dear {{recipientName}},\n\nAs an HR leader, you know the challenges of finding the right talent quickly. 3 Boxes Jobs is designed specifically to address these challenges.\n\nBest regards,\nThe 3 Boxes Jobs Team\n{{portalUrl}}`,
        category: 'introduction',
        isActive: true,
      })
    }

    return NextResponse.json({
      message: 'Default agents seeded successfully',
      count: createdAgents.length,
      agents: createdAgents.map((a: any) => ({ id: a.id, name: a.name, type: a.type, status: a.status })),
    }, { status: 201 })
  } catch (error) {
    console.error('Agent seed error:', error)
    return NextResponse.json({ error: 'Failed to seed agents', details: String(error) }, { status: 500 })
  }
}
