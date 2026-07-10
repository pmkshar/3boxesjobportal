import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await ensureSeedData()
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    const resumes = await db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error('Resumes fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, summary, experience, education, skills, certifications, projects, languages, achievements, template, isDefault } = body

    if (!userId || !title) {
      return NextResponse.json({ error: 'User ID and title are required' }, { status: 400 })
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.resume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const resume = await db.resume.create({
      data: {
        userId,
        title,
        summary: summary || null,
        experience: typeof experience === 'object' ? JSON.stringify(experience) : (experience || null),
        education: typeof education === 'object' ? JSON.stringify(education) : (education || null),
        skills: typeof skills === 'object' ? JSON.stringify(skills) : (skills || null),
        certifications: typeof certifications === 'object' ? JSON.stringify(certifications) : (certifications || null),
        projects: typeof projects === 'object' ? JSON.stringify(projects) : (projects || null),
        languages: typeof languages === 'object' ? JSON.stringify(languages) : (languages || null),
        achievements: typeof achievements === 'object' ? JSON.stringify(achievements) : (achievements || null),
        template: template || 'professional',
        isDefault: isDefault || false,
        aiGenerated: false,
      },
    })

    return NextResponse.json({ resume, message: 'Resume created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Resume create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: 'Resume ID required' }, { status: 400 })

    // Stringify JSON fields
    const jsonFields = ['experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'achievements']
    for (const field of jsonFields) {
      if (updateData[field] && typeof updateData[field] === 'object') {
        updateData[field] = JSON.stringify(updateData[field])
      }
    }

    if (updateData.isDefault) {
      const resume = await db.resume.findUnique({ where: { id } })
      if (resume) {
        await db.resume.updateMany({
          where: { userId: resume.userId, isDefault: true },
          data: { isDefault: false },
        })
      }
    }

    const resume = await db.resume.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ resume, message: 'Resume updated successfully' })
  } catch (error) {
    console.error('Resume update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
