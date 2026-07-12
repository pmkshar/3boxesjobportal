import { NextRequest, NextResponse } from 'next/server'
import { memoryStore } from '@/lib/memory-store'

export const dynamic = 'force-dynamic'

// GET /api/agents/templates - List email templates (filter by agentType)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agentType = searchParams.get('agentType') || undefined

    const templates = await memoryStore.getEmailTemplates(agentType)
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST /api/agents/templates - Create email template
export async function POST(request: NextRequest) {
  try {
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
        { error: `Invalid agentType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const template = await memoryStore.createEmailTemplate({
      name, agentType, subject, body: templateBody, category,
    })

    return NextResponse.json({ template, message: 'Template created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Template create error:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
