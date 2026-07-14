import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/users - List all users, optionally filtered by role
// Query params: role, search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || undefined
    const search = searchParams.get('search') || undefined

    const users = await memoryStore.getUsers(role, search)

    return NextResponse.json({
      users,
      total: users.length,
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
