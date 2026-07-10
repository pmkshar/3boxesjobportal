import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category')
    const level = request.nextUrl.searchParams.get('level')
    const search = request.nextUrl.searchParams.get('search')

    const result = await memoryStore.getCourses({ category: category || undefined, level: level || undefined, search: search || undefined })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Training fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch training courses. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 })
    }

    // Try Prisma first if available
    if (await memoryStore.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()

        const existing = await db.trainingEnrollment.findFirst({ where: { userId, courseId } })
        if (existing) {
          return NextResponse.json({ error: 'Already enrolled in this course', enrollment: existing }, { status: 409 })
        }

        const enrollment = await db.trainingEnrollment.create({ data: { userId, courseId, status: 'enrolled' } })
        await db.trainingCourse.update({ where: { id: courseId }, data: { enrollCount: { increment: 1 } } })

        return NextResponse.json({ enrollment, message: 'Enrolled successfully' }, { status: 201 })
      } catch {
        // Fall through
      }
    }

    return NextResponse.json({ message: 'Enrollment recorded (demo mode)' }, { status: 201 })
  } catch (error) {
    console.error('Training enrollment error:', error)
    return NextResponse.json({ error: 'Failed to enroll. Please try again.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { enrollmentId, progress, status } = await request.json()
    if (!enrollmentId) return NextResponse.json({ error: 'Enrollment ID required' }, { status: 400 })

    // Try Prisma first if available
    if (await memoryStore.isDbAvailable()) {
      try {
        const { db } = await import('@/lib/db')
        const updateData: any = {}
        if (progress !== undefined) updateData.progress = progress
        if (status) updateData.status = status
        if (status === 'completed') updateData.completedAt = new Date()

        const enrollment = await db.trainingEnrollment.update({ where: { id: enrollmentId }, data: updateData })
        return NextResponse.json({ enrollment, message: 'Enrollment updated successfully' })
      } catch {
        // Fall through
      }
    }

    return NextResponse.json({ message: 'Progress updated (demo mode)' })
  } catch (error) {
    console.error('Training update error:', error)
    return NextResponse.json({ error: 'Failed to update enrollment. Please try again.' }, { status: 500 })
  }
}
