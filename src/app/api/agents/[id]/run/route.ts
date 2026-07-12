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

// Helper: Generate realistic fake company data
function generateFakeCompanies(count: number): Array<{
  name: string
  email: string
  hrEmail: string
  careersUrl: string
  industry: string
  size: string
  location: string
}> {
  const companyPrefixes = [
    'TechCorp', 'InnoVate', 'DigiSmart', 'CloudPeak', 'NexGen',
    'QuantumLeap', 'SwiftCode', 'ByteForge', 'DataVault', 'CyberNest',
    'AlphaWave', 'BlueShift', 'CoreLogic', 'DevSphere', 'ElevateIT',
    'FutureSoft', 'GridPoint', 'HyperLink', 'IntelliSys', 'JupiterAI',
  ]
  const suffixes = [
    'Solutions', 'Labs', 'Technologies', 'Systems', 'Innovations',
    'Software', 'Digital', 'Analytics', 'Platform', 'Group',
  ]
  const industries = [
    'Information Technology', 'FinTech', 'HealthTech', 'EdTech',
    'E-Commerce', 'SaaS', 'AI/ML', 'Cybersecurity', 'Cloud Computing',
    'Data Analytics', 'IoT', 'Blockchain', 'DevOps', 'Mobile',
  ]
  const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  const locations = [
    'Bangalore, India', 'Mumbai, India', 'Hyderabad, India',
    'Pune, India', 'Chennai, India', 'Delhi, India',
    'San Francisco, USA', 'Austin, USA', 'London, UK',
    'Singapore', 'Berlin, Germany', 'Toronto, Canada',
  ]

  const companies = []
  for (let i = 0; i < count; i++) {
    const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const name = `${prefix} ${suffix}`
    const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    companies.push({
      name,
      email: `info@${domain}.com`,
      hrEmail: `hr@${domain}.com`,
      careersUrl: `https://${domain}.com/careers`,
      industry: industries[Math.floor(Math.random() * industries.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
    })
  }
  return companies
}

// Helper: Generate fake job listings
function generateFakeJobs(count: number): Array<{
  title: string
  company: string
  url: string
  location: string
  type: string
  skills: string
}> {
  const titles = [
    'Senior Software Engineer', 'Full-Stack Developer', 'Data Scientist',
    'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
    'Backend Engineer', 'ML Engineer', 'Cloud Architect',
    'Frontend Developer', 'Mobile Developer', 'QA Engineer',
    'Security Analyst', 'Technical Lead', 'Solutions Architect',
  ]
  const types = ['full-time', 'remote', 'hybrid', 'contract']
  const skillSets = [
    'React, TypeScript, Node.js',
    'Python, TensorFlow, SQL',
    'AWS, Docker, Kubernetes',
    'Java, Spring Boot, Microservices',
    'Go, gRPC, Distributed Systems',
    'Vue.js, GraphQL, PostgreSQL',
  ]
  const locations = [
    'Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Remote',
    'San Francisco', 'Austin', 'London', 'Singapore',
  ]

  const jobs = []
  for (let i = 0; i < count; i++) {
    const title = titles[Math.floor(Math.random() * titles.length)]
    const company = generateFakeCompanies(1)[0]
    jobs.push({
      title,
      company: company.name,
      url: `https://${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/jobs/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      type: types[Math.floor(Math.random() * types.length)],
      skills: skillSets[Math.floor(Math.random() * skillSets.length)],
    })
  }
  return jobs
}

// POST /api/agents/[id]/run - Trigger agent to run (simulate)
export async function POST(
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

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

    const actionsToTake = Math.min(remaining, Math.floor(Math.random() * 10) + 3) // 3-12 actions

    if (agent.type === 'CANDIDATE_BUDDY') {
      // Simulate searching jobs and creating application tasks
      const fakeJobs = generateFakeJobs(actionsToTake)

      for (const job of fakeJobs) {
        // Create a task for each job found
        const task = await prisma.aIAgentTask.create({
          data: {
            agentId: id,
            type: 'apply_job',
            targetName: job.title,
            targetCompany: job.company,
            targetUrl: job.url,
            targetData: JSON.stringify({
              location: job.location,
              type: job.type,
              skills: job.skills,
            }),
            priority: Math.floor(Math.random() * 5) + 5, // 5-9 priority
            status: 'PENDING',
            requiresApproval: false,
          },
        })

        runSummary.tasksCreated = (runSummary.tasksCreated as number) + 1
        runSummary.jobsFound = (runSummary.jobsFound as number) + 1
        ;(runSummary.details as Array<Record<string, unknown>>).push({
          taskId: task.id,
          type: 'apply_job',
          target: `${job.title} at ${job.company}`,
          location: job.location,
        })

        // Update daily stat for tasks created
        await prisma.aIAgentDailyStat.upsert({
          where: { agentId_date: { agentId: id, date: today } },
          create: {
            agentId: id,
            date: today,
            tasksCreated: 1,
            jobsApplied: 1,
          },
          update: {
            tasksCreated: { increment: 1 },
            jobsApplied: { increment: 1 },
          },
        })
      }
    } else {
      // ADMIN_OUTREACH_* types: simulate scraping companies and creating email tasks
      const fakeCompanies = generateFakeCompanies(Math.ceil(actionsToTake / 2))
      const emailsToSend = actionsToTake - fakeCompanies.length

      // Create scrape tasks for companies
      for (const company of fakeCompanies) {
        const scrapeTask = await prisma.aIAgentTask.create({
          data: {
            agentId: id,
            type: 'scrape_company',
            targetCompany: company.name,
            targetUrl: company.careersUrl,
            targetData: JSON.stringify({
              industry: company.industry,
              size: company.size,
              location: company.location,
              contactEmail: company.email,
              hrEmail: company.hrEmail,
            }),
            priority: Math.floor(Math.random() * 3) + 7, // 7-9 priority for scraping
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            result: JSON.stringify({ scraped: true, contactsFound: 2 }),
          },
        })

        runSummary.companiesScraped = (runSummary.companiesScraped as number) + 1
        ;(runSummary.details as Array<Record<string, unknown>>).push({
          taskId: scrapeTask.id,
          type: 'scrape_company',
          company: company.name,
          industry: company.industry,
          hrEmail: company.hrEmail,
        })

        // Also create a company scrape record
        await prisma.aICompanyScrape.create({
          data: {
            companyUrl: company.careersUrl,
            companyName: company.name,
            careersPageUrl: company.careersUrl,
            contactEmail: company.email,
            hrEmail: company.hrEmail,
            industry: company.industry,
            companySize: company.size,
            location: company.location,
            scrapeData: JSON.stringify(company),
            status: 'scraped',
            lastScrapedAt: new Date(),
          },
        })

        // Update daily stat
        await prisma.aIAgentDailyStat.upsert({
          where: { agentId_date: { agentId: id, date: today } },
          create: {
            agentId: id,
            date: today,
            tasksCreated: 1,
            tasksCompleted: 1,
            companiesScraped: 1,
            contactsFound: 2,
          },
          update: {
            tasksCreated: { increment: 1 },
            tasksCompleted: { increment: 1 },
            companiesScraped: { increment: 1 },
            contactsFound: { increment: 2 },
          },
        })
      }

      // Create email tasks and send emails
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

      for (let i = 0; i < emailsToSend && i < fakeCompanies.length; i++) {
        const company = fakeCompanies[i]
        const subject = subjects[Math.floor(Math.random() * subjects.length)]
        const personalizedBody = bodyTemplate.replace('{{name}}', company.name.split(' ')[0])

        // Create email task
        const emailTask = await prisma.aIAgentTask.create({
          data: {
            agentId: id,
            type: 'send_email',
            targetEmail: company.hrEmail,
            targetName: company.name,
            targetCompany: company.name,
            targetData: JSON.stringify({ industry: company.industry }),
            priority: Math.floor(Math.random() * 3) + 6,
            status: 'APPROVED',
            requiresApproval: false,
          },
        })

        // Send the actual email (simulated)
        const delivered = Math.random() > 0.1
        const opened = delivered && Math.random() > 0.4
        const replied = opened && Math.random() > 0.65

        const email = await prisma.aIAgentEmail.create({
          data: {
            agentId: id,
            taskId: emailTask.id,
            toEmail: company.hrEmail,
            toName: `HR Team at ${company.name}`,
            company: company.name,
            subject,
            body: personalizedBody,
            followUpSequence: 0,
            status: replied ? 'REPLIED' : opened ? 'OPENED' : delivered ? 'DELIVERED' : 'BOUNCED',
            sentAt: new Date(),
            deliveredAt: delivered ? new Date() : null,
            openedAt: opened ? new Date() : null,
            repliedAt: replied ? new Date() : null,
            openCount: opened ? Math.floor(Math.random() * 3) + 1 : 0,
            replyCount: replied ? 1 : 0,
            bouncedReason: delivered ? null : 'Simulated: mailbox not found',
          },
        })

        // Update task as completed
        await prisma.aIAgentTask.update({
          where: { id: emailTask.id },
          data: {
            status: 'COMPLETED',
            startedAt: new Date(),
            completedAt: new Date(),
            result: JSON.stringify({ emailId: email.id, status: email.status }),
          },
        })

        runSummary.emailsSent = (runSummary.emailsSent as number) + 1
        runSummary.tasksCreated = (runSummary.tasksCreated as number) + 1
        ;(runSummary.details as Array<Record<string, unknown>>).push({
          taskId: emailTask.id,
          emailId: email.id,
          type: 'send_email',
          to: company.hrEmail,
          company: company.name,
          subject,
          status: email.status,
        })

        // Update daily stats
        const statUpdate: Record<string, unknown> = {
          tasksCreated: { increment: 1 },
          tasksCompleted: { increment: 1 },
          emailsSent: { increment: 1 },
        }
        if (delivered) statUpdate.emailsDelivered = { increment: 1 }
        else statUpdate.emailsBounced = { increment: 1 }
        if (opened) statUpdate.emailsOpened = { increment: 1 }
        if (replied) statUpdate.emailsReplied = { increment: 1 }

        await prisma.aIAgentDailyStat.upsert({
          where: { agentId_date: { agentId: id, date: today } },
          create: {
            agentId: id,
            date: today,
            tasksCreated: 1,
            tasksCompleted: 1,
            emailsSent: 1,
            emailsDelivered: delivered ? 1 : 0,
            emailsBounced: delivered ? 0 : 1,
            emailsOpened: opened ? 1 : 0,
            emailsReplied: replied ? 1 : 0,
          },
          update: statUpdate,
        })

        // Update agent totalResponses if replied
        if (replied) {
          await prisma.aIAgent.update({
            where: { id },
            data: { totalResponses: { increment: 1 } },
          })
        }
      }
    }

    // Update agent counters
    const totalNewTasks = runSummary.tasksCreated as number
    const totalNewEmails = runSummary.emailsSent as number
    const totalNewSuccess = (runSummary.companiesScraped as number) + (runSummary.emailsSent as number)

    const agentUpdate: Record<string, unknown> = {
      totalTasks: { increment: totalNewTasks },
      totalSuccess: { increment: totalNewSuccess },
      totalEmailsSent: { increment: totalNewEmails },
      lastRunAt: new Date(),
    }

    if (needsReset) {
      agentUpdate.dailySent = totalNewEmails
      agentUpdate.dailyResetAt = new Date()
    } else {
      agentUpdate.dailySent = { increment: totalNewEmails }
    }

    await prisma.aIAgent.update({
      where: { id },
      data: agentUpdate,
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
    }

    // Update avg response rate on agent
    const updatedAgent = await prisma.aIAgent.findUnique({ where: { id } })
    if (updatedAgent && updatedAgent.totalEmailsSent > 0) {
      await prisma.aIAgent.update({
        where: { id },
        data: {
          avgResponseRate: updatedAgent.totalResponses / updatedAgent.totalEmailsSent,
        },
      })
    }

    return NextResponse.json({
      message: `Agent ${agent.name} ran successfully`,
      runSummary,
    })
  } catch (error) {
    console.error('Agent run error:', error)
    return NextResponse.json({ error: 'Failed to run agent' }, { status: 500 })
  }
}
