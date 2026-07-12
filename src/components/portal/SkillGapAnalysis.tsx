'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/lib/theme'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Target, BookOpen, Clock, TrendingUp, CheckCircle2, AlertTriangle,
  ArrowRight, Sparkles, ChevronRight, Star, Zap, BarChart3, Calendar,
} from 'lucide-react'

// Demo data: user's current skills with proficiency
const demoUserSkills = [
  { name: 'JavaScript', proficiency: 85 },
  { name: 'React', proficiency: 80 },
  { name: 'TypeScript', proficiency: 70 },
  { name: 'Node.js', proficiency: 65 },
  { name: 'CSS/Tailwind', proficiency: 75 },
  { name: 'SQL', proficiency: 55 },
  { name: 'Git', proficiency: 78 },
  { name: 'REST APIs', proficiency: 72 },
  { name: 'Python', proficiency: 40 },
  { name: 'Docker', proficiency: 30 },
  { name: 'AWS', proficiency: 25 },
  { name: 'System Design', proficiency: 35 },
]

// Target job roles with required skills and importance weights
const targetRoles = [
  {
    id: 'senior-frontend',
    title: 'Senior Frontend Engineer',
    requirements: [
      { skill: 'JavaScript', importance: 95, minLevel: 80 },
      { skill: 'React', importance: 90, minLevel: 85 },
      { skill: 'TypeScript', importance: 85, minLevel: 75 },
      { skill: 'CSS/Tailwind', importance: 80, minLevel: 70 },
      { skill: 'System Design', importance: 70, minLevel: 60 },
      { skill: 'REST APIs', importance: 65, minLevel: 55 },
      { skill: 'Git', importance: 60, minLevel: 60 },
      { skill: 'Testing (Jest/Cypress)', importance: 75, minLevel: 65 },
      { skill: 'Performance Optimization', importance: 70, minLevel: 60 },
      { skill: 'CI/CD', importance: 50, minLevel: 40 },
    ],
  },
  {
    id: 'fullstack-dev',
    title: 'Full-Stack Developer',
    requirements: [
      { skill: 'JavaScript', importance: 90, minLevel: 75 },
      { skill: 'React', importance: 80, minLevel: 70 },
      { skill: 'TypeScript', importance: 75, minLevel: 65 },
      { skill: 'Node.js', importance: 90, minLevel: 80 },
      { skill: 'SQL', importance: 85, minLevel: 75 },
      { skill: 'REST APIs', importance: 85, minLevel: 75 },
      { skill: 'Docker', importance: 70, minLevel: 60 },
      { skill: 'AWS', importance: 65, minLevel: 55 },
      { skill: 'System Design', importance: 80, minLevel: 70 },
      { skill: 'Git', importance: 60, minLevel: 60 },
    ],
  },
  {
    id: 'devops-eng',
    title: 'DevOps Engineer',
    requirements: [
      { skill: 'Docker', importance: 95, minLevel: 85 },
      { skill: 'AWS', importance: 90, minLevel: 80 },
      { skill: 'CI/CD', importance: 90, minLevel: 85 },
      { skill: 'Linux', importance: 85, minLevel: 80 },
      { skill: 'Kubernetes', importance: 80, minLevel: 70 },
      { skill: 'Python', importance: 70, minLevel: 60 },
      { skill: 'Terraform', importance: 75, minLevel: 65 },
      { skill: 'Monitoring (Prometheus/Grafana)', importance: 70, minLevel: 60 },
      { skill: 'Networking', importance: 65, minLevel: 55 },
      { skill: 'Shell Scripting', importance: 80, minLevel: 70 },
    ],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    requirements: [
      { skill: 'Python', importance: 95, minLevel: 85 },
      { skill: 'SQL', importance: 85, minLevel: 75 },
      { skill: 'Machine Learning', importance: 90, minLevel: 80 },
      { skill: 'Statistics', importance: 85, minLevel: 80 },
      { skill: 'Data Visualization', importance: 70, minLevel: 60 },
      { skill: 'Deep Learning', importance: 75, minLevel: 65 },
      { skill: 'R', importance: 60, minLevel: 50 },
      { skill: 'Spark', importance: 55, minLevel: 45 },
      { skill: 'NLP', importance: 65, minLevel: 55 },
      { skill: 'Feature Engineering', importance: 80, minLevel: 70 },
    ],
  },
  {
    id: 'tech-lead',
    title: 'Technical Lead',
    requirements: [
      { skill: 'System Design', importance: 95, minLevel: 85 },
      { skill: 'JavaScript', importance: 80, minLevel: 70 },
      { skill: 'Node.js', importance: 75, minLevel: 65 },
      { skill: 'AWS', importance: 75, minLevel: 65 },
      { skill: 'Team Leadership', importance: 90, minLevel: 80 },
      { skill: 'Code Review', importance: 85, minLevel: 75 },
      { skill: 'Architecture', importance: 90, minLevel: 80 },
      { skill: 'Agile/Scrum', importance: 80, minLevel: 70 },
      { skill: 'Docker', importance: 60, minLevel: 50 },
      { skill: 'Technical Writing', importance: 65, minLevel: 55 },
    ],
  },
]

// Course recommendations per skill
const skillCourses: Record<string, { title: string; duration: string; level: string; weeks: number }> = {
  'JavaScript': { title: 'Advanced JavaScript Patterns', duration: '24h', level: 'Advanced', weeks: 3 },
  'React': { title: 'React Performance & Patterns', duration: '18h', level: 'Advanced', weeks: 2 },
  'TypeScript': { title: 'TypeScript Masterclass', duration: '20h', level: 'Intermediate', weeks: 3 },
  'Node.js': { title: 'Node.js Deep Dive', duration: '22h', level: 'Advanced', weeks: 3 },
  'CSS/Tailwind': { title: 'Modern CSS & Tailwind', duration: '12h', level: 'Intermediate', weeks: 2 },
  'SQL': { title: 'Advanced SQL & Databases', duration: '16h', level: 'Intermediate', weeks: 2 },
  'Git': { title: 'Git Workflows & CI/CD', duration: '8h', level: 'Intermediate', weeks: 1 },
  'REST APIs': { title: 'API Design & Architecture', duration: '14h', level: 'Intermediate', weeks: 2 },
  'Python': { title: 'Python for Professionals', duration: '28h', level: 'Intermediate', weeks: 4 },
  'Docker': { title: 'Docker & Containerization', duration: '18h', level: 'Beginner', weeks: 3 },
  'AWS': { title: 'AWS Certified Solutions Architect', duration: '40h', level: 'Intermediate', weeks: 6 },
  'System Design': { title: 'System Design Interview Prep', duration: '20h', level: 'Advanced', weeks: 4 },
  'Testing (Jest/Cypress)': { title: 'Testing JavaScript Applications', duration: '14h', level: 'Intermediate', weeks: 2 },
  'Performance Optimization': { title: 'Web Performance Mastery', duration: '16h', level: 'Advanced', weeks: 2 },
  'CI/CD': { title: 'CI/CD Pipelines with GitHub Actions', duration: '12h', level: 'Beginner', weeks: 2 },
  'Kubernetes': { title: 'Kubernetes Fundamentals', duration: '24h', level: 'Intermediate', weeks: 4 },
  'Linux': { title: 'Linux Administration', duration: '20h', level: 'Intermediate', weeks: 3 },
  'Terraform': { title: 'Infrastructure as Code with Terraform', duration: '16h', level: 'Intermediate', weeks: 3 },
  'Machine Learning': { title: 'ML with Python', duration: '36h', level: 'Intermediate', weeks: 6 },
  'Statistics': { title: 'Statistics for Data Science', duration: '20h', level: 'Intermediate', weeks: 3 },
  'Deep Learning': { title: 'Deep Learning Specialization', duration: '40h', level: 'Advanced', weeks: 8 },
  'Data Visualization': { title: 'Data Viz with D3 & Python', duration: '16h', level: 'Intermediate', weeks: 2 },
  'Team Leadership': { title: 'Engineering Leadership', duration: '12h', level: 'Advanced', weeks: 2 },
  'Architecture': { title: 'Software Architecture Masterclass', duration: '24h', level: 'Advanced', weeks: 4 },
  'Agile/Scrum': { title: 'Agile & Scrum for Tech Leads', duration: '8h', level: 'Intermediate', weeks: 1 },
  'Code Review': { title: 'Effective Code Review Practices', duration: '6h', level: 'Intermediate', weeks: 1 },
  'Technical Writing': { title: 'Technical Writing for Engineers', duration: '10h', level: 'Beginner', weeks: 2 },
  'NLP': { title: 'Natural Language Processing', duration: '24h', level: 'Advanced', weeks: 4 },
  'Feature Engineering': { title: 'Feature Engineering for ML', duration: '16h', level: 'Intermediate', weeks: 3 },
  'R': { title: 'R Programming for Data Science', duration: '20h', level: 'Beginner', weeks: 3 },
  'Spark': { title: 'Apache Spark for Big Data', duration: '18h', level: 'Intermediate', weeks: 3 },
  'Networking': { title: 'Computer Networking Fundamentals', duration: '14h', level: 'Beginner', weeks: 2 },
  'Shell Scripting': { title: 'Bash & Shell Scripting', duration: '12h', level: 'Intermediate', weeks: 2 },
  'Monitoring (Prometheus/Grafana)': { title: 'Monitoring & Observability', duration: '14h', level: 'Intermediate', weeks: 2 },
}

type GapLevel = 'strong' | 'moderate' | 'weak' | 'missing'

interface SkillGap {
  skill: string
  current: number
  required: number
  gap: number
  gapLevel: GapLevel
  importance: number
}

interface AnalysisResult {
  readinessScore: number
  skillGaps: SkillGap[]
  learningPlan: {
    skill: string
    gapLevel: GapLevel
    gap: number
    estimatedWeeks: number
    course: { title: string; duration: string; level: string; weeks: number }
  }[]
}

function getGapLevel(current: number, required: number): GapLevel {
  if (current >= required) return 'strong'
  if (current >= required * 0.7) return 'moderate'
  if (current >= required * 0.4) return 'weak'
  return 'missing'
}

function getGapColor(level: GapLevel, theme: any): string {
  switch (level) {
    case 'strong': return '#10B981'
    case 'moderate': return '#F59E0B'
    case 'weak': return '#EF4444'
    case 'missing': return '#991B1B'
  }
}

function getGapBgClass(level: GapLevel): string {
  switch (level) {
    case 'strong': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'weak': return 'bg-red-100 text-red-700 border-red-200'
    case 'missing': return 'bg-red-200 text-red-900 border-red-300'
  }
}

function getGapLabel(level: GapLevel): string {
  switch (level) {
    case 'strong': return 'Strong'
    case 'moderate': return 'Moderate Gap'
    case 'weak': return 'Weak'
    case 'missing': return 'Missing'
  }
}

export function SkillGapAnalysis() {
  const { theme } = useTheme()
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)

  const userSkillsMap = new Map(demoUserSkills.map(s => [s.name, s.proficiency]))

  const analyzeGap = useCallback(() => {
    if (!selectedRole) {
      toast.error('Please select a target role first')
      return
    }
    setAnalyzing(true)
    setResult(null)
    setAnimatedScore(0)

    // Simulate analysis delay
    setTimeout(() => {
      const role = targetRoles.find(r => r.id === selectedRole)!
      const skillGaps: SkillGap[] = role.requirements.map(req => {
        const current = userSkillsMap.get(req.skill) || 0
        const gap = Math.max(0, req.minLevel - current)
        const gapLevel = getGapLevel(current, req.minLevel)
        return { skill: req.skill, current, required: req.minLevel, gap, gapLevel, importance: req.importance }
      })

      // Calculate readiness score: weighted average of skill satisfaction
      const totalImportance = skillGaps.reduce((sum, sg) => sum + sg.importance, 0)
      const weightedScore = skillGaps.reduce((sum, sg) => {
        const satisfaction = Math.min(1, sg.current / sg.required)
        return sum + satisfaction * sg.importance
      }, 0)
      const readinessScore = Math.round((weightedScore / totalImportance) * 100)

      // Build learning plan, sorted by gap severity and importance
      const learningPlan = skillGaps
        .filter(sg => sg.gapLevel !== 'strong')
        .sort((a, b) => {
          // Priority: missing > weak > moderate, then by importance
          const levelOrder = { missing: 0, weak: 1, moderate: 2, strong: 3 }
          if (levelOrder[a.gapLevel] !== levelOrder[b.gapLevel]) return levelOrder[a.gapLevel] - levelOrder[b.gapLevel]
          return b.importance - a.importance
        })
        .map(sg => {
          const course = skillCourses[sg.skill] || { title: `${sg.skill} Fundamentals`, duration: '20h', level: 'Intermediate', weeks: 3 }
          // Scale weeks by gap size
          const gapRatio = sg.gap / 100
          const estimatedWeeks = Math.max(1, Math.round(course.weeks * gapRatio * 1.5))
          return { skill: sg.skill, gapLevel: sg.gapLevel, gap: sg.gap, estimatedWeeks, course }
        })

      const analysisResult: AnalysisResult = { readinessScore, skillGaps, learningPlan }
      setResult(analysisResult)
      setAnalyzing(false)

      // Animate score
      let current = 0
      const target = readinessScore
      const step = Math.max(1, Math.floor(target / 40))
      const interval = setInterval(() => {
        current = Math.min(current + step, target)
        setAnimatedScore(current)
        if (current >= target) clearInterval(interval)
      }, 30)
    }, 1500)
  }, [selectedRole])

  const strongCount = result?.skillGaps.filter(sg => sg.gapLevel === 'strong').length || 0
  const moderateCount = result?.skillGaps.filter(sg => sg.gapLevel === 'moderate').length || 0
  const weakCount = result?.skillGaps.filter(sg => sg.gapLevel === 'weak').length || 0
  const missingCount = result?.skillGaps.filter(sg => sg.gapLevel === 'missing').length || 0
  const totalWeeks = result?.learningPlan.reduce((sum, lp) => sum + lp.estimatedWeeks, 0) || 0

  // SVG ring calculation
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const scoreOffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5" style={{ color: theme.primary }} />
            Skill Gap Analysis
          </h2>
          <p className="text-sm text-gray-500 mt-1">Identify skill gaps and get a personalized upskilling plan</p>
        </div>
      </div>

      {/* User Skills Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" style={{ color: theme.primary }} />
            Your Current Skills
            <Badge variant="outline" className="ml-1 text-xs">{demoUserSkills.length} skills</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {demoUserSkills.map(skill => (
              <div
                key={skill.name}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: skill.proficiency >= 70 ? theme.primaryMedium : skill.proficiency >= 40 ? '#FDE68A' : '#FECACA',
                  backgroundColor: skill.proficiency >= 70 ? theme.primaryLight : skill.proficiency >= 40 ? '#FFFBEB' : '#FEF2F2',
                  color: skill.proficiency >= 70 ? theme.primary : skill.proficiency >= 40 ? '#B45309' : '#B91C1C',
                }}
              >
                {skill.name}
                <span className="ml-1 opacity-70">{skill.proficiency}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Role Selector */}
      <Card style={{ borderColor: theme.primaryMedium }}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target Job Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a target role..." />
                </SelectTrigger>
                <SelectContent>
                  {targetRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={analyzeGap}
              disabled={analyzing || !selectedRole}
              className="w-full sm:w-auto text-white font-medium"
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
            >
              {analyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Analyze Gap
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Readiness Score + Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Animated Readiness Ring */}
            <Card className="md:col-span-1" style={{ backgroundColor: theme.primaryLight, borderColor: theme.primaryMedium }}>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="relative w-32 h-32 mb-3">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
                    <circle
                      cx="70" cy="70" r={radius}
                      fill="none"
                      stroke={animatedScore >= 70 ? theme.primary : animatedScore >= 40 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={scoreOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: animatedScore >= 70 ? theme.primary : animatedScore >= 40 ? '#B45309' : '#B91C1C' }}>
                      {animatedScore}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">out of 100</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Job Readiness Score</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {animatedScore >= 75
                    ? 'Great match! Minor improvements needed.'
                    : animatedScore >= 50
                      ? 'Good foundation. Focus on key gaps.'
                      : 'Significant upskilling recommended.'}
                </p>
              </CardContent>
            </Card>

            {/* Gap Summary Cards */}
            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" style={{ color: theme.primary }} />
                  Gap Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-2xl font-bold text-emerald-600">{strongCount}</p>
                    <p className="text-xs text-emerald-700 font-medium">Strong</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-2xl font-bold text-amber-600">{moderateCount}</p>
                    <p className="text-xs text-amber-700 font-medium">Moderate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-2xl font-bold text-red-600">{weakCount}</p>
                    <p className="text-xs text-red-700 font-medium">Weak</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-100 border border-red-300">
                    <p className="text-2xl font-bold text-red-800">{missingCount}</p>
                    <p className="text-xs text-red-900 font-medium">Missing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" style={{ color: theme.primary }} />
                  <span>Estimated upskilling time: <strong>{totalWeeks} weeks</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: theme.primary }} />
                Skill Gap Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Skill</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500">Importance</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500">Your Level</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500">Required</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 w-32">Visual</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skillGaps
                      .sort((a, b) => b.importance - a.importance)
                      .map((sg, i) => {
                        const fillPct = Math.min(100, Math.round((sg.current / sg.required) * 100))
                        const heatColor = getGapColor(sg.gapLevel, theme)
                        return (
                          <tr key={sg.skill} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                            <td className="py-2.5 px-3 font-medium text-gray-900">{sg.skill}</td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge variant="outline" className="text-[10px]">
                                {sg.importance >= 85 ? 'Critical' : sg.importance >= 65 ? 'Important' : 'Nice-to-have'}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-600">{sg.current}%</td>
                            <td className="py-2.5 px-3 text-center text-gray-600">{sg.required}%</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${fillPct}%`,
                                      backgroundColor: heatColor,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 w-8 text-right">{fillPct}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge className={`text-[10px] border ${getGapBgClass(sg.gapLevel)}`}>
                                {getGapLabel(sg.gapLevel)}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Prioritized Learning Plan */}
          {result.learningPlan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" style={{ color: theme.primary }} />
                  Prioritized Learning Plan
                  <Badge variant="outline" className="ml-1 text-xs">{result.learningPlan.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.learningPlan.map((lp, i) => (
                    <div
                      key={lp.skill}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
                      style={{ borderColor: lp.gapLevel === 'weak' || lp.gapLevel === 'missing' ? '#FECACA' : lp.gapLevel === 'moderate' ? '#FDE68A' : theme.primaryMedium }}
                    >
                      {/* Priority number */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 text-sm">{lp.skill}</h4>
                          <Badge className={`text-[10px] border ${getGapBgClass(lp.gapLevel)}`}>
                            {getGapLabel(lp.gapLevel)} ({lp.gap > 0 ? `-${lp.gap}%` : 'OK'})
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {lp.course.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lp.course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {lp.course.level}
                          </span>
                          <span className="flex items-center gap-1" style={{ color: theme.primary }}>
                            <Calendar className="h-3 w-3" />
                            ~{lp.estimatedWeeks} week{lp.estimatedWeeks > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 text-xs"
                        style={{ borderColor: theme.primaryMedium, color: theme.primary }}
                        onClick={() => toast.info(`Navigate to Training Hub to enroll in "${lp.course.title}"`)}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        View Course
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Total Time Estimate */}
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: theme.primaryLight }}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: theme.primary }} />
                    <span className="text-sm font-medium" style={{ color: theme.primary }}>
                      Estimated total upskilling time: {totalWeeks} weeks ({Math.round(totalWeeks / 4)} months)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    Following this plan could improve your readiness score to 85%+
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Strong Skills */}
          {strongCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-emerald-700 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  Skills You Already Excel At
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skillGaps.filter(sg => sg.gapLevel === 'strong').map(sg => (
                    <Badge key={sg.skill} className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {sg.skill} ({sg.current}%)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state when no analysis yet */}
      {!result && !analyzing && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-700 mb-1">Select a Target Role</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Choose a target job role above and click &quot;Analyze Gap&quot; to see how your current skills match up and get a personalized learning plan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
