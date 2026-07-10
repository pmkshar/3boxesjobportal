import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Use memory store directly — it handles DB fallback internally
    // and always has demo data seeded, even on Vercel cold starts
    const result = await memoryStore.login(email, password)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 401 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Login error:', error)
    // Last-resort fallback: try direct memory login
    try {
      const { hashPassword, verifyPassword, generateToken } = await import('@/lib/auth')
      const body = await request.clone().json()
      const { email, password } = body
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      }
      // Import fresh memory store to get demo users
      const { memoryStore: ms } = await import('@/lib/memory-store')
      const result = await ms.login(email, password)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status || 401 })
      }
      return NextResponse.json(result)
    } catch (innerError) {
      console.error('Login fallback also failed:', innerError)
      return NextResponse.json(
        { error: 'Login service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }
  }
}
