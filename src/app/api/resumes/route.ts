import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()
        const resumes = await db.resume.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } })
        return NextResponse.json({ resumes })
      }
    } catch {
      // Fall through
    }

    // Demo mode - return empty
    return NextResponse.json({ resumes: [] })
  } catch (error) {
    console.error('Resumes fetch error:', error)
    return NextResponse.json({ resumes: [], error: 'Failed to fetch resumes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title } = body
    if (!userId || !title) return NextResponse.json({ error: 'User ID and title are required' }, { status: 400 })

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db } = await import('@/lib/db')
        if (body.isDefault) {
          await db.resume.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
        }
        const jsonFields = ['experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'achievements']
        for (const field of jsonFields) {
          if (body[field] && typeof body[field] === 'object') body[field] = JSON.stringify(body[field])
        }
        const resume = await db.resume.create({
          data: {
            userId, title,
            summary: body.summary || null,
            experience: body.experience || null,
            education: body.education || null,
            skills: body.skills || null,
            certifications: body.certifications || null,
            projects: body.projects || null,
            languages: body.languages || null,
            achievements: body.achievements || null,
            template: body.template || 'professional',
            isDefault: body.isDefault || false,
            aiGenerated: false,
          },
        })
        return NextResponse.json({ resume, message: 'Resume created successfully' }, { status: 201 })
      }
    } catch {
      // Fall through
    }

    return NextResponse.json({ resume: { id: 'demo-resume-001', ...body }, message: 'Resume created (demo mode)' }, { status: 201 })
  } catch (error) {
    console.error('Resume create error:', error)
    return NextResponse.json({ error: 'Failed to create resume. Please try again.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'Resume ID required' }, { status: 400 })

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db } = await import('@/lib/db')
        const { id: resumeId, ...updateData } = body
        const jsonFields = ['experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'achievements']
        for (const field of jsonFields) {
          if (updateData[field] && typeof updateData[field] === 'object') updateData[field] = JSON.stringify(updateData[field])
        }
        if (updateData.isDefault) {
          const resume = await db.resume.findUnique({ where: { id: resumeId } })
          if (resume) await db.resume.updateMany({ where: { userId: resume.userId, isDefault: true }, data: { isDefault: false } })
        }
        const resume = await db.resume.update({ where: { id: resumeId }, data: updateData })
        return NextResponse.json({ resume, message: 'Resume updated successfully' })
      }
    } catch {
      // Fall through
    }

    return NextResponse.json({ message: 'Resume updated (demo mode)' })
  } catch (error) {
    console.error('Resume update error:', error)
    return NextResponse.json({ error: 'Failed to update resume. Please try again.' }, { status: 500 })
  }
}
