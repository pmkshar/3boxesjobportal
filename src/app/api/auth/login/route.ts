import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const result = await memoryStore.login(email, password)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 401 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Login error:', error)
    // Never return a generic 500 — always give the user actionable info
    return NextResponse.json(
      {
        error: 'Unable to process login. Please check your credentials and try again.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
