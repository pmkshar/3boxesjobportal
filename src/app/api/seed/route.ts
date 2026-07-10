import { NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export async function POST() {
  try {
    // Seed via Prisma if available
    if (await memoryStore.isDbAvailable()) {
      try {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()

        // Also seed additional data via the original seed endpoint
        const demoPassword = (await import('@/lib/auth')).hashPassword('demo123')

        // Create additional jobs if needed
        const userCount = await db.user.count()
        if (userCount === 0) {
          // Full seed needed — already handled by ensureSeedData
        }
      } catch (error) {
        console.error('Prisma seed failed, memory store already has demo data:', error)
      }
    }

    // Memory store always has demo data available
    return NextResponse.json({
      message: 'Seed data is ready (using memory fallback on Vercel)',
      users: {
        jobSeeker: { email: 'seeker@3boxes.com', password: 'demo123' },
        corporate: { email: 'corp@3boxes.com', password: 'demo123' },
        recruiter: { email: 'recruiter@3boxes.com', password: 'demo123' },
        admin: { email: 'admin@3boxes.com', password: 'demo123' },
      },
      note: 'On Vercel, data is stored in-memory and resets on cold starts. For persistent data, configure a cloud database (Turso/Neon).',
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed. Demo data is still available via memory store.' }, { status: 500 })
  }
}
