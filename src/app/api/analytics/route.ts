import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    // Get various analytics data
    const [
      totalApplications,
      interviewsCompleted,
      trainingsCompleted,
      skillsCount,
      recentApplications,
      interviewSessions,
      skillAssessments,
      applicationByStatus,
      monthlyActivity,
    ] = await Promise.all([
      db.application.count({ where: { userId } }),
      db.interview.count({ where: { userId, status: 'completed' } }),
      db.trainingEnrollment.count({ where: { userId, status: 'completed' } }),
      db.skillAssessment.count({ where: { userId } }),
      db.application.findMany({
        where: { userId },
        orderBy: { appliedDate: 'desc' },
        take: 5,
        include: { job: { select: { title: true, corporate: { select: { companyName: true } } } } },
      }),
      db.aiInterviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, jobRole: true, overallScore: true, communicationScore: true, technicalScore: true, confidenceScore: true, completedAt: true, createdAt: true },
      }),
      db.skillAssessment.findMany({
        where: { userId },
        orderBy: { assessedAt: 'desc' },
        select: { skillName: true, level: true, source: true, assessedAt: true },
      }),
      db.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      db.analyticsEvent.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 30,
        select: { eventType: true, category: true, timestamp: true },
      }),
    ])

    // Calculate profile strength
    const profile = await db.jobSeekerProfile.findUnique({ where: { userId } })
    const resumeCount = await db.resume.count({ where: { userId } })

    let profileStrength = 20 // base
    if (profile?.headline) profileStrength += 10
    if (profile?.skills) profileStrength += 15
    if (profile?.currentRole) profileStrength += 10
    if (profile?.education) profileStrength += 10
    if (profile?.linkedInUrl) profileStrength += 5
    if (resumeCount > 0) profileStrength += 15
    if (skillsCount > 5) profileStrength += 15
    profileStrength = Math.min(100, profileStrength)

    // Average interview score
    const avgInterviewScore = interviewSessions.length > 0
      ? Math.round(interviewSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / interviewSessions.length)
      : 0

    // Skill distribution for chart
    const skillDistribution = skillAssessments.reduce((acc, s) => {
      acc[s.skillName] = s.level
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      summary: {
        totalApplications,
        interviewsCompleted,
        trainingsCompleted,
        skillsCount,
        profileStrength,
        avgInterviewScore,
        resumeCount,
      },
      recentApplications,
      interviewSessions,
      skillAssessments,
      applicationByStatus: applicationByStatus.map(a => ({ status: a.status, count: a._count.status })),
      skillDistribution,
      monthlyActivity: monthlyActivity.reduce((acc, event) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
