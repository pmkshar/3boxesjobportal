import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// POST /api/agents/[id]/run - Trigger agent to run (simulate)
export async function POST(
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

    if (agent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Agent is not active. Current status: ' + agent.status },
        { status: 400 }
      )
    }

    // Check daily limit
    const now = new Date()
    const resetDate = new Date(agent.dailyResetAt)
    const needsReset = now.getDate() !== resetDate.getDate() ||
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()

    const dailySent = needsReset ? 0 : agent.dailySent
    const remaining = agent.dailyLimit - dailySent

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Daily limit reached. No more actions can be taken today.' },
        { status: 429 }
      )
    }

    const result = await memoryStore.runAgent(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    // Simulate run summary with task creation
    const actionsToTake = Math.min(remaining, Math.floor(Math.random() * 10) + 3)

    const runSummary: Record<string, unknown> = {
      agentId: id,
      agentName: agent.name,
      agentType: agent.type,
      runTime: new Date().toISOString(),
      tasksCreated: 0,
      emailsSent: 0,
      companiesScraped: 0,
      jobsFound: 0,
      details: [] as Array<Record<string, unknown>>,
    }

    if (agent.type === 'CANDIDATE_BUDDY') {
      // Create simulated application tasks
      const taskCount = Math.min(actionsToTake, 5)
      for (let i = 0; i < taskCount; i++) {
        const jobTitles = ['Senior Software Engineer', 'Full-Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager']
        const companies = ['TechCorp Solutions', 'InnoVate Labs', 'DigiSmart Technologies', 'CloudPeak Systems', 'NexGen Innovations']
        const title = jobTitles[Math.floor(Math.random() * jobTitles.length)]
        const company = companies[Math.floor(Math.random() * companies.length)]
        const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '')

        await memoryStore.createAgentTask(id, {
          type: 'apply_job',
          targetName: title,
          targetCompany: company,
          targetUrl: `https://${domain}.com/jobs/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          targetData: JSON.stringify({ location: 'Remote', type: 'full-time', skills: 'React, TypeScript, Node.js' }),
          priority: Math.floor(Math.random() * 5) + 5,
          status: 'PENDING',
          requiresApproval: false,
        })

        runSummary.tasksCreated = (runSummary.tasksCreated as number) + 1
        runSummary.jobsFound = (runSummary.jobsFound as number) + 1
        ;(runSummary.details as Array<Record<string, unknown>>).push({
          type: 'apply_job',
          target: `${title} at ${company}`,
          location: 'Remote',
        })
      }
    } else {
      // ADMIN_OUTREACH_* types: create scrape tasks and email tasks
      const companyCount = Math.ceil(actionsToTake / 2)
      const emailCount = actionsToTake - companyCount

      // Create scrape tasks
      for (let i = 0; i < companyCount; i++) {
        const companyPrefixes = ['TechCorp', 'InnoVate', 'DigiSmart', 'CloudPeak', 'NexGen', 'QuantumLeap', 'SwiftCode', 'ByteForge']
        const suffixes = ['Solutions', 'Labs', 'Technologies', 'Systems', 'Innovations']
        const name = `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
        const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '')
        const industries = ['Information Technology', 'FinTech', 'HealthTech', 'E-Commerce', 'SaaS', 'AI/ML']

        await memoryStore.createAgentTask(id, {
          type: 'scrape_company',
          targetCompany: name,
          targetUrl: `https://${domain}.com/careers`,
          targetData: JSON.stringify({
            industry: industries[Math.floor(Math.random() * industries.length)],
            size: '51-200',
            location: 'Bangalore, India',
            contactEmail: `info@${domain}.com`,
            hrEmail: `hr@${domain}.com`,
          }),
          priority: Math.floor(Math.random() * 3) + 7,
          status: 'COMPLETED',
          result: JSON.stringify({ scraped: true, contactsFound: 2 }),
        })

        runSummary.companiesScraped = (runSummary.companiesScraped as number) + 1
        ;(runSummary.details as Array<Record<string, unknown>>).push({
          type: 'scrape_company',
          company: name,
        })
      }

      // Create email tasks
      const emailSubjectTemplates: Record<string, string[]> = {
        ADMIN_OUTREACH_COMPANY: [
          'Partnership Opportunity with 3 Boxes',
          'Discover Top Tech Talent - Free Platform Access',
          'Scale Your Hiring with AI-Powered Recruitment',
        ],
        ADMIN_OUTREACH_CANDIDATE: [
          'Your Dream Job is Waiting - Join 3 Boxes',
          'AI-Powered Job Matching Just Got Better',
          'Exclusive Job Opportunities for You',
        ],
        ADMIN_OUTREACH_HR: [
          'Transform Your Recruitment Process',
          'AI-Driven HR Solutions - Try Free',
          'Reduce Time-to-Hire by 60%',
        ],
      }

      const emailBodyTemplates: Record<string, string> = {
        ADMIN_OUTREACH_COMPANY: `<p>Hi {{name}},</p><p>I noticed your company is growing, and I wanted to introduce you to <strong>3 Boxes</strong> - India's leading AI-powered job portal.</p><p>Our platform uses advanced AI matching to connect you with pre-vetted, high-quality candidates, reducing your time-to-hire by up to 60%.</p><p>Would you be open to a quick demo this week?</p><p>Best regards,<br/>3 Boxes Team</p>`,
        ADMIN_OUTREACH_CANDIDATE: `<p>Hi {{name}},</p><p>I wanted to personally invite you to <strong>3 Boxes</strong> - where AI meets your career goals.</p><p>Our intelligent matching system has identified several roles that align perfectly with your skills and experience. Plus, you'll get access to:</p><ul><li>AI-powered job recommendations</li><li>Smart resume builder</li><li>Mock interview practice</li></ul><p>Ready to find your next opportunity?</p><p>Best regards,<br/>3 Boxes Team</p>`,
        ADMIN_OUTREACH_HR: `<p>Hi {{name}},</p><p>I'm reaching out because I believe <strong>3 Boxes</strong> can significantly streamline your recruitment workflow.</p><p>Our AI-driven platform offers:</p><ul><li>Automated candidate screening</li><li>Smart skill assessments</li><li>Interview scheduling automation</li><li>Real-time analytics dashboard</li></ul><p>Let's schedule a brief call to discuss how we can help.</p><p>Best regards,<br/>3 Boxes Team</p>`,
      }

      const subjects = emailSubjectTemplates[agent.type] || emailSubjectTemplates['ADMIN_OUTREACH_COMPANY']
      const bodyTemplate = emailBodyTemplates[agent.type] || emailBodyTemplates['ADMIN_OUTREACH_COMPANY']

      const companyPrefixes = ['TechCorp', 'InnoVate', 'DigiSmart', 'CloudPeak', 'NexGen', 'QuantumLeap', 'SwiftCode', 'ByteForge']
      const suffixes = ['Solutions', 'Labs', 'Technologies', 'Systems', 'Innovations']

      for (let i = 0; i < emailCount; i++) {
        const name = `${companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
        const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '')
        const hrEmail = `hr@${domain}.com`
        const subject = subjects[Math.floor(Math.random() * subjects.length)]
        const personalizedBody = bodyTemplate.replace('{{name}}', name.split(' ')[0])

        // Create email task
        await memoryStore.createAgentTask(id, {
          type: 'send_email',
          targetEmail: hrEmail,
          targetName: name,
          targetCompany: name,
          priority: Math.floor(Math.random() * 3) + 6,
          status: 'APPROVED',
          requiresApproval: false,
        })

        // Simulate email delivery metrics
        const delivered = Math.random() > 0.1
        const opened = delivered && Math.random() > 0.4
        const replied = opened && Math.random() > 0.65
        const emailStatus = replied ? 'REPLIED' : opened ? 'OPENED' : delivered ? 'DELIVERED' : 'BOUNCED'

        // Create the email record
        await memoryStore.createAgentEmail(id, {
          toEmail: hrEmail,
          toName: `HR Team at ${name}`,
          company: name,
          subject,
          body: personalizedBody,
          followUpSequence: 0,
          status: emailStatus,
          sentAt: new Date().toISOString(),
          deliveredAt: delivered ? new Date().toISOString() : null,
          openedAt: opened ? new Date().toISOString() : null,
          repliedAt: replied ? new Date().toISOString() : null,
          openCount: opened ? Math.floor(Math.random() * 3) + 1 : 0,
          replyCount: replied ? 1 : 0,
          bouncedReason: delivered ? null : 'Simulated: mailbox not found',
        })

        runSummary.emailsSent = (runSummary.emailsSent as number) + 1
        runSummary.tasksCreated = (runSummary.tasksCreated as number) + 1
        ;(runSummary.details as Array<Record<string, unknown>>).push({
          type: 'send_email',
          to: hrEmail,
          company: name,
          subject,
          status: emailStatus,
        })

        // Update agent totalResponses if replied
        if (replied) {
          const currentResponses = (agent.totalResponses || 0) + 1
          await memoryStore.updateAgent(id, { totalResponses: currentResponses })
        }
      }
    }

    // Update agent counters
    const totalNewTasks = runSummary.tasksCreated as number
    const totalNewEmails = runSummary.emailsSent as number
    const totalNewSuccess = (runSummary.companiesScraped as number) + (runSummary.emailsSent as number)

    const agentUpdate: Record<string, unknown> = {
      totalTasks: (agent.totalTasks || 0) + totalNewTasks,
      totalSuccess: (agent.totalSuccess || 0) + totalNewSuccess,
      totalEmailsSent: (agent.totalEmailsSent || 0) + totalNewEmails,
      lastRunAt: new Date().toISOString(),
    }

    if (needsReset) {
      agentUpdate.dailySent = totalNewEmails
      agentUpdate.dailyResetAt = new Date().toISOString()
    } else {
      agentUpdate.dailySent = (agent.dailySent || 0) + totalNewEmails
    }

    await memoryStore.updateAgent(id, agentUpdate)

    return NextResponse.json({
      message: `Agent ${agent.name} ran successfully`,
      runSummary,
    })
  } catch (error) {
    console.error('Agent run error:', error)
    return NextResponse.json({ error: 'Failed to run agent' }, { status: 500 })
  }
}
