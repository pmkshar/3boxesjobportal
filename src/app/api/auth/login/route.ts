import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Try memory store directly first (most reliable on Vercel)
    // This avoids the Prisma/SQLite issue entirely for login
    try {
      const result = await memoryStore.login(email, password)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status || 401 })
      }
      return NextResponse.json(result)
    } catch (memoryError) {
      console.error('Memory store login failed:', memoryError)
    }

    // Last-resort: direct in-memory lookup without any DB dependency
    // This handles the case where even the memoryStore module fails to initialize
    try {
      const demoPassword = hashPassword('demo123')

      const demoUsers = [
        { id: 'demo-seeker-001', email: 'seeker@3boxes.com', name: 'Rahul Sharma', password: demoPassword, role: 'JOB_SEEKER', phone: '+91-9876543210', location: 'Mumbai, India' },
        { id: 'demo-corp-001', email: 'corp@3boxes.com', name: 'Priya Technologies', password: demoPassword, role: 'CORPORATE', phone: '+91-22-12345678', location: 'Bangalore, India' },
        { id: 'demo-recruiter-001', email: 'recruiter@3boxes.com', name: 'Amit Patel', password: demoPassword, role: 'RECRUITER', phone: '+91-9988776655', location: 'Delhi, India' },
        { id: 'demo-admin-001', email: 'admin@3boxes.com', name: '3 Boxes Admin', password: demoPassword, role: 'ADMIN', phone: '+91-9000000000', location: 'Chennai, India' },
        { id: 'demo-superadmin-001', email: 'superadmin@3boxes.com', name: 'Super Admin', password: demoPassword, role: 'SUPER_ADMIN', phone: '+91-9111111111', location: 'Mumbai, India' },
        { id: 'demo-hr-001', email: 'hr@3boxes.com', name: 'Sneha Reddy', password: demoPassword, role: 'HR_MANAGER', phone: '+91-9222222222', location: 'Hyderabad, India' },
        { id: 'demo-interviewer-001', email: 'interviewer@3boxes.com', name: 'Vikram Singh', password: demoPassword, role: 'INTERVIEWER', phone: '+91-9333333333', location: 'Delhi, India' },
      ]

      const user = demoUsers.find(u => u.email === email)
      if (!user || !verifyPassword(password, user.password)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const token = generateToken()
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          location: user.location,
        },
        token,
      })
    } catch (fallbackError) {
      console.error('All login methods failed:', fallbackError)
      return NextResponse.json(
        { error: 'Login service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Login request parsing error:', error)
    return NextResponse.json(
      { error: 'Invalid request. Please try again.' },
      { status: 400 }
    )
  }
}
