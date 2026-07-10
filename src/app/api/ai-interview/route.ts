import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// AI Interview: Generate questions based on job role and difficulty
export async function POST(request: NextRequest) {
  try {
    const { userId, jobRole, industry, difficulty } = await request.json()

    if (!userId || !jobRole) {
      return NextResponse.json({ error: 'User ID and job role are required' }, { status: 400 })
    }

    // Generate AI interview questions based on role
    const questions = generateInterviewQuestions(jobRole, industry, difficulty || 'intermediate')

    const session = await db.aiInterviewSession.create({
      data: {
        userId,
        jobRole,
        industry: industry || null,
        difficulty: difficulty || 'intermediate',
        questions: JSON.stringify(questions),
        responses: JSON.stringify([]),
        scores: JSON.stringify({}),
      },
    })

    return NextResponse.json({ session, questions }, { status: 201 })
  } catch (error) {
    console.error('AI Interview create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, responses, overallScore, communicationScore, technicalScore, confidenceScore, aiFeedback, duration } = await request.json()

    if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

    // Calculate scores based on responses
    const calculatedScores = calculateInterviewScores(responses)

    const session = await db.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        responses: JSON.stringify(responses),
        overallScore: overallScore || calculatedScores.overall,
        communicationScore: communicationScore || calculatedScores.communication,
        technicalScore: technicalScore || calculatedScores.technical,
        confidenceScore: confidenceScore || calculatedScores.confidence,
        aiFeedback: aiFeedback || calculatedScores.feedback,
        duration: duration || null,
        completedAt: new Date(),
      },
    })

    // Update skill assessment based on interview
    const userId = session.userId
    if (session.overallScore && session.overallScore > 60) {
      await db.skillAssessment.create({
        data: {
          userId,
          skillName: session.jobRole,
          level: session.overallScore,
          source: 'ai_assessment',
          evidence: JSON.stringify({ sessionId: session.id, scores: calculatedScores }),
        },
      })
    }

    // Track analytics
    await db.analyticsEvent.create({
      data: {
        userId,
        eventType: 'interview_completed',
        category: 'ai_interview',
        metadata: JSON.stringify({ sessionId, overallScore: session.overallScore, jobRole: session.jobRole }),
      },
    })

    return NextResponse.json({ session, scores: calculatedScores, message: 'Interview session completed' })
  } catch (error) {
    console.error('AI Interview update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const sessionId = request.nextUrl.searchParams.get('sessionId')

    if (sessionId) {
      const session = await db.aiInterviewSession.findUnique({ where: { id: sessionId } })
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      return NextResponse.json({ session })
    }

    if (!userId) return NextResponse.json({ error: 'User ID or Session ID required' }, { status: 400 })

    const sessions = await db.aiInterviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('AI Interview fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateInterviewQuestions(jobRole: string, industry?: string, difficulty: string = 'intermediate') {
  const roleQuestions: Record<string, string[]> = {
    'Software Engineer': [
      'Tell me about a challenging technical problem you solved recently.',
      'How do you approach debugging complex systems?',
      'Describe your experience with system design and architecture.',
      'How do you ensure code quality in your projects?',
      'Tell me about a time you had to learn a new technology quickly.',
      'How do you handle technical debt in a codebase?',
      'Describe your experience with CI/CD pipelines.',
      'How would you design a scalable web application?',
      'What testing strategies do you prefer and why?',
      'How do you collaborate with non-technical team members?',
    ],
    'Data Scientist': [
      'Walk me through your approach to a new data science project.',
      'How do you handle missing or noisy data?',
      'Explain the difference between supervised and unsupervised learning.',
      'How do you validate your model performance?',
      'Describe a data pipeline you built from scratch.',
      'How do you communicate findings to non-technical stakeholders?',
      'What feature engineering techniques do you find most effective?',
      'How do you handle class imbalance in classification problems?',
    ],
    'Product Manager': [
      'How do you prioritize features in a product roadmap?',
      'Describe a product launch you led from concept to delivery.',
      'How do you gather and incorporate user feedback?',
      'Tell me about a time you had to make a difficult trade-off decision.',
      'How do you measure product success?',
      'Describe your experience with A/B testing.',
    ],
    'UI/UX Designer': [
      'Walk me through your design process from research to final deliverable.',
      'How do you conduct user research?',
      'Describe a design challenge you faced and how you solved it.',
      'How do you balance user needs with business requirements?',
      'What tools and methodologies do you use for prototyping?',
      'How do you measure the success of your designs?',
    ],
    'Marketing Manager': [
      'How do you develop a marketing strategy from scratch?',
      'Describe a successful campaign you led.',
      'How do you measure marketing ROI?',
      'Tell me about your experience with digital marketing channels.',
      'How do you approach brand positioning?',
    ],
  }

  const generalQuestions = [
    'Tell me about yourself and your career journey.',
    'What are your greatest strengths and weaknesses?',
    'Why are you interested in this role?',
    'Where do you see yourself in 5 years?',
    'Describe a conflict you resolved at work.',
    'How do you handle tight deadlines?',
    'What motivates you in your career?',
    'Tell me about a failure and what you learned from it.',
  ]

  const roleSpecific = roleQuestions[jobRole] || roleQuestions['Software Engineer']
  const count = difficulty === 'beginner' ? 5 : difficulty === 'advanced' ? 10 : 7

  const selected = roleSpecific.slice(0, count - 2).map((q, i) => ({
    id: i + 1,
    question: q,
    type: 'role_specific',
    category: 'technical',
    timeLimit: 120,
  }))

  const general = generalQuestions.slice(0, 2).map((q, i) => ({
    id: count - 1 + i,
    question: q,
    type: 'general',
    category: 'behavioral',
    timeLimit: 90,
  }))

  return [...selected, ...general]
}

function calculateInterviewScores(responses: any[]) {
  if (!responses || responses.length === 0) {
    return { overall: 0, communication: 0, technical: 0, confidence: 0, feedback: 'No responses recorded.' }
  }

  // Simulate AI scoring based on response length and content keywords
  let communicationTotal = 0
  let technicalTotal = 0
  let confidenceTotal = 0

  responses.forEach((response) => {
    const text = response.text || ''
    const wordCount = text.split(/\s+/).length

    // Communication score: based on response length and structure
    const commScore = Math.min(100, Math.max(20, wordCount > 30 ? 70 + (wordCount / 10) : wordCount * 2))
    communicationTotal += commScore

    // Technical score: check for technical keywords
    const techKeywords = ['algorithm', 'system', 'design', 'architecture', 'database', 'api', 'framework', 'testing', 'deploy', 'optimize', 'scalable', 'performance', 'security', 'data', 'model']
    const techMatches = techKeywords.filter(k => text.toLowerCase().includes(k)).length
    const techScore = Math.min(100, Math.max(25, 40 + techMatches * 12))
    technicalTotal += techScore

    // Confidence score: based on assertive language
    const confidentWords = ['achieved', 'led', 'implemented', 'delivered', 'improved', 'designed', 'built', 'managed', 'created', 'solved']
    const confidentMatches = confidentWords.filter(w => text.toLowerCase().includes(w)).length
    const confScore = Math.min(100, Math.max(25, 40 + confidentMatches * 10))
    confidenceTotal += confScore
  })

  const count = responses.length
  const communication = Math.round(communicationTotal / count)
  const technical = Math.round(technicalTotal / count)
  const confidence = Math.round(confidenceTotal / count)
  const overall = Math.round((communication * 0.3 + technical * 0.4 + confidence * 0.3))

  let feedback = ''
  if (overall >= 80) feedback = 'Excellent performance! You demonstrated strong technical knowledge and communication skills. Continue honing your expertise in your areas of strength.'
  else if (overall >= 60) feedback = 'Good performance with room for improvement. Focus on adding more specific examples and technical depth to your responses. Practice structured storytelling using the STAR method.'
  else if (overall >= 40) feedback = 'Fair performance. Work on providing more detailed responses with concrete examples. Consider practicing common interview questions and developing structured answers.'
  else feedback = 'Needs significant improvement. Practice articulating your thoughts more clearly. Prepare specific examples from your experience and focus on structured communication.'

  return { overall, communication, technical, confidence, feedback }
}
