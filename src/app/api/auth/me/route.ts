import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await ensureSeedData()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // In a production app, validate the token properly with JWT
    // For now, we use a simpler session-based approach
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        corporateProfile: true,
        recruiterProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      jobSeekerProfile: user.jobSeekerProfile,
      corporateProfile: user.corporateProfile,
      recruiterProfile: user.recruiterProfile,
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
