import { NextRequest, NextResponse } from 'next/server'

/**
 * Production Seed Endpoint — Full Live Data Pipeline
 *
 * Seeds the Neon PostgreSQL production database with real companies, jobs, and training courses
 * from the live-data-dataset.json. Uses Vercel token for authentication.
 *
 * Authentication:
 *   - Bearer token in Authorization header: `Bearer <VERCEL_TOKEN>`
 *   - Or `vercelToken` in request body
 *   - The token must match the VERCEL_TOKEN env variable (set in Vercel Dashboard)
 *
 * Usage:
 *   POST https://3boxesjobs.com/api/seed-production
 *   Headers: Authorization: Bearer <VERCEL_TOKEN>
 *
 * Modes:
 *   - { mode: "full" }  — Seeds everything from scratch (admin + companies + jobs + courses + seekers)
 *   - { mode: "refresh" } — Refreshes jobs only (adds new jobs, skips existing)
 *   - { mode: "incremental" } — Adds missing data without touching existing records
 *   - Default: "full"
 */

export async function POST(request: NextRequest) {
  const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')
  if (!isProduction) {
    return NextResponse.json(
      { error: 'This endpoint is only for production (Neon PostgreSQL) environments.' },
      { status: 403 }
    )
  }

  // ─── Authenticate (Vercel Token OR Admin JWT) ────────────────────
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing Authorization header. Provide Bearer token.' },
      { status: 401 }
    )
  }

  const providedToken = authHeader.slice(7)
  let isAuthenticated = false
  let authMethod = 'none'

  // Method 1: Check if it's the VERCEL_TOKEN
  const vercelToken = process.env.VERCEL_TOKEN
  if (vercelToken && providedToken === vercelToken) {
    isAuthenticated = true
    authMethod = 'vercel-token'
  }

  // Method 2: Verify JWT and check admin role
  if (!isAuthenticated) {
    try {
      const { verifyToken } = await import('@/lib/auth')
      const payload = await verifyToken(providedToken)
      if (payload && (payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN')) {
        isAuthenticated = true
        authMethod = 'admin-jwt'
      }
    } catch { /* not a valid JWT */ }
  }

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Invalid token. Provide VERCEL_TOKEN or a valid admin JWT with SUPER_ADMIN/ADMIN role.' },
      { status: 401 }
    )
  }

  try {
    const { db } = await import('@/lib/db')
    const { hashPassword } = await import('@/lib/auth')
    const crypto = await import('crypto')

    // Determine mode
    let mode = 'full'
    try {
      const body = await request.clone().json()
      mode = body.mode || 'full'
    } catch { /* use default */ }

    const startTime = Date.now()
    const results: Record<string, any> = { mode, steps: [] }

    // ─── Load Live Dataset ─────────────────────────────────────────
    let dataset: any = { companies: [], jobs: [], trainingCourses: [] }
    try {
      const fs = await import('fs')
      const path = await import('path')
      const datasetPath = path.join(process.cwd(), 'scripts', 'live-data-dataset.json')
      if (fs.existsSync(datasetPath)) {
        dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
      }
    } catch (e: any) {
      results.steps.push({ step: 'load-dataset', status: 'warning', message: 'Could not load live-data-dataset.json, using built-in data' })
    }

    const companies: any[] = dataset.companies || []
    const jobs: any[] = dataset.jobs || []
    const courses: any[] = dataset.trainingCourses || []

    // ─── STEP 1: Ensure Core Role Users ───────────────────────────
    if (mode === 'full' || mode === 'incremental') {
      const demoPassword = await hashPassword('demo123')
      const requiredUsers = [
        { email: 'superadmin@3boxesjobs.com', name: '3 Boxes Super Admin', role: 'SUPER_ADMIN', phone: '+91-9000000001', location: 'India', bio: 'Super administrator with full platform access.' },
        { email: 'admin@3boxesjobs.com', name: '3 Boxes Admin', role: 'ADMIN', phone: '+91-9000000000', location: 'India', bio: 'Platform administrator.' },
        { email: 'seeker@3boxesjobs.com', name: 'Rahul Sharma', role: 'JOB_SEEKER', phone: '+91-9876543210', location: 'Mumbai, India', bio: 'Experienced developer seeking new opportunities.' },
        { email: 'hr@3boxesjobs.com', name: '3 Boxes Technologies', role: 'CORPORATE', phone: '+91-8000000000', location: 'India', bio: 'AI-powered recruitment platform.' },
        { email: 'recruiter@3boxesjobs.com', name: 'Amit Patel', role: 'RECRUITER', phone: '+91-9988776655', location: 'Delhi, India', bio: 'Senior IT recruiter.' },
        { email: 'hrmanager@3boxesjobs.com', name: 'Sneha Reddy', role: 'HR_MANAGER', phone: '+91-9222222222', location: 'Hyderabad, India', bio: 'HR manager managing recruitment pipeline.' },
        { email: 'interviewer@3boxesjobs.com', name: 'Vikram Singh', role: 'INTERVIEWER', phone: '+91-9333333333', location: 'Delhi, India', bio: 'Technical interviewer specializing in coding interviews.' },
      ]

      const createdUsers: { email: string; role: string; isNew: boolean }[] = []
      let seekerUser: any = null
      let corporateUser: any = null

      for (const reqUser of requiredUsers) {
        const existing = await db.user.findUnique({ where: { email: reqUser.email } })
        if (!existing) {
          const createData: any = {
            email: reqUser.email,
            name: reqUser.name,
            password: demoPassword,
            role: reqUser.role,
            phone: reqUser.phone,
            location: reqUser.location,
            bio: reqUser.bio,
            emailVerified: true,
          }

          if (reqUser.role === 'JOB_SEEKER') {
            createData.jobSeekerProfile = {
              create: {
                headline: 'Senior Full-Stack Developer',
                experienceYears: 5,
                currentRole: 'Full-Stack Developer',
                currentCompany: 'Tech Solutions India',
                education: 'B.Tech Computer Science',
                expectedSalary: '15-25 LPA',
                jobType: 'full-time',
                availability: 'immediate',
                skills: 'React, Node.js, TypeScript, AWS, Docker, PostgreSQL',
                aiSkillScore: 78,
                profileComplete: 85,
              },
            }
          } else if (reqUser.role === 'CORPORATE') {
            createData.corporateProfile = {
              create: {
                companyName: '3 Boxes Technologies',
                industry: 'Information Technology & Recruitment',
                companySize: '51-200',
                website: 'https://3boxesjobs.com',
                description: "India's first AI-powered job portal with smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching.",
                location: 'India',
                foundedYear: 2024,
                isVerified: true,
              },
            }
          } else if (reqUser.role === 'RECRUITER') {
            createData.recruiterProfile = {
              create: {
                specialization: 'IT',
                yearsExperience: 8,
                certifications: 'SHRM-CP, PHR',
                placementCount: 150,
                rating: 4.5,
              },
            }
          }

          const newUser = await db.user.create({ data: createData })
          createdUsers.push({ email: reqUser.email, role: reqUser.role, isNew: true })
          if (reqUser.role === 'JOB_SEEKER') seekerUser = newUser
          if (reqUser.role === 'CORPORATE') corporateUser = newUser
        } else {
          createdUsers.push({ email: reqUser.email, role: reqUser.role, isNew: false })
          if (reqUser.role === 'JOB_SEEKER') seekerUser = existing
          if (reqUser.role === 'CORPORATE') corporateUser = existing
        }
      }

      const newCount = createdUsers.filter(u => u.isNew).length
      results.steps.push({
        step: 'core-users',
        status: 'success',
        created: newCount,
        total: createdUsers.length,
        message: newCount > 0 ? `Created ${newCount} new users` : 'All core users already exist',
      })
    }

    // ─── STEP 2: Seed Real Companies from Dataset ─────────────────
    if (mode === 'full' || mode === 'incremental') {
      const corpPassword = await hashPassword('demo123')
      let companiesCreated = 0
      let companiesSkipped = 0
      const companyUserMap: Record<string, string> = {}

      for (const company of companies) {
        const existingCorp = await db.corporateProfile.findFirst({
          where: { companyName: company.name },
        })
        if (existingCorp) {
          companyUserMap[company.name] = existingCorp.id
          companiesSkipped++
          continue
        }

        const emailDomain = company.website
          ?.replace('https://', '')
          ?.replace('http://', '')
          ?.replace('www.', '')
          ?.split('/')[0] || 'example.com'
        const corpEmail = `careers@${emailDomain}`

        try {
          const corpUser = await db.user.create({
            data: {
              email: corpEmail,
              name: `${company.name} HR`,
              password: corpPassword,
              role: 'CORPORATE',
              location: company.location,
              bio: `Official ${company.name} careers account on 3 Boxes Jobs.`,
              emailVerified: true,
              corporateProfile: {
                create: {
                  companyName: company.name,
                  industry: company.industry,
                  companySize: company.size,
                  website: company.website,
                  description: `Leading ${company.industry} company. Visit ${company.careers} for more opportunities.`,
                  location: company.location,
                  foundedYear: company.founded,
                  isVerified: true,
                },
              },
            },
          })

          const corpProfile = await db.corporateProfile.findFirst({
            where: { userId: corpUser.id },
          })
          if (corpProfile) {
            companyUserMap[company.name] = corpProfile.id
            companiesCreated++
          }
        } catch (e: any) {
          if (e.code === 'P2002') {
            companiesSkipped++
          }
        }
      }

      // Store company map for job seeding
      results._companyUserMap = companyUserMap
      results.steps.push({
        step: 'companies',
        status: 'success',
        created: companiesCreated,
        skipped: companiesSkipped,
        total: companies.length,
      })
    }

    // ─── STEP 3: Seed Real Job Listings ───────────────────────────
    if (mode === 'full' || mode === 'refresh' || mode === 'incremental') {
      const corpPassword = await hashPassword('demo123')
      const companyUserMap: Record<string, string> = results._companyUserMap || {}

      // Build company map if not already built
      if (Object.keys(companyUserMap).length === 0) {
        const allCorps = await db.corporateProfile.findMany()
        for (const corp of allCorps) {
          companyUserMap[corp.companyName] = corp.id
        }
      }

      let jobsCreated = 0
      let jobsSkipped = 0
      let jobsUpdated = 0

      for (const job of jobs) {
        let corpId = companyUserMap[job.company]

        // Create company on the fly if missing
        if (!corpId) {
          const existingCorp = await db.corporateProfile.findFirst({
            where: { companyName: job.company },
          })
          if (existingCorp) {
            corpId = existingCorp.id
            companyUserMap[job.company] = existingCorp.id
          } else if (job.website && job.industry) {
            const emailDomain = job.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
            try {
              const corpUser = await db.user.create({
                data: {
                  email: `careers@${emailDomain}`,
                  name: `${job.company} HR`,
                  password: corpPassword,
                  role: 'CORPORATE',
                  location: job.location,
                  emailVerified: true,
                  corporateProfile: {
                    create: {
                      companyName: job.company,
                      industry: job.industry,
                      companySize: job.size || '1000+',
                      website: job.website,
                      location: job.location,
                      foundedYear: job.founded || 2000,
                      isVerified: true,
                    },
                  },
                },
              })
              const newProfile = await db.corporateProfile.findFirst({ where: { userId: corpUser.id } })
              if (newProfile) {
                corpId = newProfile.id
                companyUserMap[job.company] = newProfile.id
              }
            } catch { /* skip */ }
          }

          // Fallback to 3 Boxes Technologies
          if (!corpId) {
            const platformCorpProfile = await db.corporateProfile.findFirst({
              where: { companyName: '3 Boxes Technologies' },
            })
            if (platformCorpProfile) {
              corpId = platformCorpProfile.id
            }
          }
        }

        if (!corpId) {
          jobsSkipped++
          continue
        }

        // For refresh mode: update existing job's status to ACTIVE and closingDate
        const existingJob = await db.job.findFirst({
          where: { title: job.title, corporateId: corpId },
        })

        if (existingJob) {
          if (mode === 'refresh') {
            // Refresh: re-activate and extend closing date
            await db.job.update({
              where: { id: existingJob.id },
              data: {
                status: 'ACTIVE',
                closingDate: new Date(Date.now() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000),
                aiMatchScore: true,
              },
            })
            jobsUpdated++
          } else {
            jobsSkipped++
          }
          continue
        }

        try {
          await db.job.create({
            data: {
              corporateId: corpId,
              title: job.title,
              description: job.desc,
              requirements: job.req,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              salaryCurrency: 'INR',
              jobType: job.jobType,
              experienceMin: job.expMin,
              experienceMax: job.expMax,
              location: job.location,
              isRemote: job.remote,
              skills: job.skills,
              benefits: 'Health Insurance, Provident Fund, Gratuity, Performance Bonus, Flexible Work Hours, Learning & Development Budget',
              openings: Math.floor(Math.random() * 5) + 1,
              status: 'ACTIVE',
              aiMatchScore: true,
              postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              closingDate: new Date(Date.now() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000),
            },
          })
          jobsCreated++
        } catch {
          jobsSkipped++
        }
      }

      results.steps.push({
        step: 'jobs',
        status: 'success',
        created: jobsCreated,
        updated: jobsUpdated,
        skipped: jobsSkipped,
        total: jobs.length,
      })
    }

    // ─── STEP 4: Seed Training Courses ────────────────────────────
    if (mode === 'full' || mode === 'incremental') {
      let coursesCreated = 0
      let coursesSkipped = 0

      for (const course of courses) {
        const existingCourse = await db.trainingCourse.findFirst({
          where: { title: course.title },
        })
        if (existingCourse) {
          coursesSkipped++
          continue
        }

        try {
          await db.trainingCourse.create({
            data: {
              title: course.title,
              description: course.desc,
              category: course.category,
              level: course.level,
              duration: course.duration,
              skills: course.skills,
              instructor: course.instructor,
              rating: 4.0 + Math.random() * 0.9,
              enrollCount: Math.floor(Math.random() * 5000) + 500,
              isActive: true,
            },
          })
          coursesCreated++
        } catch {
          coursesSkipped++
        }
      }

      results.steps.push({
        step: 'courses',
        status: 'success',
        created: coursesCreated,
        skipped: coursesSkipped,
        total: courses.length,
      })
    }

    // ─── STEP 5: Seed Demo Job Seeker Accounts ───────────────────
    if (mode === 'full') {
      const seekerPassword = await hashPassword('demo123')
      const jobSeekers = [
        { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', skills: 'React, Node.js, TypeScript, AWS', headline: 'Full Stack Developer', exp: 4 },
        { name: 'Priya Patel', email: 'priya.patel@example.com', skills: 'Python, Data Science, ML, SQL', headline: 'Data Scientist', exp: 3 },
        { name: 'Amit Kumar', email: 'amit.kumar@example.com', skills: 'Java, Spring Boot, Microservices, Kafka', headline: 'Senior Java Developer', exp: 6 },
        { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', skills: 'Digital Marketing, SEO, Analytics, Content Strategy', headline: 'Marketing Manager', exp: 5 },
        { name: 'Vikram Singh', email: 'vikram.singh@example.com', skills: 'Cloud Architecture, AWS, Terraform, Kubernetes', headline: 'Cloud Architect', exp: 8 },
      ]

      let seekersCreated = 0
      for (const seeker of jobSeekers) {
        const existing = await db.user.findUnique({ where: { email: seeker.email } })
        if (existing) continue

        try {
          await db.user.create({
            data: {
              email: seeker.email,
              name: seeker.name,
              password: seekerPassword,
              role: 'JOB_SEEKER',
              location: 'India',
              emailVerified: true,
              jobSeekerProfile: {
                create: {
                  headline: seeker.headline,
                  experienceYears: seeker.exp,
                  skills: seeker.skills,
                  jobType: 'full-time',
                  availability: 'immediate',
                  profileComplete: 75 + Math.random() * 20,
                },
              },
            },
          })
          seekersCreated++
        } catch { /* skip */ }
      }

      results.steps.push({
        step: 'job-seekers',
        status: 'success',
        created: seekersCreated,
        total: jobSeekers.length,
      })
    }

    // ─── Final Stats ──────────────────────────────────────────────
    const [totalUsers, totalJobs, totalCourses, totalCorps, activeJobs] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.trainingCourse.count(),
      db.corporateProfile.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
    ])

    const duration = Date.now() - startTime
    delete results._companyUserMap // Remove internal data

    return NextResponse.json({
      success: true,
      message: `Production database seeded successfully in ${mode} mode (${(duration / 1000).toFixed(1)}s)`,
      mode,
      results,
      stats: {
        users: totalUsers,
        companies: totalCorps,
        jobs: totalJobs,
        activeJobs,
        trainingCourses: totalCourses,
      },
      credentials: {
        superadmin: { email: 'superadmin@3boxesjobs.com', password: 'demo123' },
        admin: { email: 'admin@3boxesjobs.com', password: 'demo123' },
        seeker: { email: 'seeker@3boxesjobs.com', password: 'demo123' },
        corporate: { email: 'hr@3boxesjobs.com', password: 'demo123' },
        recruiter: { email: 'recruiter@3boxesjobs.com', password: 'demo123' },
        hr_manager: { email: 'hrmanager@3boxesjobs.com', password: 'demo123' },
        interviewer: { email: 'interviewer@3boxesjobs.com', password: 'demo123' },
      },
      completedAt: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(1)}s`,
    })
  } catch (error) {
    console.error('Production seed error:', error)
    return NextResponse.json(
      { error: 'Production seed failed.', details: String(error) },
      { status: 500 }
    )
  }
}

// GET /api/seed-production — Check current production database stats
export async function GET() {
  const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')
  if (!isProduction) {
    return NextResponse.json({
      environment: 'demo',
      database: 'SQLite',
      message: 'Demo environment. Seed endpoint only works with Neon PostgreSQL.',
    })
  }

  try {
    const { db } = await import('@/lib/db')
    const [users, jobs, activeJobs, courses, corps] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
      db.trainingCourse.count(),
      db.corporateProfile.count(),
    ])

    return NextResponse.json({
      environment: 'production',
      database: 'Neon PostgreSQL',
      stats: { users, companies: corps, jobs, activeJobs, trainingCourses: courses },
      lastChecked: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check stats' }, { status: 500 })
  }
}
