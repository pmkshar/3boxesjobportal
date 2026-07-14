import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/candidates - List all candidates (JOB_SEEKER users)
// Query params: search, skills, location, experienceMin, experienceMax
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const skills = searchParams.get('skills') || undefined
    const location = searchParams.get('location') || undefined
    const experienceMin = searchParams.get('experienceMin') ? parseInt(searchParams.get('experienceMin')!) : undefined
    const experienceMax = searchParams.get('experienceMax') ? parseInt(searchParams.get('experienceMax')!) : undefined

    const candidates = await memoryStore.getCandidates(search, skills, location, experienceMin, experienceMax)

    return NextResponse.json({
      candidates,
      total: candidates.length,
    })
  } catch (error) {
    console.error('Candidates fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
