import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await memoryStore.getJobById(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch job details. Please try again.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Try Prisma first if available
    if (await memoryStore.isDbAvailable()) {
      try {
        const { db } = await import('@/lib/db')
        const job = await db.job.update({ where: { id }, data: body })
        return NextResponse.json({ job, message: 'Job updated successfully' })
      } catch {
        // Fall through
      }
    }

    return NextResponse.json({ error: 'Job update requires an active database connection' }, { status: 503 })
  } catch (error) {
    console.error('Job update error:', error)
    return NextResponse.json({ error: 'Failed to update job. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Try Prisma first if available
    if (await memoryStore.isDbAvailable()) {
      try {
        const { db } = await import('@/lib/db')
        await db.job.delete({ where: { id } })
        return NextResponse.json({ message: 'Job deleted successfully' })
      } catch {
        // Fall through
      }
    }

    return NextResponse.json({ error: 'Job deletion requires an active database connection' }, { status: 503 })
  } catch (error) {
    console.error('Job delete error:', error)
    return NextResponse.json({ error: 'Failed to delete job. Please try again.' }, { status: 500 })
  }
}
