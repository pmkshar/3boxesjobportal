'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Brain, Play, Clock, ChevronRight, ChevronLeft, CheckCircle2,
  RotateCcw, BarChart3, MessageSquare, Target, Award, Mic,
} from 'lucide-react'

type InterviewPhase = 'setup' | 'interview' | 'results' | 'history'

export function AiInterviewView() {
  const { user } = useAuthStore()
  const [phase, setPhase] = useState<InterviewPhase>('setup')
  const [jobRole, setJobRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [responses, setResponses] = useState<any[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [timer, setTimer] = useState(120)
  const [results, setResults] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (phase === 'interview' && timer > 0) {
      const t = setInterval(() => setTimer(prev => prev - 1), 1000)
      return () => clearInterval(t)
    } else if (timer === 0 && phase === 'interview') {
      handleNextQuestion()
    }
  }, [timer, phase])

  useEffect(() => { if (user) loadHistory() }, [user])

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/ai-interview?userId=${user?.id}`)
      if (res.ok) { const data = await res.json(); setHistory(data.sessions || []) }
    } catch {}
  }

  const startInterview = async () => {
    if (!jobRole || !user) { toast.error('Please select a job role'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, jobRole, industry, difficulty }),
      })
      const data = await res.json()
      if (res.ok) {
        setSessionId(data.session.id)
        setQuestions(data.questions || [])
        setResponses([])
        setCurrentQ(0)
        setCurrentResponse('')
        setTimer(data.questions?.[0]?.timeLimit || 120)
        setPhase('interview')
      } else { toast.error(data.error || 'Failed to start interview') }
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  const handleNextQuestion = () => {
    const newResponses = [...responses, { questionId: questions[currentQ]?.id, text: currentResponse, question: questions[currentQ]?.question }]
    setResponses(newResponses)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setCurrentResponse('')
      setTimer(questions[currentQ + 1]?.timeLimit || 120)
    } else {
      finishInterview(newResponses)
    }
  }

  const finishInterview = async (allResponses: any[]) => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai-interview', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responses: allResponses }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data.session)
        setPhase('results')
        loadHistory()
        toast.success('Interview completed! Check your scores.')
      }
    } catch { toast.error('Failed to submit interview') }
    finally { setLoading(false) }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (phase === 'setup') {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-emerald-600" /> AI Mock Interview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Practice interviews with our AI interviewer. Get instant feedback on communication, technical knowledge, and confidence.</p>

            <div>
              <Label>Job Role *</Label>
              <Select value={jobRole} onValueChange={setJobRole}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select target role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                  <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                  <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select industry (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">Information Technology</SelectItem>
                  <SelectItem value="Finance">Finance & Banking</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['beginner', 'intermediate', 'advanced'].map(d => (
                  <Button key={d} variant={difficulty === d ? 'default' : 'outline'}
                    className={difficulty === d ? 'bg-emerald-600' : ''} onClick={() => setDifficulty(d)}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={startInterview} disabled={loading}>
              <Play className="h-4 w-4 mr-2" /> {loading ? 'Starting...' : 'Start Interview'}
            </Button>

            {history.length > 0 && (
              <Button variant="outline" className="w-full" onClick={() => setPhase('history')}>
                <Clock className="h-4 w-4 mr-2" /> View Past Interviews ({history.length})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (phase === 'interview') {
    const question = questions[currentQ]
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline">Question {currentQ + 1} of {questions.length}</Badge>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${timer < 30 ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`font-mono font-bold ${timer < 30 ? 'text-red-500' : ''}`}>{formatTime(timer)}</span>
          </div>
        </div>

        <Progress value={((currentQ + 1) / questions.length) * 100} className="h-1" />

        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-6">
              <Badge className="mb-3 bg-emerald-100 text-emerald-700">{question?.category || 'General'}</Badge>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{question?.question}</h2>
              <Textarea value={currentResponse} onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Type your response here... Be specific and use examples from your experience."
                rows={8} className="resize-none" autoFocus />
              <p className="text-xs text-gray-400 mt-1">{currentResponse.split(/\s+/).filter(Boolean).length} words</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-end gap-2">
          {currentQ > 0 && (
            <Button variant="outline" onClick={() => { setCurrentQ(currentQ - 1); setCurrentResponse(responses[currentQ - 1]?.text || ''); }}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
          )}
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleNextQuestion} disabled={loading}>
            {currentQ === questions.length - 1 ? (loading ? 'Submitting...' : 'Finish Interview') : 'Next Question'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'results' && results) {
    const scoreColor = (score: number) => score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-emerald-600" /> Interview Results
            </CardTitle>
            <p className="text-sm text-gray-500">{results.jobRole} - {results.difficulty}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${scoreColor(results.overallScore || 0)}`}>
                {results.overallScore || 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Overall Score</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Communication', score: results.communicationScore || 0, icon: MessageSquare },
                { label: 'Technical', score: results.technicalScore || 0, icon: Target },
                { label: 'Confidence', score: results.confidenceScore || 0, icon: Brain },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                  <item.icon className={`h-5 w-5 mx-auto mb-1 ${scoreColor(item.score)}`} />
                  <div className={`text-xl font-bold ${scoreColor(item.score)}`}>{item.score}%</div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>

            {results.aiFeedback && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-1">
                  <Brain className="h-4 w-4" /> AI Feedback
                </h4>
                <p className="text-sm text-gray-700">{results.aiFeedback}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPhase('setup')}>
                <RotateCcw className="h-4 w-4 mr-1" /> Practice Again
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setPhase('history')}>
                <BarChart3 className="h-4 w-4 mr-1" /> View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // History
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Interview History</h2>
        <Button variant="outline" size="sm" onClick={() => setPhase('setup')}>
          <Play className="h-4 w-4 mr-1" /> New Interview
        </Button>
      </div>
      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No interview history yet. Start your first mock interview!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{s.jobRole}</h3>
                  <p className="text-sm text-gray-500">{s.difficulty} • {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={s.overallScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                    {s.overallScore || 'N/A'}%
                  </Badge>
                  <Badge variant="outline">{s.completedAt ? 'Completed' : 'In Progress'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
