import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const result = await memoryStore.getUserProfile(userId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 404 })
    }

    const { user } = result as any
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      jobSeekerProfile: user.jobSeekerProfile || user.profile?.headline ? user.profile : null,
      corporateProfile: user.corporateProfile || null,
      recruiterProfile: user.recruiterProfile || null,
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile. Please try again.' }, { status: 500 })
  }
}
