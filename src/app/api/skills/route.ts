import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await ensureSeedData()
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    const assessments = await db.skillAssessment.findMany({
      where: { userId },
      orderBy: { assessedAt: 'desc' },
    })

    // Get profile skills
    const profile = await db.jobSeekerProfile.findUnique({ where: { userId } })

    return NextResponse.json({
      assessments,
      profileSkills: profile?.skills ? profile.skills.split(',').map(s => s.trim()) : [],
      aiSkillScore: profile?.aiSkillScore || 0,
    })
  } catch (error) {
    console.error('Skills fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, skillName, level, source } = await request.json()

    if (!userId || !skillName) {
      return NextResponse.json({ error: 'User ID and skill name are required' }, { status: 400 })
    }

    // Upsert skill assessment
    const assessment = await db.skillAssessment.create({
      data: {
        userId,
        skillName,
        level: level || 50,
        source: source || 'self',
      },
    })

    // Update profile skills
    const profile = await db.jobSeekerProfile.findUnique({ where: { userId } })
    if (profile) {
      const existingSkills = profile.skills ? profile.skills.split(',').map(s => s.trim()) : []
      if (!existingSkills.includes(skillName)) {
        await db.jobSeekerProfile.update({
          where: { userId },
          data: { skills: [...existingSkills, skillName].join(', ') },
        })
      }
    }

    return NextResponse.json({ assessment, message: 'Skill added successfully' }, { status: 201 })
  } catch (error) {
    console.error('Skill create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
