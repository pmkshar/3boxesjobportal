import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const result = await memoryStore.getJobs({
      search: searchParams.get('search') || '',
      jobType: searchParams.get('jobType') || '',
      location: searchParams.get('location') || '',
      experienceMin: searchParams.get('experienceMin') || undefined,
      isRemote: searchParams.get('isRemote') || '',
      skills: searchParams.get('skills') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { corporateId, title, description } = body

    if (!corporateId || !title || !description) {
      return NextResponse.json({ error: 'Corporate ID, title, and description are required' }, { status: 400 })
    }

    // Try Prisma first, fallback to memory
    if (await memoryStore.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()
        const job = await db.job.create({
          data: {
            corporateId,
            title,
            description,
            requirements: body.requirements || null,
            responsibilities: body.responsibilities || null,
            salaryMin: body.salaryMin || null,
            salaryMax: body.salaryMax || null,
            jobType: body.jobType || 'full-time',
            experienceMin: body.experienceMin || null,
            experienceMax: body.experienceMax || null,
            location: body.location || null,
            isRemote: body.isRemote || false,
            skills: body.skills || null,
            benefits: body.benefits || null,
            openings: body.openings || 1,
            status: 'ACTIVE',
            closingDate: body.closingDate ? new Date(body.closingDate) : null,
          },
        })
        return NextResponse.json({ job, message: 'Job posted successfully' }, { status: 201 })
      } catch {
        // Fall through to error
      }
    }

    return NextResponse.json({ error: 'Job posting requires an active database connection' }, { status: 503 })
  } catch (error) {
    console.error('Job create error:', error)
    return NextResponse.json({ error: 'Failed to create job. Please try again.' }, { status: 500 })
  }
}
