import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ─── Database Setup ────────────────────────────────────────────
// Demo (SQLite file) : DATABASE_URL=file:./db/custom.db  (ephemeral on Vercel, auto-seeds)
// Production (Turso) : DATABASE_URL=libsql://...turso.io  (persistent cloud DB)
//
// When TURSO_AUTH_TOKEN is set, we use the Turso adapter for persistent cloud storage.
// Otherwise, we fall back to regular SQLite (for local dev and demo environment).

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  // If Turso auth token is provided → use Turso (production/persistent)
  if (tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  }

  // Otherwise → regular SQLite (demo/local, ephemeral on Vercel)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Auto-seed mechanism: ensures demo data exists on Vercel (ephemeral filesystem)
// Only seeds in DEMO mode (SQLite, no Turso token). Production (Turso) is seeded manually.
let seedPromise: Promise<void> | null = null

export async function ensureSeedData() {
  if (seedPromise) return seedPromise

  // Skip auto-seeding in production (Turso) — production data is managed manually
  const isProduction = process.env.TURSO_AUTH_TOKEN && process.env.DATABASE_URL?.startsWith('libsql://')
  if (isProduction) {
    seedPromise = Promise.resolve()
    return seedPromise
  }

  seedPromise = (async () => {
    try {
      // Check if any users exist
      const userCount = await db.user.count()
      if (userCount > 0) return

      // No users — seed the database
      const { hashPassword } = await import('./auth')
      const demoPassword = hashPassword('demo123')

      // Create demo users with profiles
      const jobSeeker = await db.user.create({
        data: {
          email: 'seeker@3boxes.com',
          name: 'Rahul Sharma',
          password: demoPassword,
          role: 'JOB_SEEKER',
          phone: '+91-9876543210',
          location: 'Mumbai, India',
          bio: 'Passionate software developer with 5 years of experience in full-stack development.',
          jobSeekerProfile: {
            create: {
              headline: 'Senior Full-Stack Developer | React & Node.js Expert',
              experienceYears: 5,
              currentRole: 'Software Engineer',
              currentCompany: 'TechCorp India',
              education: 'B.Tech Computer Science - IIT Mumbai',
              expectedSalary: '15-20 LPA',
              jobType: 'full-time',
              availability: '1-month',
              skills: 'React, Node.js, TypeScript, Python, AWS, Docker, MongoDB, PostgreSQL, GraphQL, CI/CD, Git, Agile',
              linkedInUrl: 'https://linkedin.com/in/rahulsharma',
              githubUrl: 'https://github.com/rahulsharma',
              aiSkillScore: 78,
              profileComplete: 85,
            },
          },
        },
      })

      const corporate = await db.user.create({
        data: {
          email: 'corp@3boxes.com',
          name: 'Priya Technologies',
          password: demoPassword,
          role: 'CORPORATE',
          phone: '+91-22-12345678',
          location: 'Bangalore, India',
          corporateProfile: {
            create: {
              companyName: 'Priya Technologies Pvt Ltd',
              industry: 'Information Technology',
              companySize: '201-500',
              website: 'https://priyatech.com',
              description: 'Leading IT solutions provider specializing in cloud computing, AI/ML solutions, and enterprise software development.',
              location: 'Bangalore, India',
              foundedYear: 2015,
              isVerified: true,
            },
          },
        },
      })

      const recruiter = await db.user.create({
        data: {
          email: 'recruiter@3boxes.com',
          name: 'Amit Patel',
          password: demoPassword,
          role: 'RECRUITER',
          phone: '+91-9988776655',
          location: 'Delhi, India',
          recruiterProfile: {
            create: {
              specialization: 'IT & Software',
              yearsExperience: 8,
              certifications: 'SHRM-CP, AIRS CIR',
              placementCount: 150,
              rating: 4.8,
            },
          },
        },
      })

      await db.user.create({
        data: {
          email: 'admin@3boxes.com',
          name: '3 Boxes Admin',
          password: demoPassword,
          role: 'ADMIN',
          phone: '+91-9000000000',
          location: 'Chennai, India',
        },
      })

      // Create demo jobs
      const corpProfile = await db.corporateProfile.findUnique({ where: { userId: corporate.id } })
      if (corpProfile) {
        await db.job.createMany({
          data: [
            {
              corporateId: corpProfile.id,
              title: 'Senior React Developer',
              description: 'We are looking for an experienced React developer to join our frontend team. You will be responsible for building and maintaining high-quality web applications using React, TypeScript, and modern tooling. Work closely with designers, backend engineers, and product managers to deliver exceptional user experiences.',
              requirements: '5+ years React experience, TypeScript, REST APIs, GraphQL, Testing (Jest/Cypress), CI/CD',
              responsibilities: 'Build reusable UI components, implement state management, optimize performance, mentor junior developers, participate in code reviews',
              salaryMin: 1200000,
              salaryMax: 2000000,
              jobType: 'full-time',
              experienceMin: 5,
              experienceMax: 8,
              location: 'Bangalore, India',
              isRemote: true,
              skills: 'React, TypeScript, GraphQL, Redux, Jest, Cypress, Node.js, AWS',
              benefits: 'Health insurance, Stock options, Flexible hours, Remote work, Learning budget',
              openings: 3,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'Data Scientist - AI/ML',
              description: 'Join our AI team to develop cutting-edge machine learning models and data pipelines. You will work with large datasets, build predictive models, and deploy ML solutions at scale.',
              requirements: 'Masters/PhD in CS/Statistics, Python, TensorFlow/PyTorch, SQL, Spark, ML model deployment',
              responsibilities: 'Design ML pipelines, develop predictive models, collaborate with engineering, present findings to stakeholders',
              salaryMin: 1500000,
              salaryMax: 2500000,
              jobType: 'full-time',
              experienceMin: 3,
              experienceMax: 6,
              location: 'Hyderabad, India',
              isRemote: false,
              skills: 'Python, TensorFlow, PyTorch, SQL, Spark, Statistics, Deep Learning, NLP',
              benefits: 'Health insurance, Conference budget, Stock options, Research time',
              openings: 2,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'DevOps Engineer',
              description: 'We need a skilled DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. You will work with AWS/GCP services, containerization, and infrastructure as code.',
              requirements: 'AWS/GCP, Docker, Kubernetes, Terraform, Jenkins/GitHub Actions, Linux, Networking',
              responsibilities: 'Manage cloud infrastructure, automate deployments, monitor system health, implement security best practices',
              salaryMin: 1000000,
              salaryMax: 1800000,
              jobType: 'full-time',
              experienceMin: 3,
              experienceMax: 7,
              location: 'Pune, India',
              isRemote: true,
              skills: 'AWS, Docker, Kubernetes, Terraform, CI/CD, Linux, Python, Monitoring',
              benefits: 'Health insurance, Cloud certification budget, Flexible hours, Remote work',
              openings: 2,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'Product Manager - SaaS',
              description: 'Lead the product strategy and roadmap for our B2B SaaS platform. Work with engineering, design, and sales teams to deliver features that drive customer value and business growth.',
              requirements: '5+ years PM experience in SaaS, Agile/Scrum, Analytics, Roadmap planning, User research',
              responsibilities: 'Define product roadmap, prioritize features, conduct user research, track KPIs, coordinate cross-functional teams',
              salaryMin: 1800000,
              salaryMax: 3000000,
              jobType: 'full-time',
              experienceMin: 5,
              experienceMax: 10,
              location: 'Mumbai, India',
              isRemote: false,
              skills: 'Product Strategy, Agile, Analytics, User Research, SaaS, Roadmapping, A/B Testing',
              benefits: 'Health insurance, Stock options, Travel budget, Learning budget',
              openings: 1,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'UI/UX Designer',
              description: 'Create beautiful and intuitive user interfaces for our suite of products. You will lead the design process from research and wireframing to high-fidelity mockups and prototyping.',
              requirements: '3+ years UI/UX experience, Figma/Sketch, Design systems, User research, Prototyping, HTML/CSS',
              responsibilities: 'Conduct user research, create wireframes and prototypes, maintain design system, present designs to stakeholders',
              salaryMin: 800000,
              salaryMax: 1500000,
              jobType: 'full-time',
              experienceMin: 3,
              experienceMax: 6,
              location: 'Chennai, India',
              isRemote: true,
              skills: 'Figma, Sketch, Design Systems, User Research, Prototyping, HTML/CSS, Adobe Creative Suite',
              benefits: 'Design tool subscriptions, Conference budget, Flexible hours, Creative time',
              openings: 2,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'Backend Engineer - Node.js',
              description: 'Build robust and scalable backend services using Node.js, Express, and PostgreSQL. Design APIs, implement business logic, and ensure high availability for our growing platform.',
              requirements: '4+ years Node.js, Express, PostgreSQL/MySQL, REST API design, Redis, Microservices',
              responsibilities: 'Design and build REST APIs, optimize database queries, implement caching strategies, ensure system reliability',
              salaryMin: 1000000,
              salaryMax: 1800000,
              jobType: 'full-time',
              experienceMin: 4,
              experienceMax: 7,
              location: 'Bangalore, India',
              isRemote: true,
              skills: 'Node.js, Express, PostgreSQL, Redis, Microservices, Docker, CI/CD, TypeScript',
              benefits: 'Health insurance, Stock options, Remote work, Learning budget',
              openings: 2,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'Mobile Developer - React Native',
              description: 'Develop cross-platform mobile applications using React Native. Work on features used by millions of users, optimize performance, and deliver pixel-perfect UI on both iOS and Android.',
              requirements: '3+ years React Native, JavaScript/TypeScript, iOS & Android deployment, Redux/MobX',
              responsibilities: 'Build mobile features, ensure cross-platform compatibility, optimize app performance, release to app stores',
              salaryMin: 900000,
              salaryMax: 1600000,
              jobType: 'full-time',
              experienceMin: 3,
              experienceMax: 6,
              location: 'Hyderabad, India',
              isRemote: true,
              skills: 'React Native, TypeScript, Redux, iOS, Android, Firebase, App Store Deployment',
              benefits: 'Health insurance, Device budget, Remote work, Flexible hours',
              openings: 1,
              status: 'ACTIVE',
            },
            {
              corporateId: corpProfile.id,
              title: 'Cybersecurity Analyst',
              description: 'Protect our digital assets and infrastructure from cyber threats. Implement security policies, conduct vulnerability assessments, and respond to security incidents. Must stay current with evolving threat landscape.',
              requirements: '3+ years in cybersecurity, CISSP/CEH, SIEM tools, Incident response, Network security',
              responsibilities: 'Monitor security alerts, conduct penetration testing, implement security policies, respond to incidents, train staff',
              salaryMin: 1100000,
              salaryMax: 1900000,
              jobType: 'full-time',
              experienceMin: 3,
              experienceMax: 6,
              location: 'Pune, India',
              isRemote: false,
              skills: 'CISSP, CEH, SIEM, Penetration Testing, Network Security, Incident Response, Compliance',
              benefits: 'Health insurance, Certification budget, Flexible hours, Training budget',
              openings: 1,
              status: 'ACTIVE',
            },
          ],
        })
      }

      // Create training courses
      const courses = [
        { id: 'react-advanced-patterns-performance', title: 'React Advanced Patterns & Performance', description: 'Master advanced React patterns including hooks, context, render optimization, and state management with Redux Toolkit. Build production-ready applications with best practices.', category: 'Programming', level: 'advanced', duration: 24, skills: 'React, TypeScript, Redux Toolkit, Performance Optimization, Testing', instructor: 'Dr. Sarah Chen', rating: 4.9, enrollCount: 2500 },
        { id: 'machine-learning-python', title: 'Machine Learning with Python', description: 'Comprehensive course on machine learning fundamentals and advanced techniques. Covers supervised/unsupervised learning, deep learning, and model deployment using Python and TensorFlow.', category: 'Data Science', level: 'intermediate', duration: 40, skills: 'Python, TensorFlow, Scikit-learn, Pandas, NumPy, Deep Learning, NLP', instructor: 'Prof. Raj Kumar', rating: 4.8, enrollCount: 3200 },
        { id: 'aws-cloud-solutions-architect', title: 'AWS Cloud Practitioner to Solutions Architect', description: 'Complete AWS certification prep from Cloud Practitioner to Solutions Architect. Hands-on labs with real AWS services.', category: 'Cloud Computing', level: 'intermediate', duration: 36, skills: 'AWS, EC2, S3, Lambda, CloudFormation, IAM, VPC, RDS', instructor: 'Kevin Johnson', rating: 4.7, enrollCount: 1800 },
        { id: 'system-design-senior-engineers', title: 'System Design for Senior Engineers', description: 'Learn how to design scalable distributed systems. Covers load balancing, caching, database sharding, message queues, and microservices architecture.', category: 'Programming', level: 'advanced', duration: 20, skills: 'System Design, Distributed Systems, Scalability, Load Balancing, Caching, Microservices', instructor: 'Alex Rivera', rating: 4.9, enrollCount: 2100 },
        { id: 'fullstack-nodejs-development', title: 'Full-Stack Node.js Development', description: 'Build complete web applications with Node.js, Express, and MongoDB. Learn REST API design, authentication, real-time features with Socket.io.', category: 'Programming', level: 'intermediate', duration: 30, skills: 'Node.js, Express, MongoDB, REST API, Socket.io, JWT, Deployment', instructor: 'Meera Iyer', rating: 4.6, enrollCount: 1500 },
        { id: 'digital-marketing-masterclass', title: 'Digital Marketing Masterclass', description: 'Comprehensive digital marketing course covering SEO, SEM, social media marketing, content marketing, email marketing, and analytics.', category: 'Marketing', level: 'beginner', duration: 18, skills: 'SEO, SEM, Social Media Marketing, Google Analytics, Content Marketing, Email Marketing', instructor: 'Lisa Wong', rating: 4.5, enrollCount: 1200 },
        { id: 'docker-kubernetes-production', title: 'Docker & Kubernetes in Production', description: 'Master containerization and orchestration for production environments. Learn Docker best practices, Kubernetes deployment strategies, Helm charts, and monitoring.', category: 'Cloud Computing', level: 'intermediate', duration: 28, skills: 'Docker, Kubernetes, Helm, Prometheus, Grafana, CI/CD, Container Security', instructor: 'Tom Anderson', rating: 4.8, enrollCount: 1900 },
        { id: 'product-management-fundamentals', title: 'Product Management Fundamentals', description: 'Learn the essentials of product management - from market research and user interviews to roadmap planning and go-to-market strategy.', category: 'Product', level: 'beginner', duration: 15, skills: 'Product Strategy, User Research, Roadmapping, A/B Testing, Analytics, Agile', instructor: 'Jennifer Park', rating: 4.7, enrollCount: 980 },
      ]
      for (const course of courses) {
        await db.trainingCourse.upsert({
          where: { id: course.id },
          update: {},
          create: course,
        })
      }

      // Create skill assessments for job seeker
      const skills = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'MongoDB', 'GraphQL', 'CI/CD', 'Git']
      for (const skill of skills) {
        await db.skillAssessment.create({
          data: {
            userId: jobSeeker.id,
            skillName: skill,
            level: 50 + Math.random() * 40,
            source: Math.random() > 0.5 ? 'training' : 'self',
          },
        })
      }

      // Create notifications
      const notifs = [
        { userId: jobSeeker.id, title: 'Welcome to 3 Boxes Jobs!', message: 'Complete your profile to increase your visibility to recruiters by up to 80%.', type: 'info' },
        { userId: jobSeeker.id, title: 'New Job Match Found', message: 'We found 5 new jobs matching your skills. Check them out in your dashboard!', type: 'success', link: '/dashboard/jobs' },
        { userId: jobSeeker.id, title: 'AI Skill Assessment Available', message: 'Take an AI-powered skill assessment to validate your React expertise and boost your profile score.', type: 'info' },
      ]
      for (const notif of notifs) {
        await db.notification.create({ data: notif })
      }

      console.log('✅ Auto-seed completed: demo data created')

      // ─── Seed AI Agents & Email Templates ───────────────────────────
      const agentCount = await db.aIAgent.count()
      if (agentCount === 0) {
        const adminUser = await db.user.findFirst({ where: { role: 'ADMIN' } })
        const adminId = adminUser?.id || 'system'

        // Create default AI agents
        const agents = [
          {
            name: 'Company Outreach Agent',
            type: 'ADMIN_OUTREACH_COMPANY',
            description: 'Automatically scrapes company websites for careers pages and contact emails, then sends introduction emails about our portal. Follows up until the company onboards.',
            status: 'ACTIVE',
            dailyLimit: 50,
            dailySent: 0,
            totalTasks: 12,
            totalSuccess: 5,
            totalFailed: 2,
            totalEmailsSent: 35,
            totalResponses: 8,
            totalConversions: 3,
            avgResponseRate: 0.23,
            strategy: JSON.stringify({
              targetIndustry: 'Technology, Finance, Healthcare',
              emailTemplate: 'company_introduction',
              followUpInterval: '3_days',
              maxFollowUps: '5',
              searchKeywords: 'careers, jobs, hiring, contact us',
            }),
            createdBy: adminId,
            dailyResetAt: new Date(),
          },
          {
            name: 'Candidate Outreach Agent',
            type: 'ADMIN_OUTREACH_CANDIDATE',
            description: 'Sends personalized emails to job seekers encouraging them to onboard our portal. Includes job recommendations based on their profile.',
            status: 'ACTIVE',
            dailyLimit: 50,
            dailySent: 0,
            totalTasks: 8,
            totalSuccess: 4,
            totalFailed: 1,
            totalEmailsSent: 28,
            totalResponses: 6,
            totalConversions: 4,
            avgResponseRate: 0.21,
            strategy: JSON.stringify({
              emailTemplate: 'candidate_introduction',
              followUpInterval: '5_days',
              maxFollowUps: '3',
              includeJobRecommendations: 'true',
            }),
            createdBy: adminId,
            dailyResetAt: new Date(),
          },
          {
            name: 'HR Outreach Agent',
            type: 'ADMIN_OUTREACH_HR',
            description: 'Targets HR heads, HR managers, and HR executives to onboard them to our portal. Sends personalized introduction emails and follows up.',
            status: 'ACTIVE',
            dailyLimit: 50,
            dailySent: 0,
            totalTasks: 15,
            totalSuccess: 6,
            totalFailed: 3,
            totalEmailsSent: 42,
            totalResponses: 10,
            totalConversions: 5,
            avgResponseRate: 0.24,
            strategy: JSON.stringify({
              targetRoles: 'HR Head, HR Manager, HR Executive, Talent Acquisition Lead',
              emailTemplate: 'hr_introduction',
              followUpInterval: '4_days',
              maxFollowUps: '4',
              linkedInSearch: 'true',
            }),
            createdBy: adminId,
            dailyResetAt: new Date(),
          },
        ]

        for (const agent of agents) {
          await db.aIAgent.create({ data: agent })
        }

        // Create default email templates
        const templates = [
          {
            name: 'Company Introduction',
            agentType: 'ADMIN_OUTREACH_COMPANY',
            subject: "3 Boxes Jobs - India's AI-Powered Recruitment Platform | Partnership Opportunity",
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
          await db.aIEmailTemplate.create({ data: template })
        }

        // Create some sample daily stats for the agents
        const createdAgents = await db.aIAgent.findMany()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (const agent of createdAgents) {
          // Create stats for the last 7 days
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            await db.aIAgentDailyStat.create({
              data: {
                agentId: agent.id,
                date,
                tasksCreated: Math.floor(Math.random() * 5) + 1,
                tasksCompleted: Math.floor(Math.random() * 4),
                tasksFailed: Math.floor(Math.random() * 2),
                emailsSent: Math.floor(Math.random() * 15) + 5,
                emailsDelivered: Math.floor(Math.random() * 13) + 4,
                emailsOpened: Math.floor(Math.random() * 8) + 2,
                emailsReplied: Math.floor(Math.random() * 4),
                emailsBounced: Math.floor(Math.random() * 2),
                companiesScraped: agent.type === 'ADMIN_OUTREACH_COMPANY' ? Math.floor(Math.random() * 8) + 2 : 0,
                contactsFound: Math.floor(Math.random() * 6) + 1,
                jobsApplied: 0,
                interviewsScheduled: Math.floor(Math.random() * 2),
                onboardingsStarted: Math.floor(Math.random() * 2),
                onboardingsCompleted: Math.floor(Math.random()),
                deliveryRate: 0.85 + Math.random() * 0.12,
                openRate: 0.25 + Math.random() * 0.2,
                replyRate: 0.1 + Math.random() * 0.15,
                bounceRate: Math.random() * 0.08,
                conversionRate: 0.05 + Math.random() * 0.1,
              },
            })
          }
        }

        console.log('✅ AI Agents & templates seeded successfully')
      }
    } catch (error) {
      console.error('Auto-seed error:', error)
      // Reset promise so it can be retried
      seedPromise = null
    }
  })()

  return seedPromise
}
