import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Helper: ensure DB is seeded before any agent operation
async function ensureSeeded() {
  try {
    const { ensureSeedData } = await import('@/lib/db')
    await ensureSeedData()
  } catch {}
}

// GET /api/agents/templates - List email templates (filter by agentType)
export async function GET(request: NextRequest) {
  try {
    await ensureSeeded()
    const searchParams = request.nextUrl.searchParams
    const agentType = searchParams.get('agentType') || undefined
    const category = searchParams.get('category') || undefined

    const where: Record<string, unknown> = { isActive: true }
    if (agentType) where.agentType = agentType
    if (category) where.category = category

    const templates = await prisma.aIEmailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ templates, total: templates.length })
  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/agents/templates - Create email template
export async function POST(request: NextRequest) {
  try {
    await ensureSeeded()
    const body = await request.json()
    const { name, agentType, subject, body: templateBody, category } = body

    if (!name || !agentType || !subject || !templateBody) {
      return NextResponse.json(
        { error: 'name, agentType, subject, and body are required' },
        { status: 400 }
      )
    }

    const validTypes = [
      'CANDIDATE_BUDDY',
      'ADMIN_OUTREACH_COMPANY',
      'ADMIN_OUTREACH_CANDIDATE',
      'ADMIN_OUTREACH_HR',
    ]
    if (!validTypes.includes(agentType)) {
      return NextResponse.json(
        { error: `Invalid agent type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const template = await prisma.aIEmailTemplate.create({
      data: {
        name,
        agentType,
        subject,
        body: templateBody,
        category: category || null,
      },
    })

    return NextResponse.json(
      { template, message: 'Template created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Template create error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
