import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await ensureSeedData()
    const userId = request.nextUrl.searchParams.get('userId')
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!userId && !jobId) {
      return NextResponse.json({ error: 'User ID or Job ID required' }, { status: 400 })
    }

    if (userId && jobId) {
      const application = await db.application.findFirst({
        where: { userId, jobId },
      })
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
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeedData()
    const { jobId, userId, resumeId, coverLetter } = await request.json()

    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Job ID and User ID are required' }, { status: 400 })
    }

    const existing = await db.application.findFirst({
      where: { jobId, userId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 })
    }

    // Calculate AI match score
    const job = await db.job.findUnique({ where: { id: jobId } })
    const profile = await db.jobSeekerProfile.findUnique({ where: { userId } })
    let aiMatchScore = 50 // default
    if (job?.skills && profile?.skills) {
      const jobSkills = job.skills.split(',').map(s => s.trim().toLowerCase())
      const userSkills = profile.skills.split(',').map(s => s.trim().toLowerCase())
      const matchCount = jobSkills.filter(js => userSkills.some(us => us.includes(js) || js.includes(us))).length
      aiMatchScore = jobSkills.length > 0 ? Math.round((matchCount / jobSkills.length) * 100) : 50
    }

    const application = await db.application.create({
      data: {
        jobId,
        userId,
        resumeId: resumeId || null,
        coverLetter: coverLetter || null,
        aiMatchScore,
        aiFeedback: `Your profile matches ${aiMatchScore}% of the job requirements. ${aiMatchScore > 70 ? 'Great match!' : 'Consider adding more relevant skills to your profile.'}`,
      },
    })

    // Track analytics
    await db.analyticsEvent.create({
      data: { userId, eventType: 'job_applied', category: 'application', metadata: JSON.stringify({ jobId, aiMatchScore }) },
    })

    // Create notification
    await db.notification.create({
      data: {
        userId,
        title: 'Application Submitted',
        message: `You have successfully applied for the position. AI Match Score: ${aiMatchScore}%`,
        type: 'success',
      },
    })

    return NextResponse.json({ application, aiMatchScore, message: 'Application submitted successfully' }, { status: 201 })
  } catch (error) {
    console.error('Application create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 })
    }

    const application = await db.application.update({
      where: { id },
      data: { status },
    })

    // Create notification for applicant
    await db.notification.create({
      data: {
        userId: application.userId,
        title: 'Application Update',
        message: `Your application status has been updated to: ${status.replace(/_/g, ' ')}`,
        type: status === 'REJECTED' ? 'warning' : 'success',
      },
    })

    return NextResponse.json({ application, message: 'Application updated successfully' })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
