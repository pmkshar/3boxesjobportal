import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Ensure demo data exists for Vercel deployments
    await ensureSeedData()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const jobType = searchParams.get('jobType') || ''
    const location = searchParams.get('location') || ''
    const experienceMin = searchParams.get('experienceMin')
    const isRemote = searchParams.get('isRemote')
    const skills = searchParams.get('skills') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { status: 'ACTIVE' }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skills: { contains: search } },
        { location: { contains: search } },
      ]
    }

    if (jobType && jobType !== 'all') where.jobType = jobType
    if (location) where.location = { contains: location }
    if (isRemote === 'true') where.isRemote = true
    if (experienceMin) where.experienceMin = { lte: parseInt(experienceMin) }
    if (skills) {
      where.skills = { contains: skills }
    }

    const total = await db.job.count({ where })
    const jobs = await db.job.findMany({
      where,
      include: {
        corporate: {
          select: {
            id: true,
            companyName: true,
            companyLogo: true,
            industry: true,
            location: true,
          },
        },
      },
      orderBy: { postedDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeedData()
    const body = await request.json()
    const {
      corporateId, title, description, requirements, responsibilities,
      salaryMin, salaryMax, jobType, experienceMin, experienceMax,
      location, isRemote, skills, benefits, openings, closingDate,
    } = body

    if (!corporateId || !title || !description) {
      return NextResponse.json({ error: 'Corporate ID, title, and description are required' }, { status: 400 })
    }

    const job = await db.job.create({
      data: {
        corporateId,
        title,
        description,
        requirements: requirements || null,
        responsibilities: responsibilities || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        jobType: jobType || 'full-time',
        experienceMin: experienceMin || null,
        experienceMax: experienceMax || null,
        location: location || null,
        isRemote: isRemote || false,
        skills: skills || null,
        benefits: benefits || null,
        openings: openings || 1,
        status: 'ACTIVE',
        closingDate: closingDate ? new Date(closingDate) : null,
      },
    })

    return NextResponse.json({ job, message: 'Job posted successfully' }, { status: 201 })
  } catch (error) {
    console.error('Job create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
