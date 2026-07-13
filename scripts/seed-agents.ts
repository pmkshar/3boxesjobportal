import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding AI agents...')

  // Check if agents already exist
  const existingAgents = await prisma.aIAgent.findMany()
  if (existingAgents.length > 0) {
    console.log(`✅ ${existingAgents.length} agents already exist, skipping seed.`)
    return
  }

  // Create default agents
  const agents = [
    {
      name: 'Company Outreach Agent',
      type: 'ADMIN_OUTREACH_COMPANY',
      description: 'Automatically scrapes company websites for careers pages and contact emails, then sends introduction emails about our portal. Follows up until the company onboards.',
      status: 'ACTIVE',
      dailyLimit: 50,
      dailySent: 0,
      totalTasks: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalEmailsSent: 0,
      totalResponses: 0,
      totalConversions: 0,
      avgResponseRate: 0,
      strategy: JSON.stringify({
        targetIndustry: 'Technology, Finance, Healthcare',
        emailTemplate: 'company_introduction',
        followUpInterval: '3_days',
        maxFollowUps: '5',
        searchKeywords: 'careers, jobs, hiring, contact us',
      }),
      createdBy: 'system',
      dailyResetAt: new Date(),
    },
    {
      name: 'Candidate Outreach Agent',
      type: 'ADMIN_OUTREACH_CANDIDATE',
      description: 'Sends personalized emails to job seekers encouraging them to onboard our portal. Includes job recommendations based on their profile.',
      status: 'ACTIVE',
      dailyLimit: 50,
      dailySent: 0,
      totalTasks: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalEmailsSent: 0,
      totalResponses: 0,
      totalConversions: 0,
      avgResponseRate: 0,
      strategy: JSON.stringify({
        emailTemplate: 'candidate_introduction',
        followUpInterval: '5_days',
        maxFollowUps: '3',
        includeJobRecommendations: 'true',
      }),
      createdBy: 'system',
      dailyResetAt: new Date(),
    },
    {
      name: 'HR Outreach Agent',
      type: 'ADMIN_OUTREACH_HR',
      description: 'Targets HR heads, HR managers, and HR executives to onboard them to our portal. Sends personalized introduction emails and follows up.',
      status: 'ACTIVE',
      dailyLimit: 50,
      dailySent: 0,
      totalTasks: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalEmailsSent: 0,
      totalResponses: 0,
      totalConversions: 0,
      avgResponseRate: 0,
      strategy: JSON.stringify({
        targetRoles: 'HR Head, HR Manager, HR Executive, Talent Acquisition Lead',
        emailTemplate: 'hr_introduction',
        followUpInterval: '4_days',
        maxFollowUps: '4',
        linkedInSearch: 'true',
      }),
      createdBy: 'system',
      dailyResetAt: new Date(),
    },
  ]

  for (const agent of agents) {
    const created = await prisma.aIAgent.create({ data: agent })
    console.log(`✅ Created agent: ${created.name} (${created.type})`)
  }

  // Create default email templates
  const templates = [
    {
      name: 'Company Introduction',
      agentType: 'ADMIN_OUTREACH_COMPANY',
      subject: '3 Boxes Jobs - India\'s AI-Powered Recruitment Platform | Partnership Opportunity',
      body: `Dear {{recipientName}},

I hope this email finds you well. I'm reaching out from 3 Boxes Jobs, India's fastest-growing AI-powered recruitment platform that connects top talent with leading companies like {{companyName}}.

What makes us different:
• AI-powered candidate matching with 95%+ accuracy
• Pre-screened candidates with verified skills
• 70% faster hiring process compared to traditional methods
• Access to 50,000+ active job seekers across India

I'd love to explore how 3 Boxes Jobs can streamline your hiring process at {{companyName}}. Would you be available for a brief 15-minute call this week?

Looking forward to connecting!

Best regards,
The 3 Boxes Jobs Team
{{portalUrl}}`,
      category: 'introduction',
      isActive: true,
    },
    {
      name: 'Company Follow-up',
      agentType: 'ADMIN_OUTREACH_COMPANY',
      subject: 'Following up - 3 Boxes Jobs Partnership',
      body: `Dear {{recipientName}},

I wanted to follow up on my previous email about partnering with 3 Boxes Jobs for your hiring needs at {{companyName}}.

We've recently helped companies like yours reduce their time-to-hire by 60% and improve candidate quality by 40%.

Would you be interested in a quick demo? I can show you how our AI matching works in just 10 minutes.

Best regards,
The 3 Boxes Jobs Team
{{portalUrl}}`,
      category: 'follow_up',
      isActive: true,
    },
    {
      name: 'Candidate Introduction',
      agentType: 'ADMIN_OUTREACH_CANDIDATE',
      subject: 'Your Dream Job is Waiting | 3 Boxes Jobs',
      body: `Hi {{recipientName}},

I noticed your impressive background and wanted to introduce you to 3 Boxes Jobs - India's AI-powered job portal that matches you with the perfect opportunities.

Why join 3 Boxes Jobs?
• AI-powered job matching based on your skills & experience
• Free resume builder with ATS optimization
• Interview preparation with AI mock interviews
• Access to 10,000+ jobs from top companies
• Real-time application tracking

Registration is completely free! Join thousands of professionals who've already found their dream roles through our platform.

Sign up now: {{portalUrl}}

Best regards,
The 3 Boxes Jobs Team`,
      category: 'introduction',
      isActive: true,
    },
    {
      name: 'HR Introduction',
      agentType: 'ADMIN_OUTREACH_HR',
      subject: 'Transform Your Hiring with 3 Boxes Jobs | Special Invitation for HR Leaders',
      body: `Dear {{recipientName}},

As an HR leader, you know the challenges of finding the right talent quickly. 3 Boxes Jobs is India's AI-powered recruitment platform designed specifically to address these challenges.

Why HR leaders choose 3 Boxes Jobs:
• AI-powered screening reduces unqualified applications by 80%
• Automated interview scheduling saves 15+ hours per week
• Skills-based matching ensures cultural fit
• Employer branding tools to attract top talent
• Analytics dashboard for data-driven hiring decisions

I'd love to invite you to explore our platform and see how it can benefit your organization. We offer a free 30-day trial for new companies.

Would you be interested in a personalized demo?

Best regards,
The 3 Boxes Jobs Team
{{portalUrl}}`,
      category: 'introduction',
      isActive: true,
    },
  ]

  for (const template of templates) {
    const created = await prisma.aIEmailTemplate.create({ data: template })
    console.log(`✅ Created template: ${created.name}`)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
