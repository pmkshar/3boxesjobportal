import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, companyName, industry, companySize, specialization, phone, location } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 })
    }

    // Ensure DB is initialized
    await ensureSeedData()

    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = hashPassword(password)

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phone: phone || null,
        location: location || null,
        ...(role === 'JOB_SEEKER' && {
          jobSeekerProfile: {
            create: {
              headline: 'Looking for new opportunities',
            },
          },
        }),
        ...(role === 'CORPORATE' && {
          corporateProfile: {
            create: {
              companyName: companyName || `${name}'s Company`,
              industry: industry || null,
              companySize: companySize || null,
            },
          },
        }),
        ...(role === 'RECRUITER' && {
          recruiterProfile: {
            create: {
              specialization: specialization || null,
            },
          },
        }),
      },
      include: {
        jobSeekerProfile: true,
        corporateProfile: true,
        recruiterProfile: true,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
      },
      message: 'Registration successful',
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
