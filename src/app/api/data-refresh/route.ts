import { NextRequest, NextResponse } from 'next/server'

/**
 * Data Refresh Endpoint
 *
 * Provides a safe daily refresh mechanism for the super admin.
 * - Re-activates stale jobs, extends closing dates
 * - Adds any new jobs/companies from the live dataset
 * - Reports current data stats before and after refresh
 *
 * Authentication (two methods):
 *   1. Vercel Token: Authorization: Bearer <VERCEL_TOKEN>
 *   2. Admin JWT: Authorization: Bearer <JWT> — validated by checking user role is SUPER_ADMIN or ADMIN
 *
 * Usage:
 *   POST https://3boxesjobs.com/api/data-refresh
 *   Headers: Authorization: Bearer <token>
 */

export const dynamic = 'force-dynamic'

async function verifyAuth(request: NextRequest): Promise<{ authorized: boolean; method: string; error?: string }> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, method: 'none', error: 'Missing Authorization header' }
  }

  const token = authHeader.slice(7)

  // Method 1: Check if it's the VERCEL_TOKEN
  const vercelToken = process.env.VERCEL_TOKEN
  if (vercelToken && token === vercelToken) {
    return { authorized: true, method: 'vercel-token' }
  }

  // Method 2: Verify JWT and check admin role
  try {
    const { verifyToken } = await import('@/lib/auth')
    const payload = await verifyToken(token)
    if (payload && (payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN')) {
      return { authorized: true, method: 'admin-jwt' }
    }
    return { authorized: false, method: 'jwt', error: 'Insufficient permissions. SUPER_ADMIN or ADMIN role required.' }
  } catch {
    return { authorized: false, method: 'jwt', error: 'Invalid token.' }
  }
}

export async function POST(request: NextRequest) {
  const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')
  if (!isProduction) {
    return NextResponse.json(
      { error: 'Data refresh is only available in production (Neon PostgreSQL).' },
      { status: 403 }
    )
  }

  // ─── Authenticate ───────────────────────────────────────────────
  const auth = await verifyAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Authentication failed.' },
      { status: 401 }
    )
  }

  try {
    const { db } = await import('@/lib/db')
    const { hashPassword } = await import('@/lib/auth')

    const startTime = Date.now()

    // ─── Before stats ─────────────────────────────────────────────
    const [beforeUsers, beforeJobs, beforeActiveJobs, beforeCourses, beforeCorps] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
      db.trainingCourse.count(),
      db.corporateProfile.count(),
    ])

    // ─── Step 1: Re-activate stale ACTIVE jobs & extend closing dates ──
    const now = new Date()
    const expiredJobs = await db.job.findMany({
      where: {
        status: 'ACTIVE',
        closingDate: { lt: now },
      },
      select: { id: true },
    })

    let reactivatedCount = 0
    for (const job of expiredJobs) {
      await db.job.update({
        where: { id: job.id },
        data: {
          closingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // extend 60 days
        },
      })
      reactivatedCount++
    }

    // ─── Step 2: Load live dataset and add new data ───────────────
    let dataset: any = { companies: [], jobs: [], trainingCourses: [] }
    try {
      const fs = await import('fs')
      const path = await import('path')
      const datasetPath = path.join(process.cwd(), 'scripts', 'live-data-dataset.json')
      if (fs.existsSync(datasetPath)) {
        dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'))
      }
    } catch { /* no dataset */ }

    const companies: any[] = dataset.companies || []
    const jobs: any[] = dataset.jobs || []
    const courses: any[] = dataset.trainingCourses || []
    const corpPassword = hashPassword('demo123')

    // Build existing company map
    const allCorps = await db.corporateProfile.findMany()
    const companyMap: Record<string, string> = {}
    for (const corp of allCorps) {
      companyMap[corp.companyName] = corp.id
    }

    // Add missing companies
    let newCompanies = 0
    for (const company of companies) {
      if (companyMap[company.name]) continue

      const emailDomain = company.website
        ?.replace('https://', '')
        ?.replace('http://', '')
        ?.replace('www.', '')
        ?.split('/')[0] || 'example.com'

      try {
        const corpUser = await db.user.create({
          data: {
            email: `careers@${emailDomain}`,
            name: `${company.name} HR`,
            password: corpPassword,
            role: 'CORPORATE',
            location: company.location,
            emailVerified: true,
            corporateProfile: {
              create: {
                companyName: company.name,
                industry: company.industry,
                companySize: company.size,
                website: company.website,
                description: `Leading ${company.industry} company.`,
                location: company.location,
                foundedYear: company.founded,
                isVerified: true,
              },
            },
          },
        })
        const newProfile = await db.corporateProfile.findFirst({ where: { userId: corpUser.id } })
        if (newProfile) {
          companyMap[company.name] = newProfile.id
          newCompanies++
        }
      } catch { /* skip */ }
    }

    // Add missing jobs
    let newJobs = 0
    let skippedJobs = 0
    for (const job of jobs) {
      let corpId = companyMap[job.company]

      // Create company on the fly if needed
      if (!corpId && job.website && job.industry) {
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
            companyMap[job.company] = newProfile.id
          }
        } catch { /* skip */ }
      }

      // Fallback to 3 Boxes Technologies
      if (!corpId) {
        const platformCorp = await db.corporateProfile.findFirst({ where: { companyName: '3 Boxes Technologies' } })
        if (platformCorp) corpId = platformCorp.id
      }

      if (!corpId) { skippedJobs++; continue }

      // Check for duplicate
      const existing = await db.job.findFirst({ where: { title: job.title, corporateId: corpId } })
      if (existing) { skippedJobs++; continue }

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
        newJobs++
      } catch { skippedJobs++ }
    }

    // Add missing courses
    let newCourses = 0
    for (const course of courses) {
      const existing = await db.trainingCourse.findFirst({ where: { title: course.title } })
      if (existing) continue
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
        newCourses++
      } catch { /* skip */ }
    }

    // ─── After stats ──────────────────────────────────────────────
    const [afterUsers, afterJobs, afterActiveJobs, afterCourses, afterCorps] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
      db.trainingCourse.count(),
      db.corporateProfile.count(),
    ])

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: `Data refresh completed in ${(duration / 1000).toFixed(1)}s`,
      authMethod: auth.method,
      changes: {
        jobsReactivated: reactivatedCount,
        newCompanies,
        newJobs,
        newCourses,
        skippedJobs,
      },
      before: {
        users: beforeUsers,
        companies: beforeCorps,
        jobs: beforeJobs,
        activeJobs: beforeActiveJobs,
        trainingCourses: beforeCourses,
      },
      after: {
        users: afterUsers,
        companies: afterCorps,
        jobs: afterJobs,
        activeJobs: afterActiveJobs,
        trainingCourses: afterCourses,
      },
      completedAt: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(1)}s`,
    })
  } catch (error) {
    console.error('Data refresh error:', error)
    return NextResponse.json(
      { error: 'Data refresh failed.', details: String(error) },
      { status: 500 }
    )
  }
}

// GET /api/data-refresh — Get current refresh status and data stats
export async function GET() {
  const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')

  if (!isProduction) {
    return NextResponse.json({
      environment: 'demo',
      database: 'SQLite',
      canRefresh: false,
      message: 'Data refresh is only available in production (Neon PostgreSQL).',
    })
  }

  try {
    const { db } = await import('@/lib/db')
    const [users, jobs, activeJobs, closedJobs, courses, corps] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
      db.job.count({ where: { status: 'CLOSED' } }),
      db.trainingCourse.count(),
      db.corporateProfile.count(),
    ])

    // Check for jobs needing refresh (closingDate past but still ACTIVE)
    const staleActiveJobs = await db.job.count({
      where: {
        status: 'ACTIVE',
        closingDate: { lt: new Date() },
      },
    })

    return NextResponse.json({
      environment: 'production',
      database: 'Neon PostgreSQL',
      canRefresh: true,
      stats: {
        users,
        companies: corps,
        jobs,
        activeJobs,
        closedJobs,
        trainingCourses: courses,
      },
      health: {
        staleJobs: staleActiveJobs,
        needsRefresh: staleActiveJobs > 0,
      },
      lastChecked: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check stats' }, { status: 500 })
  }
}
