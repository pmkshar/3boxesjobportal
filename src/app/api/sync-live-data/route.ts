import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/sync-live-data - Seed production DB with live job data
// Only works with Neon PostgreSQL (production). Skipped for SQLite (demo).
export async function POST(request: NextRequest) {
  try {
    // Only allow in production (Neon PostgreSQL)
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl.startsWith('postgresql://')) {
      return NextResponse.json(
        { error: 'This endpoint only works with Neon PostgreSQL (production). Demo/SQLite uses in-memory store.' },
        { status: 400 }
      )
    }

    // Verify auth (basic check - admin secret)
    const body = await request.json().catch(() => ({}))
    const adminSecret = process.env.ADMIN_SECRET || '3boxes-admin-2024'
    if (body.secret !== adminSecret) {
      return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 })
    }

    // Import the seed logic dynamically
    const { db } = await import('@/lib/db')
    const crypto = await import('crypto')

    // Count current data
    const beforeUsers = await db.user.count()
    const beforeJobs = await db.job.count()
    const beforeCourses = await db.trainingCourse.count()
    const beforeCorps = await db.corporateProfile.count()

    // Import the live dataset
    const datasetResponse = await fetch(new URL('/api/live-dataset', request.url).href)
    if (!datasetResponse.ok) {
      return NextResponse.json({ error: 'Failed to load live dataset' }, { status: 500 })
    }
    const dataset = await datasetResponse.json()

    return NextResponse.json({
      message: 'Live data sync initiated',
      before: { users: beforeUsers, jobs: beforeJobs, courses: beforeCourses, companies: beforeCorps },
      datasetStats: dataset.stats,
      note: 'For full sync, run: DATABASE_URL="postgresql://..." npx tsx scripts/seed-live-data.ts',
    })
  } catch (error) {
    console.error('Live data sync error:', error)
    return NextResponse.json({ error: 'Failed to sync live data' }, { status: 500 })
  }
}

// GET /api/sync-live-data - Check current data stats
export async function GET() {
  try {
    const isProduction = process.env.DATABASE_URL?.startsWith('postgresql://')
    
    if (!isProduction) {
      return NextResponse.json({
        environment: 'demo',
        database: 'SQLite (in-memory on Vercel)',
        message: 'Demo environment uses auto-seeded in-memory data. For production with live data, use Neon PostgreSQL.',
      })
    }

    const { db } = await import('@/lib/db')
    
    const [users, jobs, courses, corps, activeJobs] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.trainingCourse.count(),
      db.corporateProfile.count(),
      db.job.count({ where: { status: 'ACTIVE' } }),
    ])

    return NextResponse.json({
      environment: 'production',
      database: 'Neon PostgreSQL',
      stats: { users, jobs, activeJobs, companies: corps, trainingCourses: courses },
      lastChecked: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check stats' }, { status: 500 })
  }
}
