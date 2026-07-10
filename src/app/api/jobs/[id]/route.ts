import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const job = await db.job.findUnique({
      where: { id },
      include: {
        corporate: true,
        applications: { select: { id: true, status: true, userId: true } },
      },
    })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json({ job })
  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const job = await db.job.update({ where: { id }, data: body })
    return NextResponse.json({ job, message: 'Job updated successfully' })
  } catch (error) {
    console.error('Job update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.job.delete({ where: { id } })
    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Job delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
