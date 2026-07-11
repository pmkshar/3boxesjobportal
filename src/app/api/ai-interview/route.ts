import { NextRequest, NextResponse } from 'next/server'

// ─── Types ──────────────────────────────────────────────────────

interface InterviewQuestion {
  id: number
  question: string
  type: string
  category: 'technical' | 'behavioral' | 'situational' | 'culture_fit'
  timeLimit: number
  difficulty: string
  keywords: string[]
  hints: string[]
}

interface AnswerSubmission {
  questionId: number
  text: string
  question: string
  category: string
  timeTaken: number
}

interface CompetencyScores {
  communication: number
  technical: number
  problemSolving: number
  leadership: number
  cultureFit: number
  confidence: number
  overall: number
}

// ─── POST Handler ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'start':
        return await handleStartInterview(body)
      case 'answer':
        return await handleSubmitAnswer(body)
      case 'finish':
        return await handleFinishInterview(body)
      default:
        // Legacy: create session
        return await handleCreateSession(body)
    }
  } catch (error) {
    console.error('AI Interview POST error:', error)
    return NextResponse.json({ error: 'Failed to process request. Please try again.' }, { status: 500 })
  }
}

// ─── GET Handler ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    const action = request.nextUrl.searchParams.get('action')

    // Get full report
    if (action === 'report' && sessionId) {
      return await handleGetReport(sessionId)
    }

    // Get transcript
    if (sessionId) {
      return await handleGetTranscript(sessionId)
    }

    // List sessions
    if (!userId) {
      return NextResponse.json({ error: 'User ID or Session ID required' }, { status: 400 })
    }

    return await handleListSessions(userId)
  } catch (error) {
    console.error('AI Interview GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch interview data. Please try again.' }, { status: 500 })
  }
}

// ─── PUT Handler (Legacy - Update/Finish Session) ──────────────

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, responses } = await request.json()
    if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

    const calculatedScores = calculateFullCompetencyScores(responses || [])
    const recommendation = generateRecommendation(calculatedScores.overall)
    const strengths = identifyStrengths(calculatedScores)
    const improvements = identifyImprovements(calculatedScores)
    const transcript = generateTranscript(responses || [])
    const feedback = generateOverallFeedback(calculatedScores)

    // Try Prisma first
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db } = await import('@/lib/db')
        const session = await db.aiInterviewSession.update({
          where: { id: sessionId },
          data: {
            responses: JSON.stringify(responses),
            overallScore: calculatedScores.overall,
            communicationScore: calculatedScores.communication,
            technicalScore: calculatedScores.technical,
            problemSolvingScore: calculatedScores.problemSolving,
            leadershipScore: calculatedScores.leadership,
            cultureFitScore: calculatedScores.cultureFit,
            confidenceScore: calculatedScores.confidence,
            transcript: JSON.stringify(transcript),
            strengths: JSON.stringify(strengths),
            improvements: JSON.stringify(improvements),
            recommendation,
            aiFeedback: feedback,
            status: 'completed',
            completedAt: new Date(),
          },
        })
        // Update skill assessment (best effort)
        try {
          if (session.overallScore && session.overallScore > 60) {
            await db.skillAssessment.create({
              data: {
                userId: session.userId,
                skillName: session.jobRole,
                level: session.overallScore,
                source: 'ai_assessment',
                evidence: JSON.stringify({ sessionId, scores: calculatedScores }),
              },
            })
          }
          await db.analyticsEvent.create({
            data: {
              userId: session.userId,
              eventType: 'interview_completed',
              category: 'ai_interview',
              metadata: JSON.stringify({ sessionId, overallScore: session.overallScore, jobRole: session.jobRole }),
            },
          })
        } catch { /* non-critical */ }
        return NextResponse.json({ session, scores: calculatedScores, transcript, strengths, improvements, recommendation, feedback, message: 'Interview session completed' })
      }
    } catch {
      // Fall through
    }

    // Demo mode
    return NextResponse.json({
      session: {
        id: sessionId,
        overallScore: calculatedScores.overall,
        communicationScore: calculatedScores.communication,
        technicalScore: calculatedScores.technical,
        problemSolvingScore: calculatedScores.problemSolving,
        leadershipScore: calculatedScores.leadership,
        cultureFitScore: calculatedScores.cultureFit,
        confidenceScore: calculatedScores.confidence,
        completedAt: new Date().toISOString(),
      },
      scores: calculatedScores,
      transcript,
      strengths,
      improvements,
      recommendation,
      feedback,
      message: 'Interview session completed (demo mode)',
    })
  } catch (error) {
    console.error('AI Interview update error:', error)
    return NextResponse.json({ error: 'Failed to update interview session.' }, { status: 500 })
  }
}

// ─── Action Handlers ──────────────────────────────────────────

async function handleCreateSession(body: any) {
  const { userId, jobRole, industry, difficulty } = body
  if (!userId || !jobRole) return NextResponse.json({ error: 'User ID and job role are required' }, { status: 400 })

  const questions = generateInterviewQuestions(jobRole, industry, difficulty || 'intermediate')

  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db, ensureSeedData } = await import('@/lib/db')
      await ensureSeedData()
      const session = await db.aiInterviewSession.create({
        data: {
          userId, jobRole,
          industry: industry || null,
          difficulty: difficulty || 'intermediate',
          questions: JSON.stringify(questions),
          responses: JSON.stringify([]),
          scores: JSON.stringify({}),
          status: 'created',
        },
      })
      return NextResponse.json({ session, questions }, { status: 201 })
    }
  } catch { /* fall through */ }

  return NextResponse.json({
    session: { id: `demo-${Date.now()}`, userId, jobRole, difficulty: difficulty || 'intermediate', createdAt: new Date().toISOString(), status: 'created' },
    questions,
  }, { status: 201 })
}

async function handleStartInterview(body: any) {
  const { userId, jobRole, industry, difficulty } = body
  if (!userId || !jobRole) return NextResponse.json({ error: 'User ID and job role are required' }, { status: 400 })

  const questions = generateInterviewQuestions(jobRole, industry, difficulty || 'intermediate')

  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db, ensureSeedData } = await import('@/lib/db')
      await ensureSeedData()
      const session = await db.aiInterviewSession.create({
        data: {
          userId, jobRole,
          industry: industry || null,
          difficulty: difficulty || 'intermediate',
          questions: JSON.stringify(questions),
          responses: JSON.stringify([]),
          scores: JSON.stringify({}),
          status: 'in_progress',
          startedAt: new Date(),
        },
      })
      return NextResponse.json({ session, questions, message: 'Interview started' }, { status: 201 })
    }
  } catch { /* fall through */ }

  const sessionId = `demo-${Date.now()}`
  return NextResponse.json({
    session: {
      id: sessionId,
      userId, jobRole,
      difficulty: difficulty || 'intermediate',
      industry: industry || null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      status: 'in_progress',
    },
    questions,
    message: 'Interview started (demo mode)',
  }, { status: 201 })
}

async function handleSubmitAnswer(body: any) {
  const { sessionId, answer, previousAnswers } = body
  if (!sessionId || !answer) return NextResponse.json({ error: 'Session ID and answer are required' }, { status: 400 })

  // Score individual answer in real-time
  const answerScore = scoreIndividualAnswer(answer)
  const allAnswers = [...(previousAnswers || []), { ...answer, score: answerScore }]

  // Determine next question adaptation
  const runningScores = calculateFullCompetencyScores(allAnswers)
  const adaptation = determineQuestionAdaptation(runningScores)

  // Generate real-time feedback hints
  const hints = generateRealTimeHints(answer, answerScore)

  // Try updating in DB
  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db } = await import('@/lib/db')
      await db.aiInterviewSession.update({
        where: { id: sessionId },
        data: {
          responses: JSON.stringify(allAnswers),
          scores: JSON.stringify(runningScores),
        },
      })
    }
  } catch { /* non-critical for real-time scoring */ }

  return NextResponse.json({
    score: answerScore,
    runningScores,
    adaptation,
    hints,
    message: 'Answer submitted',
  })
}

async function handleFinishInterview(body: any) {
  const { sessionId, responses, duration } = body
  if (!sessionId) return NextResponse.json({ error: 'Session ID required' }, { status: 400 })

  const allResponses = responses || []
  const calculatedScores = calculateFullCompetencyScores(allResponses)
  const recommendation = generateRecommendation(calculatedScores.overall)
  const strengths = identifyStrengths(calculatedScores)
  const improvements = identifyImprovements(calculatedScores)
  const transcript = generateTranscript(allResponses)
  const feedback = generateOverallFeedback(calculatedScores)
  const perQuestion = generatePerQuestionBreakdown(allResponses)

  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db } = await import('@/lib/db')
      const session = await db.aiInterviewSession.update({
        where: { id: sessionId },
        data: {
          responses: JSON.stringify(allResponses),
          overallScore: calculatedScores.overall,
          communicationScore: calculatedScores.communication,
          technicalScore: calculatedScores.technical,
          problemSolvingScore: calculatedScores.problemSolving,
          leadershipScore: calculatedScores.leadership,
          cultureFitScore: calculatedScores.cultureFit,
          confidenceScore: calculatedScores.confidence,
          transcript: JSON.stringify(transcript),
          strengths: JSON.stringify(strengths),
          improvements: JSON.stringify(improvements),
          recommendation,
          aiFeedback: feedback,
          duration: duration || null,
          status: 'completed',
          completedAt: new Date(),
        },
      })
      try {
        await db.analyticsEvent.create({
          data: {
            userId: session.userId,
            eventType: 'interview_completed',
            category: 'ai_interview',
            metadata: JSON.stringify({ sessionId, overallScore: calculatedScores.overall, jobRole: session.jobRole, recommendation }),
          },
        })
      } catch { /* non-critical */ }
      return NextResponse.json({ session, scores: calculatedScores, transcript, strengths, improvements, recommendation, feedback, perQuestion, message: 'Interview completed successfully' })
    }
  } catch { /* fall through */ }

  return NextResponse.json({
    session: {
      id: sessionId,
      overallScore: calculatedScores.overall,
      communicationScore: calculatedScores.communication,
      technicalScore: calculatedScores.technical,
      problemSolvingScore: calculatedScores.problemSolving,
      leadershipScore: calculatedScores.leadership,
      cultureFitScore: calculatedScores.cultureFit,
      confidenceScore: calculatedScores.confidence,
      duration: duration || null,
      completedAt: new Date().toISOString(),
      recommendation,
    },
    scores: calculatedScores,
    transcript,
    strengths,
    improvements,
    recommendation,
    feedback,
    perQuestion,
    message: 'Interview completed (demo mode)',
  })
}

async function handleGetTranscript(sessionId: string) {
  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db } = await import('@/lib/db')
      const session = await db.aiInterviewSession.findUnique({ where: { id: sessionId } })
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      return NextResponse.json({
        session,
        transcript: session.transcript ? JSON.parse(session.transcript) : [],
      })
    }
  } catch { /* fall through */ }

  return NextResponse.json({ error: 'Session not found' }, { status: 404 })
}

async function handleGetReport(sessionId: string) {
  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db } = await import('@/lib/db')
      const session = await db.aiInterviewSession.findUnique({ where: { id: sessionId } })
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

      const questions = session.questions ? JSON.parse(session.questions) : []
      const responses = session.responses ? JSON.parse(session.responses) : []
      const transcript = session.transcript ? JSON.parse(session.transcript) : []
      const strengths = session.strengths ? JSON.parse(session.strengths) : []
      const improvements = session.improvements ? JSON.parse(session.improvements) : []

      const scores: CompetencyScores = {
        communication: session.communicationScore || 0,
        technical: session.technicalScore || 0,
        problemSolving: session.problemSolvingScore || 0,
        leadership: session.leadershipScore || 0,
        cultureFit: session.cultureFitScore || 0,
        confidence: session.confidenceScore || 0,
        overall: session.overallScore || 0,
      }

      const perQuestion = generatePerQuestionBreakdown(responses)

      return NextResponse.json({
        session,
        scores,
        transcript,
        strengths,
        improvements,
        perQuestion,
        recommendation: session.recommendation || 'Pending',
        feedback: session.aiFeedback || '',
        questions,
        metadata: {
          date: session.createdAt,
          duration: session.duration,
          role: session.jobRole,
          industry: session.industry,
          difficulty: session.difficulty,
        },
      })
    }
  } catch { /* fall through */ }

  return NextResponse.json({ error: 'Session not found' }, { status: 404 })
}

async function handleListSessions(userId: string) {
  try {
    const { memoryStore } = await import('@/lib/memory-store')
    if (await memoryStore.isDbAvailable()) {
      const { db, ensureSeedData } = await import('@/lib/db')
      await ensureSeedData()
      const sessions = await db.aiInterviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
      return NextResponse.json({ sessions })
    }
  } catch { /* fall through */ }

  return NextResponse.json({ sessions: [] })
}

// ─── Question Generation Engine ───────────────────────────────

function generateInterviewQuestions(jobRole: string, industry?: string, difficulty: string = 'intermediate'): InterviewQuestion[] {
  const questionBank: Record<string, InterviewQuestion[]> = {
    'Software Engineer': [
      { id: 1, question: 'Tell me about a challenging technical problem you solved recently. What was your approach?', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'intermediate', keywords: ['algorithm', 'debugging', 'architecture', 'optimization', 'refactor'], hints: ['Use the STAR method', 'Mention specific technologies', 'Quantify the impact'] },
      { id: 2, question: 'How do you approach debugging complex systems? Walk me through your process.', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'intermediate', keywords: ['logs', 'monitoring', 'root cause', 'testing', 'isolation'], hints: ['Start with reproduction', 'Use systematic elimination', 'Mention tools you use'] },
      { id: 3, question: 'Describe your experience with system design and architecture. What principles do you follow?', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'advanced', keywords: ['scalability', 'microservices', 'design patterns', 'SOLID', 'DRY'], hints: ['Mention specific patterns', 'Talk about trade-offs', 'Consider scalability'] },
      { id: 4, question: 'How do you ensure code quality in your projects?', type: 'role_specific', category: 'technical', timeLimit: 120, difficulty: 'beginner', keywords: ['testing', 'code review', 'CI/CD', 'linting', 'TDD'], hints: ['Mention automated testing', 'Talk about code reviews', 'Include CI/CD practices'] },
      { id: 5, question: 'Tell me about a time you had a disagreement with a teammate about a technical decision. How did you resolve it?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['compromise', 'data-driven', 'communication', 'collaboration', 'empathy'], hints: ['Stay professional', 'Focus on the outcome', 'Show data-driven approach'] },
      { id: 6, question: 'How would you design a URL shortening service? Describe the high-level architecture.', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['hash', 'database', 'cache', 'API', 'redirect'], hints: ['Think about scale', 'Consider edge cases', 'Discuss storage strategy'] },
      { id: 7, question: 'Describe a situation where you had to learn a new technology quickly. How did you approach it?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'beginner', keywords: ['learning', 'adaptability', 'documentation', 'practice', 'resources'], hints: ['Show structured approach', 'Mention time management', 'Highlight results'] },
      { id: 8, question: 'Our company values collaboration and continuous learning. How do these values align with your work style?', type: 'cultural', category: 'culture_fit', timeLimit: 120, difficulty: 'intermediate', keywords: ['teamwork', 'mentoring', 'growth mindset', 'feedback', 'sharing'], hints: ['Give specific examples', 'Connect to company values', 'Show genuine alignment'] },
      { id: 9, question: 'You discover a critical bug in production just before a major release. What would you do?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['triage', 'rollback', 'hotfix', 'communication', 'prioritization'], hints: ['Assess severity first', 'Communicate with stakeholders', 'Have a mitigation plan'] },
      { id: 10, question: 'Tell me about a project where you took on a leadership role. What was the outcome?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['led', 'initiative', 'delegation', 'mentoring', 'results'], hints: ['Show initiative', 'Mention team impact', 'Quantify results'] },
    ],
    'Data Scientist': [
      { id: 1, question: 'Walk me through your approach to a new data science project from problem definition to deployment.', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'intermediate', keywords: ['EDA', 'feature engineering', 'model selection', 'validation', 'deployment'], hints: ['Mention data exploration first', 'Talk about validation strategy', 'Include deployment considerations'] },
      { id: 2, question: 'How do you handle missing or noisy data in your datasets?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'beginner', keywords: ['imputation', 'outlier detection', 'cleaning', 'normalization', 'feature selection'], hints: ['Discuss multiple techniques', 'Mention when to drop data', 'Talk about impact on models'] },
      { id: 3, question: 'Explain the difference between supervised and unsupervised learning with examples from your experience.', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'beginner', keywords: ['classification', 'regression', 'clustering', 'labels', 'patterns'], hints: ['Give concrete examples', 'Mention real projects', 'Explain trade-offs'] },
      { id: 4, question: 'How do you validate your model performance and avoid overfitting?', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'advanced', keywords: ['cross-validation', 'regularization', 'test set', 'metrics', 'bias-variance'], hints: ['Mention cross-validation', 'Talk about regularization', 'Discuss evaluation metrics'] },
      { id: 5, question: 'Describe a time when you had to communicate complex data findings to non-technical stakeholders.', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['visualization', 'storytelling', 'simplification', 'impact', 'presentation'], hints: ['Focus on the story', 'Use visual aids', 'Highlight business impact'] },
      { id: 6, question: 'What feature engineering techniques do you find most effective and why?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'advanced', keywords: ['encoding', 'binning', 'interaction', 'PCA', 'domain knowledge'], hints: ['Mention domain expertise', 'Give specific examples', 'Discuss automation'] },
      { id: 7, question: 'How do you stay updated with the latest developments in data science and AI?', type: 'behavioral', category: 'culture_fit', timeLimit: 120, difficulty: 'beginner', keywords: ['learning', 'conferences', 'papers', 'community', 'projects'], hints: ['Show genuine curiosity', 'Mention specific sources', 'Talk about practical application'] },
      { id: 8, question: 'Your model shows bias against a particular demographic group. How would you address this?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['fairness', 'bias detection', 'retraining', 'audit', 'ethics'], hints: ['Acknowledge the issue', 'Mention fairness metrics', 'Discuss mitigation strategies'] },
    ],
    'Product Manager': [
      { id: 1, question: 'How do you prioritize features in a product roadmap when you have limited resources?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'intermediate', keywords: ['RICE', 'impact', 'effort', 'stakeholder', 'data-driven'], hints: ['Mention a framework', 'Show data-driven approach', 'Consider stakeholder needs'] },
      { id: 2, question: 'Describe a product launch you led from concept to delivery. What was your role?', type: 'role_specific', category: 'behavioral', timeLimit: 180, difficulty: 'intermediate', keywords: ['launch', 'cross-functional', 'timeline', 'metrics', 'strategy'], hints: ['Use the STAR method', 'Quantify results', 'Show cross-functional collaboration'] },
      { id: 3, question: 'How do you gather and incorporate user feedback into your product decisions?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'beginner', keywords: ['user research', 'interviews', 'analytics', 'feedback loop', 'iteration'], hints: ['Mention multiple methods', 'Show structured approach', 'Talk about prioritization'] },
      { id: 4, question: 'Tell me about a time you had to make a difficult trade-off decision. What was the outcome?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'advanced', keywords: ['trade-off', 'compromise', 'data', 'stakeholders', 'outcome'], hints: ['Show analytical thinking', 'Mention stakeholder alignment', 'Discuss the impact'] },
      { id: 5, question: 'How do you measure product success? What metrics do you focus on?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'intermediate', keywords: ['KPIs', 'OKRs', 'retention', 'engagement', 'NPS'], hints: ['Mention leading and lagging indicators', 'Give specific examples', 'Connect to business goals'] },
      { id: 6, question: 'How would you describe our company culture based on what you know? Why does it appeal to you?', type: 'cultural', category: 'culture_fit', timeLimit: 120, difficulty: 'intermediate', keywords: ['values', 'mission', 'innovation', 'collaboration', 'growth'], hints: ['Research the company first', 'Be genuine', 'Connect to your values'] },
      { id: 7, question: 'Your engineering team says a feature will take 3x longer than estimated. How do you handle this?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['negotiation', 'scope', 'MVP', 'communication', 'prioritization'], hints: ['Stay calm and analytical', 'Explore alternatives', 'Focus on MVP approach'] },
      { id: 8, question: 'Tell me about a time you influenced a decision without having direct authority.', type: 'behavioral', category: 'leadership', timeLimit: 150, difficulty: 'intermediate', keywords: ['influence', 'persuasion', 'data', 'relationship', 'outcome'], hints: ['Show leadership qualities', 'Use data to persuade', 'Mention relationship building'] },
    ],
    'UI/UX Designer': [
      { id: 1, question: 'Walk me through your design process from research to final deliverable.', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'intermediate', keywords: ['research', 'wireframe', 'prototype', 'usability', 'iteration'], hints: ['Show structured process', 'Mention user-centered approach', 'Include testing'] },
      { id: 2, question: 'How do you conduct user research? What methods have you found most effective?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'beginner', keywords: ['interviews', 'surveys', 'personas', 'journey mapping', 'analytics'], hints: ['Mention multiple methods', 'Give specific examples', 'Talk about synthesizing findings'] },
      { id: 3, question: 'Describe a design challenge you faced and how you solved it.', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['problem-solving', 'creativity', 'constraints', 'iteration', 'solution'], hints: ['Describe the constraint', 'Show creative thinking', 'Quantify the improvement'] },
      { id: 4, question: 'How do you balance user needs with business requirements?', type: 'role_specific', category: 'situational', timeLimit: 150, difficulty: 'advanced', keywords: ['compromise', 'prioritization', 'stakeholder', 'trade-off', 'alignment'], hints: ['Show understanding of both sides', 'Mention data-driven decisions', 'Discuss win-win solutions'] },
      { id: 5, question: 'How do you measure the success of your designs?', type: 'role_specific', category: 'technical', timeLimit: 120, difficulty: 'intermediate', keywords: ['metrics', 'A/B testing', 'usability', 'conversion', 'satisfaction'], hints: ['Mention quantitative and qualitative', 'Give specific metrics', 'Talk about continuous improvement'] },
      { id: 6, question: 'Tell me about a time you received critical feedback on your design. How did you handle it?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'beginner', keywords: ['feedback', 'growth', 'iteration', 'professional', 'improvement'], hints: ['Show openness', 'Demonstrate growth', 'Mention positive outcomes'] },
      { id: 7, question: 'How do you ensure accessibility and inclusivity in your designs?', type: 'role_specific', category: 'culture_fit', timeLimit: 120, difficulty: 'intermediate', keywords: ['WCAG', 'inclusive', 'diversity', 'accessibility', 'empathy'], hints: ['Mention standards', 'Show genuine commitment', 'Give examples'] },
      { id: 8, question: 'Describe your ideal collaboration with developers. How do you ensure design handoff goes smoothly?', type: 'cultural', category: 'culture_fit', timeLimit: 150, difficulty: 'intermediate', keywords: ['communication', 'documentation', 'collaboration', 'tools', 'respect'], hints: ['Emphasize collaboration', 'Mention specific tools', 'Show respect for their craft'] },
    ],
    'Marketing Manager': [
      { id: 1, question: 'How do you develop a marketing strategy from scratch? Walk me through your approach.', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'intermediate', keywords: ['market research', 'targeting', 'positioning', 'channels', 'KPIs'], hints: ['Show structured approach', 'Mention data analysis', 'Include measurement plan'] },
      { id: 2, question: 'Describe a successful marketing campaign you led. What made it successful?', type: 'behavioral', category: 'behavioral', timeLimit: 180, difficulty: 'intermediate', keywords: ['results', 'strategy', 'creativity', 'team', 'metrics'], hints: ['Quantify results', 'Mention the strategy', 'Show your specific contribution'] },
      { id: 3, question: 'How do you measure marketing ROI across different channels?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'advanced', keywords: ['attribution', 'CPA', 'ROAS', 'analytics', 'funnel'], hints: ['Mention attribution models', 'Give specific metrics', 'Talk about multi-channel'] },
      { id: 4, question: 'Tell me about a campaign that didn\'t go as planned. What did you learn?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['learning', 'adaptation', 'analysis', 'resilience', 'improvement'], hints: ['Be honest', 'Show what you learned', 'Demonstrate growth'] },
      { id: 5, question: 'How do you approach brand positioning in a competitive market?', type: 'role_specific', category: 'situational', timeLimit: 150, difficulty: 'advanced', keywords: ['differentiation', 'value proposition', 'audience', 'messaging', 'competitive analysis'], hints: ['Show strategic thinking', 'Mention unique value', 'Give examples'] },
      { id: 6, question: 'How do you ensure your marketing team stays creative and innovative?', type: 'cultural', category: 'culture_fit', timeLimit: 120, difficulty: 'intermediate', keywords: ['innovation', 'experimentation', 'psychological safety', 'diversity', 'learning'], hints: ['Show leadership style', 'Mention specific practices', 'Connect to results'] },
      { id: 7, question: 'A competitor launches a similar product at a lower price. How would you respond?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['competitive response', 'value', 'differentiation', 'positioning', 'strategy'], hints: ['Stay strategic', 'Don\'t just compete on price', 'Focus on value'] },
      { id: 8, question: 'How do you align marketing goals with sales objectives?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'intermediate', keywords: ['alignment', 'lead quality', 'funnel', 'collaboration', 'metrics'], hints: ['Show cross-functional thinking', 'Mention shared KPIs', 'Give specific examples'] },
    ],
    'DevOps Engineer': [
      { id: 1, question: 'Describe your experience with CI/CD pipelines. What tools and practices do you prefer?', type: 'role_specific', category: 'technical', timeLimit: 180, difficulty: 'intermediate', keywords: ['Jenkins', 'GitHub Actions', 'pipeline', 'automation', 'testing'], hints: ['Mention specific tools', 'Talk about automation strategy', 'Include testing integration'] },
      { id: 2, question: 'How do you handle infrastructure as code? What approaches have you used?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'intermediate', keywords: ['Terraform', 'CloudFormation', 'Ansible', 'declarative', 'version control'], hints: ['Compare tools you\'ve used', 'Mention best practices', 'Talk about state management'] },
      { id: 3, question: 'Tell me about a production incident you handled. What was your approach?', type: 'behavioral', category: 'behavioral', timeLimit: 180, difficulty: 'advanced', keywords: ['incident response', 'root cause', 'post-mortem', 'communication', 'mitigation'], hints: ['Show calm under pressure', 'Mention communication', 'Include lessons learned'] },
      { id: 4, question: 'How do you ensure security in your DevOps practices?', type: 'role_specific', category: 'technical', timeLimit: 150, difficulty: 'advanced', keywords: ['DevSecOps', 'scanning', 'secrets', 'compliance', 'encryption'], hints: ['Mention shift-left', 'Talk about automation', 'Include compliance'] },
      { id: 5, question: 'How would you design a monitoring and alerting strategy for a microservices architecture?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['observability', 'metrics', 'logs', 'traces', 'SLA'], hints: ['Think about the three pillars', 'Mention SLAs/SLOs', 'Discuss alert fatigue'] },
      { id: 6, question: 'Describe a time you improved system reliability. What was the impact?', type: 'behavioral', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['reliability', 'uptime', 'improvement', 'measurement', 'results'], hints: ['Quantify improvement', 'Mention approach', 'Show ongoing commitment'] },
      { id: 7, question: 'How do you foster collaboration between development and operations teams?', type: 'cultural', category: 'culture_fit', timeLimit: 120, difficulty: 'intermediate', keywords: ['collaboration', 'shared responsibility', 'communication', 'culture', 'automation'], hints: ['Show empathy for both sides', 'Mention shared tools', 'Talk about blameless culture'] },
      { id: 8, question: 'Your application needs to scale 10x overnight. How would you prepare?', type: 'role_specific', category: 'situational', timeLimit: 180, difficulty: 'advanced', keywords: ['auto-scaling', 'caching', 'CDN', 'load testing', 'capacity planning'], hints: ['Think about all layers', 'Mention load testing', 'Have a rollback plan'] },
    ],
  }

  const generalQuestions: InterviewQuestion[] = [
    { id: 901, question: 'Tell me about yourself and your career journey.', type: 'general', category: 'behavioral', timeLimit: 120, difficulty: 'beginner', keywords: ['background', 'experience', 'motivation', 'career', 'growth'], hints: ['Keep it professional', 'Highlight relevant experience', 'Show enthusiasm'] },
    { id: 902, question: 'What are your greatest strengths and how have they helped you in your career?', type: 'general', category: 'behavioral', timeLimit: 120, difficulty: 'beginner', keywords: ['strengths', 'examples', 'impact', 'self-awareness', 'growth'], hints: ['Be specific', 'Give examples', 'Connect to the role'] },
    { id: 903, question: 'Why are you interested in this role? What excites you about it?', type: 'general', category: 'culture_fit', timeLimit: 120, difficulty: 'beginner', keywords: ['motivation', 'company', 'role', 'growth', 'alignment'], hints: ['Research the company', 'Be genuine', 'Connect to your goals'] },
    { id: 904, question: 'Where do you see yourself in 5 years? How does this role fit into your plan?', type: 'general', category: 'behavioral', timeLimit: 120, difficulty: 'intermediate', keywords: ['goals', 'growth', 'ambition', 'alignment', 'plan'], hints: ['Show ambition but be realistic', 'Connect to this role', 'Demonstrate growth mindset'] },
    { id: 905, question: 'Describe a conflict you resolved at work. What was your approach?', type: 'general', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['conflict', 'resolution', 'communication', 'empathy', 'compromise'], hints: ['Stay professional', 'Focus on resolution', 'Show empathy'] },
    { id: 906, question: 'How do you handle tight deadlines and high-pressure situations?', type: 'general', category: 'situational', timeLimit: 120, difficulty: 'intermediate', keywords: ['prioritization', 'time management', 'stress', 'focus', 'communication'], hints: ['Show structured approach', 'Mention prioritization', 'Give a real example'] },
    { id: 907, question: 'What motivates you in your career? What keeps you going?', type: 'general', category: 'culture_fit', timeLimit: 120, difficulty: 'beginner', keywords: ['motivation', 'passion', 'purpose', 'growth', 'impact'], hints: ['Be genuine', 'Connect to values', 'Show enthusiasm'] },
    { id: 908, question: 'Tell me about a failure and what you learned from it.', type: 'general', category: 'behavioral', timeLimit: 150, difficulty: 'intermediate', keywords: ['failure', 'learning', 'growth', 'resilience', 'reflection'], hints: ['Be honest', 'Focus on learning', 'Show self-awareness'] },
  ]

  const roleSpecific = questionBank[jobRole] || questionBank['Software Engineer']

  // Select questions based on difficulty
  const count = difficulty === 'beginner' ? 6 : difficulty === 'advanced' ? 10 : 8
  const roleCount = Math.max(count - 2, 3)
  const generalCount = count - roleCount

  // Filter by difficulty for role-specific
  const filtered = difficulty === 'beginner'
    ? roleSpecific.filter(q => q.difficulty === 'beginner' || q.difficulty === 'intermediate').concat(roleSpecific.filter(q => q.difficulty === 'advanced'))
    : difficulty === 'advanced'
    ? roleSpecific.filter(q => q.difficulty === 'advanced' || q.difficulty === 'intermediate').concat(roleSpecific.filter(q => q.difficulty === 'beginner'))
    : roleSpecific

  const selected = filtered.slice(0, roleCount).map((q, i) => ({ ...q, id: i + 1 }))
  const selectedGeneral = generalQuestions.slice(0, generalCount).map((q, i) => ({ ...q, id: roleCount + i + 1 }))

  // Ensure category balance
  const combined = [...selected, ...selectedGeneral]
  const categories = combined.map(q => q.category)
  const hasTechnical = categories.includes('technical')
  const hasBehavioral = categories.includes('behavioral')
  const hasSituational = categories.includes('situational')
  const hasCultureFit = categories.includes('culture_fit')

  // Add situational if missing
  if (!hasSituational && selected.length < roleSpecific.length) {
    const situationalQ = roleSpecific.find(q => q.category === 'situational' && !combined.some(c => c.question === q.question))
    if (situationalQ) {
      combined[combined.length - 1] = { ...situationalQ, id: combined.length }
    }
  }

  // Add culture fit if missing
  if (!hasCultureFit && selectedGeneral.length < generalQuestions.length) {
    const cultureQ = generalQuestions.find(q => q.category === 'culture_fit' && !combined.some(c => c.question === q.question))
    if (cultureQ) {
      combined[combined.length - 1] = { ...cultureQ, id: combined.length }
    }
  }

  return combined
}

// ─── 6-Competency Scoring Engine ──────────────────────────────

function scoreIndividualAnswer(answer: AnswerSubmission): Record<string, number> {
  const text = (answer.text || '').toLowerCase()
  const wordCount = answer.text?.split(/\s+/).filter(Boolean).length || 0

  // Communication (30% weight): word count, structure, clarity
  const hasStructure = text.includes('first') || text.includes('second') || text.includes('finally') || text.includes('for example') || text.includes('additionally')
  const hasClarity = text.includes('specifically') || text.includes('in other words') || text.includes('that means') || text.includes('to illustrate')
  const communicationScore = Math.min(100, Math.max(15,
    wordCount < 10 ? 15 :
    wordCount < 30 ? 35 + (wordCount / 30) * 25 :
    60 + (Math.min(wordCount, 200) / 200) * 25
    + (hasStructure ? 8 : 0)
    + (hasClarity ? 7 : 0)
  ))

  // Technical Knowledge (25% weight): keyword matching, depth
  const techKeywords = ['algorithm', 'system', 'design', 'architecture', 'database', 'api', 'framework', 'testing', 'deploy', 'optimize', 'scalable', 'performance', 'security', 'data', 'model', 'infrastructure', 'microservice', 'cloud', 'pipeline', 'monitoring', 'debugging', 'refactor', 'agile', 'scrum']
  const techMatches = techKeywords.filter(k => text.includes(k)).length
  const hasDepth = text.includes('because') || text.includes('the reason') || text.includes('due to') || text.includes('as a result')
  const technicalScore = Math.min(100, Math.max(15, 30 + techMatches * 8 + (hasDepth ? 15 : 0) + Math.min(wordCount, 150) / 150 * 15))

  // Problem Solving (20% weight): analytical approach, structured thinking
  const analyticalKeywords = ['analyze', 'approach', 'solution', 'identify', 'evaluate', 'strategy', 'step by step', 'break down', 'root cause', 'investigate', 'systematic', 'method']
  const analyticalMatches = analyticalKeywords.filter(k => text.includes(k)).length
  const hasApproach = text.includes('first,') || text.includes('then,') || text.includes('next,') || text.includes('i would start') || text.includes('my approach')
  const problemSolvingScore = Math.min(100, Math.max(15, 30 + analyticalMatches * 10 + (hasApproach ? 15 : 0) + Math.min(wordCount, 120) / 120 * 10))

  // Leadership (10% weight): leadership keywords, team references
  const leadershipKeywords = ['led', 'managed', 'initiative', 'mentored', 'delegated', 'influenced', 'drove', 'spearheaded', 'coordinated', 'guided', 'team', 'responsibility']
  const leadershipMatches = leadershipKeywords.filter(k => text.includes(k)).length
  const hasTeamRef = text.includes('team') || text.includes('colleagues') || text.includes('stakeholders') || text.includes('collaboration')
  const leadershipScore = Math.min(100, Math.max(15, 30 + leadershipMatches * 10 + (hasTeamRef ? 15 : 0)))

  // Culture Fit (10% weight): values alignment, collaboration
  const cultureKeywords = ['collaborate', 'value', 'culture', 'mission', 'shared', 'contribute', 'align', 'growth', 'learning', 'inclusive', 'diversity', 'feedback', 'empathy', 'respect']
  const cultureMatches = cultureKeywords.filter(k => text.includes(k)).length
  const showsAlignment = text.includes('align') || text.includes('believe') || text.includes('important to me') || text.includes('passionate')
  const cultureFitScore = Math.min(100, Math.max(15, 30 + cultureMatches * 10 + (showsAlignment ? 15 : 0)))

  // Confidence (5% weight): assertive language, specificity
  const confidentWords = ['achieved', 'delivered', 'improved', 'implemented', 'created', 'built', 'solved', 'established', 'exceeded', 'accomplished', 'successfully']
  const confidentMatches = confidentWords.filter(w => text.includes(w)).length
  const hasSpecifics = /\d+%|\d+\s*(users|customers|team|projects|revenue|performance)/.test(text)
  const confidenceScore = Math.min(100, Math.max(15, 30 + confidentMatches * 10 + (hasSpecifics ? 20 : 0)))

  return {
    communication: Math.round(communicationScore),
    technical: Math.round(technicalScore),
    problemSolving: Math.round(problemSolvingScore),
    leadership: Math.round(leadershipScore),
    cultureFit: Math.round(cultureFitScore),
    confidence: Math.round(confidenceScore),
  }
}

function calculateFullCompetencyScores(responses: any[]): CompetencyScores {
  if (!responses || responses.length === 0) {
    return { communication: 0, technical: 0, problemSolving: 0, leadership: 0, cultureFit: 0, confidence: 0, overall: 0 }
  }

  let communicationTotal = 0
  let technicalTotal = 0
  let problemSolvingTotal = 0
  let leadershipTotal = 0
  let cultureFitTotal = 0
  let confidenceTotal = 0

  responses.forEach((response) => {
    const answer: AnswerSubmission = {
      questionId: response.questionId,
      text: response.text || '',
      question: response.question || '',
      category: response.category || 'technical',
      timeTaken: response.timeTaken || 60,
    }
    const scores = scoreIndividualAnswer(answer)
    communicationTotal += scores.communication
    technicalTotal += scores.technical
    problemSolvingTotal += scores.problemSolving
    leadershipTotal += scores.leadership
    cultureFitTotal += scores.cultureFit
    confidenceTotal += scores.confidence
  })

  const count = responses.length
  const communication = Math.round(communicationTotal / count)
  const technical = Math.round(technicalTotal / count)
  const problemSolving = Math.round(problemSolvingTotal / count)
  const leadership = Math.round(leadershipTotal / count)
  const cultureFit = Math.round(cultureFitTotal / count)
  const confidence = Math.round(confidenceTotal / count)

  // Weighted overall score
  const overall = Math.round(
    communication * 0.30 +
    technical * 0.25 +
    problemSolving * 0.20 +
    leadership * 0.10 +
    cultureFit * 0.10 +
    confidence * 0.05
  )

  return { communication, technical, problemSolving, leadership, cultureFit, confidence, overall }
}

// ─── Question Adaptation ──────────────────────────────────────

function determineQuestionAdaptation(scores: CompetencyScores): { direction: string; focusCategory: string; difficulty: string } {
  // Find weakest area
  const competencyMap = [
    { name: 'technical', score: scores.technical, focus: 'technical', difficulty: 'easier' },
    { name: 'communication', score: scores.communication, focus: 'behavioral', difficulty: 'standard' },
    { name: 'problemSolving', score: scores.problemSolving, focus: 'situational', difficulty: 'standard' },
    { name: 'leadership', score: scores.leadership, focus: 'behavioral', difficulty: 'standard' },
    { name: 'cultureFit', score: scores.cultureFit, focus: 'culture_fit', difficulty: 'standard' },
    { name: 'confidence', score: scores.confidence, focus: 'behavioral', difficulty: 'standard' },
  ]

  const weakest = competencyMap.sort((a, b) => a.score - b.score)[0]
  const strongest = competencyMap.sort((a, b) => b.score - a.score)[0]

  if (weakest.score < 40) {
    return { direction: 'reinforce_weak', focusCategory: weakest.focus, difficulty: weakest.difficulty }
  }

  if (strongest.score > 80) {
    return { direction: 'challenge_strong', focusCategory: strongest.focus, difficulty: 'advanced' }
  }

  return { direction: 'balanced', focusCategory: 'mixed', difficulty: 'standard' }
}

// ─── Real-time Hints ──────────────────────────────────────────

function generateRealTimeHints(answer: AnswerSubmission, scores: Record<string, number>): string[] {
  const hints: string[] = []
  const wordCount = answer.text?.split(/\s+/).filter(Boolean).length || 0

  if (wordCount < 30) {
    hints.push('Try to elaborate more - aim for at least 50-100 words for a thorough response')
  }
  if (scores.communication < 50) {
    hints.push('Structure your answer using the STAR method: Situation, Task, Action, Result')
  }
  if (scores.technical < 40 && answer.category === 'technical') {
    hints.push('Include specific technical details, tools, or methodologies you used')
  }
  if (scores.problemSolving < 40) {
    hints.push('Describe your step-by-step approach to solving the problem')
  }
  if (scores.leadership < 40) {
    hints.push('Mention how you guided or influenced others in this situation')
  }
  if (scores.confidence < 40) {
    hints.push('Use more assertive language like "I led", "I achieved", "I delivered"')
  }

  return hints.length > 0 ? hints : ['Good response! Keep going with this level of detail.']
}

// ─── Report Generation ────────────────────────────────────────

function generateRecommendation(overallScore: number): string {
  if (overallScore >= 85) return 'Strong Hire'
  if (overallScore >= 70) return 'Hire'
  if (overallScore >= 55) return 'No-Hire'
  return 'No-Hire'
}

function identifyStrengths(scores: CompetencyScores): string[] {
  const strengths: string[] = []
  const entries = [
    { name: 'Communication', score: scores.communication, desc: 'Strong articulation and structured responses' },
    { name: 'Technical Knowledge', score: scores.technical, desc: 'Deep technical understanding and relevant expertise' },
    { name: 'Problem Solving', score: scores.problemSolving, desc: 'Effective analytical and systematic approach' },
    { name: 'Leadership', score: scores.leadership, desc: 'Natural leadership qualities and team influence' },
    { name: 'Culture Fit', score: scores.cultureFit, desc: 'Strong alignment with organizational values' },
    { name: 'Confidence', score: scores.confidence, desc: 'Assertive communication with specific achievements' },
  ]

  entries
    .filter(e => e.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .forEach(e => strengths.push(e.desc))

  if (strengths.length === 0) {
    strengths.push('Shows willingness to attempt all questions')
  }

  return strengths
}

function identifyImprovements(scores: CompetencyScores): string[] {
  const improvements: string[] = []
  const entries = [
    { name: 'Communication', score: scores.communication, desc: 'Add more structure using the STAR method (Situation, Task, Action, Result)' },
    { name: 'Technical Knowledge', score: scores.technical, desc: 'Include more specific technical details and examples in responses' },
    { name: 'Problem Solving', score: scores.problemSolving, desc: 'Describe step-by-step approaches to problem-solving scenarios' },
    { name: 'Leadership', score: scores.leadership, desc: 'Highlight instances where you led initiatives or influenced outcomes' },
    { name: 'Culture Fit', score: scores.cultureFit, desc: 'Better articulate how your values align with the organization' },
    { name: 'Confidence', score: scores.confidence, desc: 'Use more assertive language and include quantifiable achievements' },
  ]

  entries
    .filter(e => e.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .forEach(e => improvements.push(e.desc))

  if (improvements.length === 0) {
    improvements.push('Continue refining responses with even more specific examples')
  }

  return improvements
}

function generateTranscript(responses: any[]): { question: string; answer: string; category: string; timeTaken: number }[] {
  return (responses || []).map((r, i) => ({
    question: r.question || `Question ${i + 1}`,
    answer: r.text || '(No response)',
    category: r.category || 'general',
    timeTaken: r.timeTaken || 0,
  }))
}

function generatePerQuestionBreakdown(responses: any[]): { question: string; category: string; scores: Record<string, number>; feedback: string }[] {
  return (responses || []).map((r, i) => {
    const answer: AnswerSubmission = {
      questionId: r.questionId || i,
      text: r.text || '',
      question: r.question || '',
      category: r.category || 'general',
      timeTaken: r.timeTaken || 60,
    }
    const scores = scoreIndividualAnswer(answer)
    const feedback = generatePerQuestionFeedback(scores, answer)
    return {
      question: answer.question,
      category: answer.category,
      scores,
      feedback,
    }
  })
}

function generatePerQuestionFeedback(scores: Record<string, number>, answer: AnswerSubmission): string {
  const wordCount = answer.text?.split(/\s+/).filter(Boolean).length || 0
  const parts: string[] = []

  if (wordCount < 20) {
    parts.push('Response was very brief')
  } else if (wordCount >= 100) {
    parts.push('Good response length with substantial detail')
  }

  const topScore = Object.entries(scores).sort(([,a], [,b]) => b - a)[0]
  const lowScore = Object.entries(scores).sort(([,a], [,b]) => a - b)[0]

  if (topScore && topScore[1] >= 60) {
    parts.push(`Strong ${topScore[0]} skills demonstrated`)
  }
  if (lowScore && lowScore[1] < 40) {
    parts.push(`Could improve on ${lowScore[0]} aspects`)
  }

  return parts.length > 0 ? parts.join('. ') + '.' : 'Average response with room for improvement.'
}

function generateOverallFeedback(scores: CompetencyScores): string {
  const overall = scores.overall
  if (overall >= 85) return 'Outstanding performance! You demonstrated exceptional skills across all competencies. Your responses were well-structured, technically deep, and showed strong leadership qualities. Highly recommended for the role.'
  if (overall >= 70) return 'Strong performance! You showed solid technical knowledge and communication skills. Your responses were mostly well-structured with good examples. A few areas could benefit from more specific details and deeper technical explanation.'
  if (overall >= 55) return 'Decent performance with some good moments. Focus on structuring your answers more clearly using the STAR method. Add more specific technical details and quantify your achievements where possible. Practice articulating your problem-solving approach step by step.'
  if (overall >= 40) return 'Fair performance with significant room for improvement. Work on providing more detailed, structured responses. Prepare specific examples from your experience. Practice explaining your technical approach and decision-making process. Focus on adding concrete numbers and outcomes to your answers.'
  return 'Needs substantial improvement. Practice articulating your thoughts clearly and concisely. Prepare STAR-format stories for behavioral questions. Brush up on technical fundamentals for your role. Work on confident, assertive communication with specific examples and measurable outcomes.'
}
