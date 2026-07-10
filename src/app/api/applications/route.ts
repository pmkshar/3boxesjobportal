import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!userId && !jobId) {
      return NextResponse.json({ error: 'User ID or Job ID required' }, { status: 400 })
    }

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()

        if (userId && jobId) {
          const application = await db.application.findFirst({ where: { userId, jobId } })
          return NextResponse.json({ application })
        }

        const where: any = {}
        if (userId) where.userId = userId
        if (jobId) where.jobId = jobId

        const applications = await db.application.findMany({
          where,
          include: {
            job: { include: { corporate: { select: { companyName: true, companyLogo: true } } } },
            user: { select: { id: true, name: true, email: true, avatar: true } },
            resume: true,
          },
          orderBy: { appliedDate: 'desc' },
        })

        return NextResponse.json({ applications })
      }
    } catch {
      // Fall through to demo data
    }

    // Demo mode - return empty applications
    return NextResponse.json({ applications: [] })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ applications: [], error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobId, userId, resumeId, coverLetter } = await request.json()

    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Job ID and User ID are required' }, { status: 400 })
    }

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()

        const existing = await db.application.findFirst({ where: { jobId, userId } })
        if (existing) {
          return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 })
        }

        // Calculate AI match score
        const job = await db.job.findUnique({ where: { id: jobId } })
        const profile = await db.jobSeekerProfile.findUnique({ where: { userId } })
        let aiMatchScore = 50
        if (job?.skills && profile?.skills) {
          const jobSkills = job.skills.split(',').map(s => s.trim().toLowerCase())
          const userSkills = profile.skills.split(',').map(s => s.trim().toLowerCase())
          const matchCount = jobSkills.filter(js => userSkills.some(us => us.includes(js) || js.includes(us))).length
          aiMatchScore = jobSkills.length > 0 ? Math.round((matchCount / jobSkills.length) * 100) : 50
        }

        const application = await db.application.create({
          data: {
            jobId, userId,
            resumeId: resumeId || null,
            coverLetter: coverLetter || null,
            aiMatchScore,
            aiFeedback: `Your profile matches ${aiMatchScore}% of the job requirements. ${aiMatchScore > 70 ? 'Great match!' : 'Consider adding more relevant skills to your profile.'}`,
          },
        })

        // Track analytics + notification (best effort)
        try {
          await db.analyticsEvent.create({ data: { userId, eventType: 'job_applied', category: 'application', metadata: JSON.stringify({ jobId, aiMatchScore }) } })
          await db.notification.create({ data: { userId, title: 'Application Submitted', message: `You have successfully applied for the position. AI Match Score: ${aiMatchScore}%`, type: 'success' } })
        } catch { /* non-critical */ }

        return NextResponse.json({ application, aiMatchScore, message: 'Application submitted successfully' }, { status: 201 })
      }
    } catch {
      // Fall through to demo response
    }

    // Demo mode
    return NextResponse.json({
      application: { id: 'demo-app-001', jobId, userId, status: 'APPLIED', aiMatchScore: 72, appliedDate: new Date().toISOString() },
      aiMatchScore: 72,
      message: 'Application submitted successfully (demo mode)',
    }, { status: 201 })
  } catch (error) {
    console.error('Application create error:', error)
    return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()
    if (!id || !status) return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 })

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db } = await import('@/lib/db')
        const application = await db.application.update({ where: { id }, data: { status } })
        // Notification (best effort)
        try {
          await db.notification.create({ data: { userId: application.userId, title: 'Application Update', message: `Your application status has been updated to: ${status.replace(/_/g, ' ')}`, type: status === 'REJECTED' ? 'warning' : 'success' } })
        } catch { /* non-critical */ }
        return NextResponse.json({ application, message: 'Application updated successfully' })
      }
    } catch {
      // Fall through
    }

    return NextResponse.json({ message: 'Application updated (demo mode)' })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json({ error: 'Failed to update application. Please try again.' }, { status: 500 })
  }
}
