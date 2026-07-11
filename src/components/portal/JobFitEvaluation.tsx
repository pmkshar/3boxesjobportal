'use client'

import { useState, useCallback } from 'react'
import { useTheme } from '@/lib/theme'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Target, FileText, CheckCircle2, AlertTriangle, XCircle,
  ArrowRight, Sparkles, TrendingUp, Clock, BookOpen, Brain,
  Briefcase, GraduationCap, Heart, Building2, Save, History,
  ExternalLink, Zap, Star, ChevronRight,
} from 'lucide-react'

// Demo user profile
const demoProfile = {
  skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS/Tailwind', 'SQL', 'Git', 'REST APIs', 'Python', 'Docker'],
  experience: 5, // years
  education: "B.Tech Computer Science",
  values: ['Innovation', 'Work-life balance', 'Continuous learning', 'Team collaboration'],
}

// Demo job descriptions for quick testing
const sampleJobDescriptions = [
  {
    label: 'Senior Frontend Engineer at Google',
    text: `We are looking for a Senior Frontend Engineer to join our Web Platform team.

Requirements:
- 5+ years of experience in JavaScript, TypeScript, and modern frontend frameworks (React, Angular, or Vue)
- Strong expertise in CSS, HTML5, and responsive design
- Experience with performance optimization and web vitals
- Familiarity with testing frameworks (Jest, Cypress)
- Bachelor's degree in Computer Science or equivalent
- Excellent communication and collaboration skills
- Experience with CI/CD pipelines and version control (Git)

Nice to have:
- Experience with WebGL or Canvas
- Knowledge of accessibility standards (WCAG)
- Contributions to open source projects

Culture: We value innovation, user-centric design, and psychological safety. Our team practices agile methodologies and believes in continuous learning.`,
  },
  {
    label: 'Full-Stack Developer at Startup',
    text: `Join our fast-growing startup as a Full-Stack Developer!

Required Skills:
- React or Vue.js for frontend development
- Node.js or Python for backend services
- PostgreSQL or MongoDB experience
- RESTful API design and implementation
- Docker and basic DevOps knowledge
- 3+ years of professional experience

Education: Bachelor's degree preferred but not required - we value skills over credentials

We offer: Flexible hours, remote-first culture, equity options, learning budget
Culture: Move fast, iterate, take ownership, support each other`,
  },
  {
    label: 'DevOps Engineer at Amazon',
    text: `DevOps Engineer - AWS Infrastructure Team

Must-have:
- 4+ years of DevOps/SRE experience
- Expert in AWS services (EC2, S3, Lambda, ECS, CloudFormation)
- Strong Linux administration skills
- Proficiency in Python or Shell scripting
- Experience with Docker and Kubernetes
- CI/CD pipeline design (Jenkins, CodePipeline)
- Monitoring tools (CloudWatch, Prometheus, Grafana)
- Bachelor's in CS, IT, or related field

Culture: Customer obsession, ownership, bias for action, frugality. We value data-driven decisions and operational excellence.`,
  },
]

interface ParsedJob {
  skills: string[]
  experienceRequired: number
  educationRequired: string
  cultureValues: string[]
  title: string
  company: string
}

interface FitResult {
  overallScore: number
  skillsMatch: number
  experienceMatch: number
  educationMatch: number
  cultureMatch: number
  strengths: string[]
  gaps: string[]
  matchedSkills: string[]
  missingSkills: string[]
  parsedJob: ParsedJob
}

interface HistoryEntry {
  id: string
  jobTitle: string
  company: string
  overallScore: number
  timestamp: Date
  result: FitResult
}

// Simple job description parser (simulated AI)
function parseJobDescription(text: string): ParsedJob {
  const lower = text.toLowerCase()

  // Extract skills from common keywords
  const skillKeywords = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'nodejs',
    'python', 'java', 'go', 'rust', 'css', 'html5', 'tailwind', 'sql', 'postgresql',
    'mongodb', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'rest', 'restful',
    'graphql', 'ci/cd', 'jenkins', 'linux', 'shell', 'jest', 'cypress', 'testing',
    'webgl', 'canvas', 'accessibility', 'wcag', 'cloudformation', 'terraform',
    'lambda', 'ecs', 's3', 'ec2', 'prometheus', 'grafana', 'cloudwatch',
    'microservices', 'agile', 'devops', 'sre', 'redis', 'elasticsearch',
  ]

  const foundSkills: string[] = []
  skillKeywords.forEach(skill => {
    if (lower.includes(skill)) {
      // Normalize skill names
      const normalized = skill.charAt(0).toUpperCase() + skill.slice(1)
      foundSkills.push(normalized)
    }
  })

  // Also check for compound terms
  if (lower.includes('performance optimization') || lower.includes('web vitals')) foundSkills.push('Performance Optimization')
  if (lower.includes('responsive design')) foundSkills.push('Responsive Design')
  if (lower.includes('open source')) foundSkills.push('Open Source')

  // Extract experience
  const expMatch = lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i)
    || lower.match(/(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:professional|work)/i)
  const experienceRequired = expMatch ? parseInt(expMatch[1]) : 2

  // Extract education
  let educationRequired = 'Not specified'
  if (lower.includes("bachelor's") || lower.includes('b.tech') || lower.includes('bsc') || lower.includes('b.s.')) {
    educationRequired = "Bachelor's degree"
  }
  if (lower.includes("master's") || lower.includes('m.tech') || lower.includes('msc') || lower.includes('m.s.')) {
    educationRequired = "Master's degree"
  }
  if (lower.includes('phd') || lower.includes('ph.d')) {
    educationRequired = 'PhD'
  }

  // Extract culture values
  const cultureKeywords = ['innovation', 'collaboration', 'ownership', 'customer obsession',
    'agile', 'continuous learning', 'work-life balance', 'remote', 'flexible',
    'data-driven', 'user-centric', 'psychological safety', 'frugality',
    'bias for action', 'operational excellence', 'iterat', 'move fast', 'support']
  const cultureValues = cultureKeywords.filter(kw => lower.includes(kw))

  // Extract title and company (simple heuristic)
  const titleMatch = text.match(/(?:senior|junior|lead|staff|principal)?\s*(?:frontend|backend|fullstack|full-stack|devops|data|software|web|cloud|platform)\s*(?:engineer|developer|scientist|architect)/i)
  const title = titleMatch ? titleMatch[0].trim() : 'Unknown Position'

  const companyMatch = text.match(/(?:at|join)\s+([A-Z][a-zA-Z0-9&\s]+)/)
  const company = companyMatch ? companyMatch[1].trim().split(/\s/)[0] : 'Company'

  return {
    skills: [...new Set(foundSkills)],
    experienceRequired,
    educationRequired,
    cultureValues,
    title,
    company,
  }
}

// Skill name normalization map
const skillAliases: Record<string, string> = {
  'Nodejs': 'Node.js',
  'Rest': 'REST APIs',
  'Restful': 'REST APIs',
  'Css': 'CSS/Tailwind',
  'Tailwind': 'CSS/Tailwind',
  'Postgresql': 'SQL',
  'Mongodb': 'SQL',
  'Shell': 'Shell Scripting',
  'Linux': 'Linux Administration',
}

function normalizeSkill(skill: string): string {
  return skillAliases[skill] || skill
}

// Calculate fit
function calculateFit(parsed: ParsedJob, profile: typeof demoProfile): FitResult {
  // Skills match
  const normalizedJobSkills = parsed.skills.map(normalizeSkill)
  const matchedSkills = normalizedJobSkills.filter(js => profile.skills.some(ps =>
    ps.toLowerCase() === js.toLowerCase() || ps.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(ps.toLowerCase())
  ))
  const missingSkills = normalizedJobSkills.filter(js => !profile.skills.some(ps =>
    ps.toLowerCase() === js.toLowerCase() || ps.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(ps.toLowerCase())
  ))
  const skillsMatch = normalizedJobSkills.length > 0 ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100) : 50

  // Experience match
  const expRatio = Math.min(1, profile.experience / parsed.experienceRequired)
  const experienceMatch = Math.round(expRatio * 100)

  // Education match
  let educationMatch = 60
  if (parsed.educationRequired === 'Not specified') {
    educationMatch = 80
  } else if (parsed.educationRequired === "Master's degree") {
    educationMatch = profile.education.includes('B.Tech') || profile.education.includes('M.Tech') ? 70 : 40
  } else if (parsed.educationRequired === "Bachelor's degree") {
    educationMatch = profile.education.includes('B.Tech') || profile.education.includes('B.Sc') || profile.education.includes('B.S') ? 95 : 60
  } else if (parsed.educationRequired === 'PhD') {
    educationMatch = 30
  }

  // Culture match
  const profileValues = profile.values.map(v => v.toLowerCase())
  const matchedCulture = parsed.cultureValues.filter(cv => profileValues.some(pv => pv.includes(cv) || cv.includes(pv)))
  const cultureMatch = parsed.cultureValues.length > 0 ? Math.round((matchedCulture.length / parsed.cultureValues.length) * 100) : 60

  // Overall score (weighted)
  const overallScore = Math.round(
    skillsMatch * 0.40 +
    experienceMatch * 0.25 +
    educationMatch * 0.15 +
    cultureMatch * 0.20
  )

  // Strengths
  const strengths: string[] = []
  if (skillsMatch >= 70) strengths.push(`Strong technical alignment (${matchedSkills.length}/${normalizedJobSkills.length} skills match)`)
  if (experienceMatch >= 80) strengths.push(`Experience level meets or exceeds requirements (${profile.experience} vs ${parsed.experienceRequired} years)`)
  if (educationMatch >= 80) strengths.push('Education requirements satisfied')
  if (cultureMatch >= 60) strengths.push(`Good cultural fit (${matchedCulture.length} shared values)`)
  if (matchedSkills.length > 0) strengths.push(`Key matching skills: ${matchedSkills.slice(0, 3).join(', ')}`)

  // Gaps
  const gaps: string[] = []
  if (missingSkills.length > 0) gaps.push(`Missing skills: ${missingSkills.join(', ')}`)
  if (experienceMatch < 70) gaps.push(`Need ${parsed.experienceRequired - profile.experience} more years of experience`)
  if (educationMatch < 60) gaps.push(`Education requirement: ${parsed.educationRequired}`)
  if (cultureMatch < 50) gaps.push('Limited cultural alignment - research company values')

  return {
    overallScore,
    skillsMatch,
    experienceMatch,
    educationMatch,
    cultureMatch,
    strengths,
    gaps,
    matchedSkills,
    missingSkills,
    parsedJob: parsed,
  }
}

function ScoreRing({ score, size = 80, label, color }: { score: number; size?: number; label: string; color: string }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" style={{ width: size, height: size }} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#E5E7EB" strokeWidth="6" />
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1 font-medium">{label}</span>
    </div>
  )
}

export function JobFitEvaluation() {
  const { theme } = useTheme()
  const [inputMode, setInputMode] = useState<'url' | 'text'>('text')
  const [jobUrl, setJobUrl] = useState('')
  const [jobText, setJobText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<FitResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const analyzeJob = useCallback(() => {
    const text = inputMode === 'url' ? jobUrl : jobText
    if (!text.trim()) {
      toast.error('Please enter a job URL or description')
      return
    }
    setAnalyzing(true)
    setResult(null)

    setTimeout(() => {
      // If URL mode, simulate fetching job description
      const jobDescriptionText = inputMode === 'url'
        ? `Senior Software Engineer position. Requirements: JavaScript, React, TypeScript, Node.js, AWS, 5+ years experience, Bachelor's in CS. Culture: Innovation, collaboration, continuous learning.`
        : jobText

      const parsed = parseJobDescription(jobDescriptionText)
      const fitResult = calculateFit(parsed, demoProfile)
      setResult(fitResult)
      setAnalyzing(false)

      // Save to history
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        jobTitle: parsed.title,
        company: parsed.company,
        overallScore: fitResult.overallScore,
        timestamp: new Date(),
        result: fitResult,
      }
      setHistory(prev => [entry, ...prev])
    }, 2000)
  }, [inputMode, jobUrl, jobText])

  const loadSample = (text: string) => {
    setInputMode('text')
    setJobText(text)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 75) return theme.primary
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent Fit'
    if (score >= 70) return 'Good Fit'
    if (score >= 50) return 'Moderate Fit'
    if (score >= 30) return 'Weak Fit'
    return 'Poor Fit'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5" style={{ color: theme.primary }} />
          Job Fit Evaluation
        </h2>
        <p className="text-sm text-gray-500 mt-1">Analyze how well you match a job posting before applying</p>
      </div>

      {/* Input Section */}
      <Card style={{ borderColor: theme.primaryMedium }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" style={{ color: theme.primary }} />
            Job Posting Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={inputMode === 'text' ? 'default' : 'outline'}
              onClick={() => setInputMode('text')}
              style={inputMode === 'text' ? { backgroundColor: theme.primary } : { borderColor: theme.primaryMedium, color: theme.primary }}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Paste Description
            </Button>
            <Button
              size="sm"
              variant={inputMode === 'url' ? 'default' : 'outline'}
              onClick={() => setInputMode('url')}
              style={inputMode === 'url' ? { backgroundColor: theme.primary } : { borderColor: theme.primaryMedium, color: theme.primary }}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Job URL
            </Button>
          </div>

          {inputMode === 'url' ? (
            <div>
              <Input
                placeholder="https://careers.company.com/jobs/12345"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">We&apos;ll fetch and analyze the job posting from this URL</p>
            </div>
          ) : (
            <div>
              <Textarea
                placeholder="Paste the full job description here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{jobText.length} characters</p>
            </div>
          )}

          {/* Quick sample descriptions */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Quick test with sample jobs:</p>
            <div className="flex flex-wrap gap-2">
              {sampleJobDescriptions.map((sample, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  style={{ borderColor: theme.primaryMedium, color: theme.primary }}
                  onClick={() => loadSample(sample.text)}
                >
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Analyze button */}
          <Button
            onClick={analyzeJob}
            disabled={analyzing || (!jobUrl.trim() && !jobText.trim())}
            className="w-full sm:w-auto text-white font-medium"
            style={{ backgroundColor: theme.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
          >
            {analyzing ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing Fit...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Evaluate Job Fit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryMedium }}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Main score ring */}
                <div className="relative w-36 h-36 flex-shrink-0">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                    <circle cx="72" cy="72" r="60" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                    <circle
                      cx="72" cy="72" r="60"
                      fill="none"
                      stroke={getScoreColor(result.overallScore)}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60 - (result.overallScore / 100) * 2 * Math.PI * 60}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color: getScoreColor(result.overallScore) }}>
                      {result.overallScore}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">Fit Score</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-gray-900">{result.parsedJob.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-center md:justify-start mt-1">
                    <Building2 className="h-3.5 w-3.5" /> {result.parsedJob.company}
                  </p>
                  <Badge
                    className="mt-2 text-sm px-3 py-1"
                    style={{
                      backgroundColor: getScoreColor(result.overallScore) + '20',
                      color: getScoreColor(result.overallScore),
                      borderColor: getScoreColor(result.overallScore) + '40',
                    }}
                  >
                    {getScoreLabel(result.overallScore)}
                  </Badge>

                  <div className="flex gap-2 mt-4 flex-wrap justify-center md:justify-start">
                    <Button
                      size="sm"
                      className="text-white"
                      style={{ backgroundColor: theme.primary }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
                      onClick={() => toast.success('Application submitted! Good luck! 🎉')}
                    >
                      Apply Anyway <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      style={{ borderColor: theme.primaryMedium, color: theme.primary }}
                      onClick={() => toast.info('Navigate to Skill Gap Analysis to improve your fit')}
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Improve Fit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <div className="grid md:grid-cols-4 gap-4">
            {/* Skills Match */}
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <ScoreRing score={result.skillsMatch} label="Skills Match" color={getScoreColor(result.skillsMatch)} />
                <div className="mt-2 w-full">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {result.matchedSkills.length} matched
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {result.missingSkills.length} missing
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience Match */}
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <ScoreRing score={result.experienceMatch} label="Experience Match" color={getScoreColor(result.experienceMatch)} />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="font-medium text-gray-700">{demoProfile.experience} yrs</span> vs {result.parsedJob.experienceRequired} yrs required
                </div>
              </CardContent>
            </Card>

            {/* Education Match */}
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <ScoreRing score={result.educationMatch} label="Education Match" color={getScoreColor(result.educationMatch)} />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <span className="font-medium text-gray-700">{demoProfile.education}</span>
                  <br />Required: {result.parsedJob.educationRequired}
                </div>
              </CardContent>
            </Card>

            {/* Culture Match */}
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <ScoreRing score={result.cultureMatch} label="Culture Fit" color={getScoreColor(result.cultureMatch)} />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {result.parsedJob.cultureValues.length > 0
                    ? result.parsedJob.cultureValues.slice(0, 3).map(v => (
                      <Badge key={v} variant="outline" className="text-[9px] mr-0.5 mb-0.5">{v}</Badge>
                    ))
                    : 'Not specified'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths & Gaps */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.length > 0 ? result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  )) : (
                    <li className="text-sm text-gray-500">No strong matches found</li>
                  )}
                </ul>

                {result.matchedSkills.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-100">
                    <p className="text-xs font-medium text-emerald-600 mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.map(skill => (
                        <Badge key={skill} className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gaps */}
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.gaps.length > 0 ? result.gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {g}
                    </li>
                  )) : (
                    <li className="text-sm text-gray-500">No significant gaps found!</li>
                  )}
                </ul>

                {result.missingSkills.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <p className="text-xs font-medium text-red-600 mb-2">Missing Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.map(skill => (
                        <Badge key={skill} className="bg-red-100 text-red-700 border border-red-200 text-xs">
                          <XCircle className="h-2.5 w-2.5 mr-1" /> {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendation */}
          <Card style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryMedium }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: theme.primary }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.primary }}>AI Recommendation</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {result.overallScore >= 75
                      ? 'This is a strong match! Your skills and experience align well. Consider applying with a tailored resume highlighting your matched skills.'
                      : result.overallScore >= 50
                        ? `You have a moderate fit. Focus on acquiring ${result.missingSkills.slice(0, 2).join(' and ')} to significantly improve your chances. Consider the Skill Gap Analysis tool for a detailed learning plan.`
                        : `This position has significant gaps. We recommend focusing on ${result.missingSkills.slice(0, 3).join(', ')} before applying. Use the Skill Gap Analysis for a structured upskilling path.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!result && !analyzing && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-700 mb-1">Paste a Job Description</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Enter a job posting URL or paste the description above, then click &quot;Evaluate Job Fit&quot; to see how well you match the position.
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" style={{ color: theme.primary }} />
              Evaluation History
              <Badge variant="outline" className="text-xs">{history.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: getScoreColor(entry.overallScore) }}
                    >
                      {entry.overallScore}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.jobTitle}</p>
                      <p className="text-xs text-gray-500">{entry.company} · {entry.timestamp.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setResult(entry.result)}
                  >
                    View <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
