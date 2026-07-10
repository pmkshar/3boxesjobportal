import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category')
    const level = request.nextUrl.searchParams.get('level')
    const userId = request.nextUrl.searchParams.get('userId')

    const where: any = { isActive: true }
    if (category) where.category = category
    if (level) where.level = level

    const courses = await db.trainingCourse.findMany({
      where,
      include: {
        enrollments: userId ? {
          where: { userId },
          select: { id: true, progress: true, status: true, score: true },
        } : false,
      },
      orderBy: { enrollCount: 'desc' },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Training fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 })
    }

    const existing = await db.trainingEnrollment.findFirst({
      where: { userId, courseId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this course', enrollment: existing }, { status: 409 })
    }

    const enrollment = await db.trainingEnrollment.create({
      data: { userId, courseId, status: 'enrolled' },
    })

    // Update enroll count
    await db.trainingCourse.update({
      where: { id: courseId },
      data: { enrollCount: { increment: 1 } },
    })

    return NextResponse.json({ enrollment, message: 'Enrolled successfully' }, { status: 201 })
  } catch (error) {
    console.error('Training enrollment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { enrollmentId, progress, status, score, skillsAcquired } = await request.json()

    if (!enrollmentId) return NextResponse.json({ error: 'Enrollment ID required' }, { status: 400 })

    const updateData: any = {}
    if (progress !== undefined) updateData.progress = progress
    if (status) updateData.status = status
    if (score !== undefined) updateData.score = score
    if (skillsAcquired) updateData.skillsAcquired = typeof skillsAcquired === 'object' ? JSON.stringify(skillsAcquired) : skillsAcquired

    if (status === 'completed') {
      updateData.completedAt = new Date()
    }

    const enrollment = await db.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: updateData,
    })

    // If course completed, auto-update skills on resume and profile
    if (status === 'completed' && skillsAcquired) {
      const userId = enrollment.userId
      const newSkills = typeof skillsAcquired === 'string' ? JSON.parse(skillsAcquired) : skillsAcquired

      // Update job seeker profile skills
      const profile = await db.jobSeekerProfile.findUnique({ where: { userId } })
      if (profile) {
        const existingSkills = profile.skills ? profile.skills.split(',').map(s => s.trim()) : []
        const updatedSkills = [...new Set([...existingSkills, ...newSkills])].join(', ')
        await db.jobSeekerProfile.update({
          where: { userId },
          data: { skills: updatedSkills, aiSkillScore: { increment: 5 } },
        })
      }

      // Auto-update default resume with new skills
      const defaultResume = await db.resume.findFirst({
        where: { userId, isDefault: true },
      })
      if (defaultResume) {
        const existingResumeSkills = defaultResume.skills ? JSON.parse(defaultResume.skills) : []
        const updatedResumeSkills = [...existingResumeSkills, ...newSkills.map(s => ({ name: s, level: 'Intermediate', source: 'Training' }))]
        await db.resume.update({
          where: { id: defaultResume.id },
          data: {
            skills: JSON.stringify(updatedResumeSkills),
            lastAiUpdate: new Date(),
          },
        })
      }

      // Create skill assessments for each new skill
      for (const skill of newSkills) {
        await db.skillAssessment.create({
          data: {
            userId,
            skillName: skill,
            level: 60,
            source: 'training',
            evidence: JSON.stringify({ courseId: enrollment.courseId, score: enrollment.score }),
          },
        })
      }

      // Track analytics
      await db.analyticsEvent.create({
        data: {
          userId,
          eventType: 'training_completed',
          category: 'training',
          metadata: JSON.stringify({ courseId: enrollment.courseId, skillsAcquired: newSkills }),
        },
      })

      // Create notification
      await db.notification.create({
        data: {
          userId,
          title: 'Training Completed! Skills Updated',
          message: `Congratulations! Your skills have been auto-updated: ${newSkills.join(', ')}. Your resume has also been updated.`,
          type: 'success',
        },
      })
    }

    return NextResponse.json({ enrollment, message: 'Enrollment updated successfully' })
  } catch (error) {
    console.error('Training update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
