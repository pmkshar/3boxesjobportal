import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 })
    }

    const token = generateToken()

    const userProfile = await getProfileByRole(user)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        profile: userProfile,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getProfileByRole(user: any) {
  switch (user.role) {
    case 'JOB_SEEKER':
      return await db.jobSeekerProfile.findUnique({ where: { userId: user.id } })
    case 'CORPORATE':
      return await db.corporateProfile.findUnique({ where: { userId: user.id } })
    case 'RECRUITER':
      return await db.recruiterProfile.findUnique({ where: { userId: user.id } })
    default:
      return null
  }
}
