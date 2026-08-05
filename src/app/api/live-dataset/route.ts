import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// GET /api/live-dataset - Returns the live job dataset
// Used by sync endpoint and for debugging
export async function GET() {
  try {
    // Try to read the pre-built dataset
    const datasetPath = path.join(process.cwd(), 'scripts', 'live-data-dataset.json')
    
    if (fs.existsSync(datasetPath)) {
      const data = fs.readFileSync(datasetPath, 'utf-8')
      return NextResponse.json(JSON.parse(data))
    }

    // Fallback: return inline dataset (companies + jobs count)
    return NextResponse.json({
      message: 'Live dataset not built yet. Run: npx tsx scripts/fetch-live-jobs.ts',
      stats: { totalCompanies: 0, totalJobs: 0, totalCourses: 0 },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load dataset' }, { status: 500 })
  }
}
