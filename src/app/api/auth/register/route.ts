import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, companyName, industry, companySize, specialization, phone, location } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 })
    }

    const result = await memoryStore.register({
      email,
      password,
      name,
      role,
      companyName,
      industry,
      companySize,
      specialization,
      phone,
      location,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 })
    }

    return NextResponse.json(
      { user: result.user, message: result.message },
      { status: result.status || 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        error: 'Unable to process registration. Please try again.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
