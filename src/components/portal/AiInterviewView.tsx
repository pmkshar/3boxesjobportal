'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Play, Clock, ChevronRight, ChevronLeft, CheckCircle2,
  RotateCcw, BarChart3, MessageSquare, Target, Award, Mic, MicOff,
  Camera, CameraOff, Monitor, AlertTriangle, Shield, FileText,
  Download, TrendingUp, Lightbulb, Users, Star, Video, Volume2,
  VolumeX, ArrowRight, ArrowLeft, Pause, SkipForward, Eye,
  Calendar, Building2, MapPin, Briefcase, ChevronDown, Sparkles,
  ThumbsUp, ThumbsDown, Minus, Loader2, Zap, Heart, Handshake,
  ListChecks, Timer, Search, Filter,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────

type InterviewPhase = 'dashboard' | 'lobby' | 'device-check' | 'consent' | 'interview' | 'results' | 'history'

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

interface AnswerRecord {
  questionId: number
  text: string
  question: string
  category: string
  timeTaken: number
  score?: Record<string, number>
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

interface InterviewSession {
  id: string
  jobRole: string
  industry?: string
  difficulty: string
  overallScore?: number
  communicationScore?: number
  technicalScore?: number
  problemSolvingScore?: number
  leadershipScore?: number
  cultureFitScore?: number
  confidenceScore?: number
  recommendation?: string
  aiFeedback?: string
  status: string
  createdAt: string
  completedAt?: string
  duration?: number
}

// ─── Speech Recognition Types ────────────────────────────────

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

// ─── Main Component ──────────────────────────────────────────

export function AiInterviewView() {
  const { user } = useAuthStore()
  const { theme } = useTheme()

  // Phase management
  const [phase, setPhase] = useState<InterviewPhase>('dashboard')

  // Interview setup
  const [jobRole, setJobRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [responses, setResponses] = useState<AnswerRecord[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [timer, setTimer] = useState(120)
  const [isPaused, setIsPaused] = useState(false)
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0)

  // Results state
  const [results, setResults] = useState<any>(null)
  const [scores, setScores] = useState<CompetencyScores | null>(null)
  const [transcript, setTranscript] = useState<any[]>([])
  const [strengths, setStrengths] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [perQuestion, setPerQuestion] = useState<any[]>([])
  const [recommendation, setRecommendation] = useState('')
  const [feedback, setFeedback] = useState('')

  // History state
  const [history, setHistory] = useState<InterviewSession[]>([])
  const [historyFilter, setHistoryFilter] = useState('all')

  // Device check state
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [audioLevel, setAudioLevel] = useState(0)
  const [browserSupported, setBrowserSupported] = useState(true)
  const [webrtcSupported, setWebrtcSupported] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  // Consent state
  const [recordingConsent, setRecordingConsent] = useState(false)
  const [aiConsent, setAiConsent] = useState(false)
  const [dataConsent, setDataConsent] = useState(false)

  // Speech-to-text state
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptBufferRef = useRef<string>('')

  // Loading states
  const [loading, setLoading] = useState(false)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  // Real-time hints
  const [liveHints, setLiveHints] = useState<string[]>([])
  const [runningScores, setRunningScores] = useState<CompetencyScores | null>(null)

  // Transcript view in results
  const [showTranscript, setShowTranscript] = useState(false)

  // ─── Effects ───────────────────────────────────────────────

  useEffect(() => {
    if (user) loadHistory()
  }, [user])

  useEffect(() => {
    // Check browser support
    const hasSpeech = !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
    setSpeechSupported(hasSpeech)
    const hasWebRTC = !!(window as any).RTCPeerConnection
    setWebrtcSupported(hasWebRTC)
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    const isFirefox = /Firefox/.test(navigator.userAgent)
    const isEdge = /Edg/.test(navigator.userAgent)
    setBrowserSupported(isChrome || isFirefox || isEdge)
  }, [])

  // Timer effect
  useEffect(() => {
    if (phase === 'interview' && timer > 0 && !isPaused) {
      const t = setInterval(() => setTimer(prev => prev - 1), 1000)
      return () => clearInterval(t)
    } else if (timer === 0 && phase === 'interview' && !isPaused) {
      handleSubmitAnswer()
    }
  }, [timer, phase, isPaused])

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop())
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch {}
      }
    }
  }, [])

  // ─── Data Loading ──────────────────────────────────────────

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/ai-interview?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.sessions || [])
      }
    } catch { /* silent */ }
  }

  // ─── Interview Flow ────────────────────────────────────────

  const handleCreateSession = async () => {
    if (!jobRole || !user) {
      toast.error('Please select a job role')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userId: user.id,
          jobRole,
          industry,
          difficulty,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSessionId(data.session.id)
        setQuestions(data.questions || [])
        setResponses([])
        setCurrentQ(0)
        setCurrentResponse('')
        setRunningScores(null)
        setLiveHints(data.questions?.[0]?.hints || [])
        setPhase('lobby')
      } else {
        toast.error(data.error || 'Failed to create interview session')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinInterview = () => {
    setPhase('device-check')
  }

  // ─── Device Check ──────────────────────────────────────────

  const checkCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraPermission('granted')
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      // Stop after preview (don't keep camera running)
      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }, 5000)
    } catch {
      setCameraPermission('denied')
      toast.error('Camera access denied. You can still proceed with the interview.')
    }
  }

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission('granted')
      audioStreamRef.current = stream

      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const measureLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setAudioLevel(Math.min(100, (avg / 128) * 100))
        requestAnimationFrame(measureLevel)
      }
      measureLevel()

      // Stop after a few seconds
      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop())
        if (audioContextRef.current) {
          try { audioContextRef.current.close() } catch {}
        }
        analyserRef.current = null
        audioStreamRef.current = null
      }, 5000)
    } catch {
      setMicPermission('denied')
      toast.error('Microphone access denied. You can still type your responses.')
    }
  }

  const canProceedFromDeviceCheck = () => {
    // Allow proceeding even without camera (text-based interview is fine)
    return browserSupported
  }

  // ─── Consent ───────────────────────────────────────────────

  const allConsentsGiven = recordingConsent && aiConsent && dataConsent

  const handleStartInterview = () => {
    if (!allConsentsGiven) {
      toast.error('Please accept all consent items to proceed')
      return
    }
    const q = questions[0]
    setTimer(q?.timeLimit || 120)
    setInterviewStartTime(Date.now())
    setPhase('interview')
  }

  // ─── Speech-to-Text ────────────────────────────────────────

  const startSpeechRecognition = useCallback(() => {
    if (!speechSupported) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition() as SpeechRecognitionInstance
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      if (finalTranscript) {
        transcriptBufferRef.current += finalTranscript + ' '
        setCurrentResponse(prev => {
          const base = prev.replace(/\[.*?\]\s*$/, '')
          return base + finalTranscript + ' '
        })
      } else if (interimTranscript) {
        setCurrentResponse(prev => {
          const base = prev.replace(/\[.*?\]\s*$/, '')
          return base + `[${interimTranscript}]`
        })
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [speechSupported])

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    // Clean up interim results in response
    setCurrentResponse(prev => prev.replace(/\[.*?\]/g, ''))
  }, [])

  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopSpeechRecognition()
    } else {
      startSpeechRecognition()
    }
  }

  // ─── Interview Answer Handling ─────────────────────────────

  const handleSubmitAnswer = async () => {
    if (submittingAnswer) return

    // Stop speech recognition if active
    if (isListening) {
      stopSpeechRecognition()
    }

    const timeTaken = (questions[currentQ]?.timeLimit || 120) - timer
    const answerText = currentResponse.replace(/\[.*?\]/g, '').trim()

    const answer: AnswerRecord = {
      questionId: questions[currentQ]?.id || currentQ,
      text: answerText,
      question: questions[currentQ]?.question || '',
      category: questions[currentQ]?.category || 'technical',
      timeTaken,
    }

    setSubmittingAnswer(true)
    try {
      // Submit for real-time scoring
      const res = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          sessionId,
          answer,
          previousAnswers: responses,
        }),
      })
      const data = await res.json()

      const scoredAnswer = { ...answer, score: data.score }
      const newResponses = [...responses, scoredAnswer]
      setResponses(newResponses)

      if (data.runningScores) {
        setRunningScores(data.runningScores)
      }
      if (data.hints) {
        setLiveHints(data.hints)
      }

      // Move to next question or finish
      if (currentQ < questions.length - 1) {
        const nextQ = currentQ + 1
        setCurrentQ(nextQ)
        setCurrentResponse('')
        setTimer(questions[nextQ]?.timeLimit || 120)
        setLiveHints(questions[nextQ]?.hints || [])
      } else {
        // Finish interview
        await finishInterview(newResponses)
      }
    } catch {
      // Fallback: still record the answer
      const newResponses = [...responses, answer]
      setResponses(newResponses)
      if (currentQ < questions.length - 1) {
        const nextQ = currentQ + 1
        setCurrentQ(nextQ)
        setCurrentResponse('')
        setTimer(questions[nextQ]?.timeLimit || 120)
      } else {
        await finishInterview(newResponses)
      }
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleSkipQuestion = () => {
    if (isListening) stopSpeechRecognition()
    const answer: AnswerRecord = {
      questionId: questions[currentQ]?.id || currentQ,
      text: '(Skipped)',
      question: questions[currentQ]?.question || '',
      category: questions[currentQ]?.category || 'technical',
      timeTaken: 0,
    }
    const newResponses = [...responses, answer]
    setResponses(newResponses)

    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1
      setCurrentQ(nextQ)
      setCurrentResponse('')
      setTimer(questions[nextQ]?.timeLimit || 120)
      setLiveHints(questions[nextQ]?.hints || [])
    } else {
      finishInterview(newResponses)
    }
  }

  const finishInterview = async (allResponses: AnswerRecord[]) => {
    if (!sessionId) return
    setLoading(true)
    try {
      const duration = Math.round((Date.now() - interviewStartTime) / 1000)
      const res = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finish',
          sessionId,
          responses: allResponses,
          duration,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data.session || data)
        setScores(data.scores || data)
        setTranscript(data.transcript || [])
        setStrengths(data.strengths || [])
        setImprovements(data.improvements || [])
        setPerQuestion(data.perQuestion || [])
        setRecommendation(data.recommendation || 'Pending')
        setFeedback(data.feedback || data.aiFeedback || '')
        setPhase('results')
        loadHistory()
        toast.success('Interview completed! Check your scores.')
      } else {
        toast.error(data.error || 'Failed to complete interview')
      }
    } catch {
      toast.error('Network error. Your answers have been saved.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Utility Functions ─────────────────────────────────────

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getTimerColor = () => {
    const limit = questions[currentQ]?.timeLimit || 120
    const ratio = timer / limit
    if (ratio > 0.5) return theme.primary
    if (ratio > 0.2) return '#F59E0B'
    return '#EF4444'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="h-3.5 w-3.5" />
      case 'behavioral': return <MessageSquare className="h-3.5 w-3.5" />
      case 'situational': return <Lightbulb className="h-3.5 w-3.5" />
      case 'culture_fit': return <Heart className="h-3.5 w-3.5" />
      default: return <Brain className="h-3.5 w-3.5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return { bg: '#DBEAFE', text: '#1E40AF' }
      case 'behavioral': return { bg: theme.primaryLight, text: theme.primary }
      case 'situational': return { bg: '#FEF3C7', text: '#92400E' }
      case 'culture_fit': return { bg: '#FCE7F3', text: '#9D174D' }
      default: return { bg: '#F3F4F6', text: '#374151' }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return theme.primary
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'Strong Hire': return { bg: '#D1FAE5', text: '#065F46', icon: <ThumbsUp className="h-4 w-4" /> }
      case 'Hire': return { bg: theme.primaryLight, text: theme.primary, icon: <CheckCircle2 className="h-4 w-4" /> }
      case 'No-Hire': return { bg: '#FEE2E2', text: '#991B1B', icon: <ThumbsDown className="h-4 w-4" /> }
      default: return { bg: '#F3F4F6', text: '#374151', icon: <Minus className="h-4 w-4" /> }
    }
  }

  const wordCount = currentResponse.replace(/\[.*?\]/g, '').split(/\s+/).filter(Boolean).length

  // ─── Dashboard Stats ───────────────────────────────────────

  const dashboardStats = {
    totalInterviews: history.length,
    completed: history.filter(s => s.status === 'completed' || s.completedAt).length,
    avgScore: history.filter(s => s.overallScore).length > 0
      ? Math.round(history.filter(s => s.overallScore).reduce((a, b) => a + (b.overallScore || 0), 0) / history.filter(s => s.overallScore).length)
      : 0,
    topScore: history.length > 0 ? Math.max(...history.map(s => s.overallScore || 0)) : 0,
  }

  // ─── Render Functions ──────────────────────────────────────

  // ── Phase 1: Dashboard ────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="h-7 w-7" style={{ color: theme.primary }} />
          AI Interview Practice
        </h1>
        <p className="text-gray-500 mt-1">Practice interviews with AI-powered evaluation and real-time coaching</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: dashboardStats.totalInterviews, icon: ListChecks, color: theme.primary },
          { label: 'Completed', value: dashboardStats.completed, icon: CheckCircle2, color: '#10B981' },
          { label: 'Avg. Score', value: `${dashboardStats.avgScore}%`, icon: TrendingUp, color: '#F59E0B' },
          { label: 'Top Score', value: `${dashboardStats.topScore}%`, icon: Award, color: '#8B5CF6' },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="stat-card-hover border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start + Recent History */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Start */}
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: theme.primary }} />
              Start New Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Job Role *</Label>
              <Select value={jobRole} onValueChange={setJobRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
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
              <Label className="text-sm font-medium">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry (optional)" />
                </SelectTrigger>
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
              <Label className="text-sm font-medium">Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['beginner', 'intermediate', 'advanced'].map(d => (
                  <Button
                    key={d}
                    variant={difficulty === d ? 'default' : 'outline'}
                    size="sm"
                    style={difficulty === d ? { backgroundColor: theme.primary } : {}}
                    onClick={() => setDifficulty(d)}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              style={{ backgroundColor: theme.primary }}
              onClick={handleCreateSession}
              disabled={loading || !jobRole}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting...</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Start Interview</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card className="border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" style={{ color: theme.primary }} />
              Recent Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No interviews yet. Start your first one!</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {history.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSessionId(s.id)
                        fetchReport(s.id)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.primaryLight }}
                        >
                          <Briefcase className="h-4 w-4" style={{ color: theme.primary }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.jobRole}</p>
                          <p className="text-xs text-gray-500">
                            {s.difficulty} • {new Date(s.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.overallScore != null && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: getScoreColor(s.overallScore),
                              color: getScoreColor(s.overallScore),
                            }}
                          >
                            {s.overallScore}%
                          </Badge>
                        )}
                        <Badge
                          variant={s.completedAt || s.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                          style={s.completedAt || s.status === 'completed' ? { backgroundColor: theme.primary } : {}}
                        >
                          {s.completedAt || s.status === 'completed' ? 'Done' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {history.length > 5 && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-sm"
                style={{ color: theme.primary }}
                onClick={() => setPhase('history')}
              >
                View All Interviews <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // ── Phase 2: Candidate Lobby ──────────────────────────────
  const renderLobby = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div
            className="p-6 text-white"
            style={{ background: theme.gradient }}
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6" />
              Interview Lobby
            </h2>
            <p className="text-white/80 text-sm mt-1">You&apos;re about to begin your AI mock interview</p>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Interview Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                  <Briefcase className="h-4 w-4" style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-semibold text-gray-900">{jobRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                  <Building2 className="h-4 w-4" style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Industry</p>
                  <p className="text-sm font-semibold text-gray-900">{industry || 'General'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                  <Target className="h-4 w-4" style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Difficulty</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{difficulty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
                  <Timer className="h-4 w-4" style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Questions</p>
                  <p className="text-sm font-semibold text-gray-900">{questions.length} questions</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Interviewer */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: theme.primaryLight }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: theme.primary }}
              >
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">AI Interviewer</p>
                <p className="text-sm text-gray-500">Powered by advanced NLP • Adaptive questioning</p>
              </div>
            </div>

            {/* Quick Tips */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" style={{ color: theme.primary }} />
                Quick Tips
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: MessageSquare, tip: 'Use STAR method for behavioral questions' },
                  { icon: Target, tip: 'Be specific with examples and numbers' },
                  { icon: Mic, tip: 'You can speak or type your answers' },
                  { icon: Clock, tip: 'Manage your time per question wisely' },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <t.icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
                    <p className="text-xs text-gray-700">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPhase('dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: theme.primary }}
                onClick={handleJoinInterview}
              >
                Join Interview <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  // ── Phase 3: Device Check ─────────────────────────────────
  const renderDeviceCheck = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-4">
          <Monitor className="h-10 w-10 mx-auto mb-2" style={{ color: theme.primary }} />
          <h2 className="text-xl font-bold text-gray-900">Device Check</h2>
          <p className="text-sm text-gray-500">Let&apos;s make sure your devices are working properly</p>
        </div>

        <div className="space-y-4">
          {/* System Compatibility */}
          <Card className="border-gray-100">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" style={{ color: theme.primary }} />
                System Compatibility
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Browser Support', ok: browserSupported, detail: browserSupported ? 'Your browser is supported' : 'Use Chrome, Firefox, or Edge for best experience' },
                  { label: 'WebRTC Support', ok: webrtcSupported, detail: webrtcSupported ? 'Real-time communication available' : 'Video/audio features may be limited' },
                  { label: 'Speech Recognition', ok: speechSupported, detail: speechSupported ? 'Voice input available' : 'Speech-to-text not available (you can type responses)' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      {item.ok ? (
                        <CheckCircle2 className="h-4 w-4" style={{ color: theme.primary }} />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Camera Check */}
          <Card className="border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  {cameraPermission === 'granted' ? <Camera className="h-4 w-4" style={{ color: theme.primary }} /> : <CameraOff className="h-4 w-4 text-gray-400" />}
                  Camera
                </h4>
                <Badge
                  variant={cameraPermission === 'granted' ? 'default' : cameraPermission === 'denied' ? 'destructive' : 'secondary'}
                  style={cameraPermission === 'granted' ? { backgroundColor: theme.primary } : {}}
                >
                  {cameraPermission === 'granted' ? 'Ready' : cameraPermission === 'denied' ? 'Denied' : 'Not Checked'}
                </Badge>
              </div>
              <div className="aspect-video bg-gray-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {videoRef.current?.srcObject ? (
                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="h-8 w-8 mx-auto mb-1" />
                    <p className="text-xs">Camera preview</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={checkCamera}
                disabled={cameraPermission === 'granted'}
              >
                {cameraPermission === 'granted' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Camera Working</>
                ) : (
                  <><Camera className="h-3 w-3 mr-1" /> Test Camera</>
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-2">Camera is optional for AI interviews. You can skip this step.</p>
            </CardContent>
          </Card>

          {/* Microphone Check */}
          <Card className="border-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  {micPermission === 'granted' ? <Mic className="h-4 w-4" style={{ color: theme.primary }} /> : <MicOff className="h-4 w-4 text-gray-400" />}
                  Microphone
                </h4>
                <Badge
                  variant={micPermission === 'granted' ? 'default' : micPermission === 'denied' ? 'destructive' : 'secondary'}
                  style={micPermission === 'granted' ? { backgroundColor: theme.primary } : {}}
                >
                  {micPermission === 'granted' ? 'Ready' : micPermission === 'denied' ? 'Denied' : 'Not Checked'}
                </Badge>
              </div>

              {/* Audio Level Indicator */}
              <div className="mb-3">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: micPermission === 'granted' ? theme.primary : '#D1D5DB' }}
                    animate={{ width: `${audioLevel}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {micPermission === 'granted' ? 'Speak to test your microphone' : 'Test your microphone to enable voice input'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={checkMicrophone}
                disabled={micPermission === 'granted'}
              >
                {micPermission === 'granted' ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Microphone Working</>
                ) : (
                  <><Mic className="h-3 w-3 mr-1" /> Test Microphone</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Troubleshooting Tips */}
          <Card className="border-gray-100">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Troubleshooting Tips
              </h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Make sure no other application is using your camera/microphone</li>
                <li>• Check your browser permissions in Settings → Privacy → Camera/Microphone</li>
                <li>• Use Chrome or Edge for the best experience with speech recognition</li>
                <li>• If devices don&apos;t work, you can still complete the interview by typing answers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setPhase('lobby')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button
              className="flex-1"
              style={{ backgroundColor: theme.primary }}
              onClick={() => setPhase('consent')}
              disabled={!canProceedFromDeviceCheck()}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )

  // ── Phase 4: Consent Screen ───────────────────────────────
  const renderConsent = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-4">
          <Shield className="h-10 w-10 mx-auto mb-2" style={{ color: theme.primary }} />
          <h2 className="text-xl font-bold text-gray-900">Consent & Agreement</h2>
          <p className="text-sm text-gray-500">Please review and accept the following before starting</p>
        </div>

        <Card className="border-gray-100">
          <CardContent className="p-6 space-y-5">
            {/* Recording Consent */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Checkbox
                  id="recording"
                  checked={recordingConsent}
                  onCheckedChange={(checked) => setRecordingConsent(checked === true)}
                  className="mt-0.5"
                  style={{ borderColor: theme.primary }}
                />
                <div className="flex-1">
                  <Label htmlFor="recording" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                    <Video className="h-4 w-4 text-gray-400" />
                    Recording Consent
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    I consent to the audio/video recording of this interview session for evaluation purposes.
                    Recordings are used solely for providing feedback and improving the interview experience.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Evaluation Consent */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Checkbox
                  id="ai"
                  checked={aiConsent}
                  onCheckedChange={(checked) => setAiConsent(checked === true)}
                  className="mt-0.5"
                  style={{ borderColor: theme.primary }}
                />
                <div className="flex-1">
                  <Label htmlFor="ai" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                    <Brain className="h-4 w-4 text-gray-400" />
                    AI Evaluation Consent
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    I consent to AI-powered analysis and scoring of my interview responses.
                    The AI evaluation covers communication, technical knowledge, problem-solving,
                    leadership, culture fit, and confidence competencies.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Usage Agreement */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Checkbox
                  id="data"
                  checked={dataConsent}
                  onCheckedChange={(checked) => setDataConsent(checked === true)}
                  className="mt-0.5"
                  style={{ borderColor: theme.primary }}
                />
                <div className="flex-1">
                  <Label htmlFor="data" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    Data Usage Agreement
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    I agree that my interview data (responses, scores, transcript) may be stored and used
                    to generate performance reports and improve the interview platform. Data is handled
                    in accordance with our privacy policy.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy Policy Link */}
            <div className="flex items-center gap-2 text-sm" style={{ color: theme.primary }}>
              <Shield className="h-4 w-4" />
              <a href="#" className="underline hover:no-underline">Read our Privacy Policy</a>
            </div>

            {/* All Consents Check */}
            <div className="p-3 rounded-lg border-2 border-dashed flex items-center gap-2"
              style={{
                borderColor: allConsentsGiven ? theme.primary : '#E5E7EB',
                backgroundColor: allConsentsGiven ? theme.primaryLight : 'transparent',
              }}
            >
              {allConsentsGiven ? (
                <CheckCircle2 className="h-5 w-5" style={{ color: theme.primary }} />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <span className="text-sm font-medium" style={{ color: allConsentsGiven ? theme.primary : '#6B7280' }}>
                {allConsentsGiven ? 'All consents accepted - Ready to start!' : 'Please accept all items to proceed'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPhase('device-check')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: theme.primary }}
                onClick={handleStartInterview}
                disabled={!allConsentsGiven}
              >
                <Play className="h-4 w-4 mr-2" /> Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )

  // ── Phase 5: Live Interview ───────────────────────────────
  const renderInterview = () => {
    const question = questions[currentQ]
    const catColor = getCategoryColor(question?.category || 'technical')
    const timerColor = getTimerColor()
    const progressPct = ((currentQ + 1) / questions.length) * 100

    return (
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setPhase('dashboard')} className="text-gray-500">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="font-mono">
              Q{currentQ + 1}/{questions.length}
            </Badge>
            <Badge
              className="text-xs"
              style={{ backgroundColor: catColor.bg, color: catColor.text }}
            >
              {getCategoryIcon(question?.category)}
              <span className="ml-1 capitalize">{(question?.category || 'general').replace('_', ' ')}</span>
            </Badge>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            {isPaused ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(false)}
                style={{ color: theme.primary }}
              >
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(true)}
                className="text-gray-500"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            <Clock className="h-4 w-4" style={{ color: timerColor }} />
            <span className="font-mono font-bold text-lg" style={{ color: timerColor }}>
              {isPaused ? 'PAUSED' : formatTime(timer)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress
          value={progressPct}
          className="h-1.5"
          style={{ '--progress-color': theme.primary } as any}
        />

        {/* Main Layout: 3 columns on desktop */}
        <div className="grid lg:grid-cols-[220px_1fr_260px] gap-4">
          {/* Left: Question Timeline */}
          <Card className="border-gray-100 hidden lg:block">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-1">
                  {questions.map((q, i) => {
                    const isCompleted = i < currentQ
                    const isCurrent = i === currentQ
                    const isUpcoming = i > currentQ
                    const qCatColor = getCategoryColor(q.category)

                    return (
                      <div
                        key={q.id}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs transition-all cursor-default ${
                          isCurrent ? 'ring-1' : ''
                        }`}
                        style={isCurrent ? {
                          backgroundColor: theme.primaryLight,
                          ringColor: theme.primary,
                        } : isCompleted ? {
                          backgroundColor: '#F0FDF4',
                        } : {}}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" style={{ color: theme.primary }} />
                          ) : isCurrent ? (
                            <div
                              className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                              style={{ borderColor: theme.primary }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                            Q{i + 1}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 mt-0.5"
                            style={{ borderColor: qCatColor.bg, color: qCatColor.text, backgroundColor: qCatColor.bg + '80' }}
                          >
                            {q.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Center: Current Question & Response */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-100 overflow-hidden">
                  {/* Question header */}
                  <div className="p-4 border-b border-gray-100" style={{ backgroundColor: theme.primaryLight }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className="text-xs"
                        style={{ backgroundColor: catColor.bg, color: catColor.text }}
                      >
                        {getCategoryIcon(question?.category)}
                        <span className="ml-1 capitalize">{(question?.category || 'general').replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{question?.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" /> {question?.timeLimit}s
                      </Badge>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                      {question?.question}
                    </h2>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Hints */}
                    {question?.hints && question.hints.length > 0 && (
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
                        <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800">
                          <span className="font-medium">Hint: </span>
                          {question.hints[currentQ % question.hints.length]}
                        </div>
                      </div>
                    )}

                    {/* Response Area */}
                    <Textarea
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      placeholder="Type your response here... Be specific and use examples from your experience."
                      rows={8}
                      className="resize-none focus:ring-1"
                      style={{ '--tw-ring-color': theme.primary } as any}
                      disabled={isPaused}
                    />

                    {/* Word count + Speech button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {wordCount} words
                          {wordCount < 30 && currentResponse.length > 0 && (
                            <span className="text-amber-500 ml-1">(aim for 50+)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Speech-to-Text Button */}
                        {speechSupported && (
                          <Button
                            variant={isListening ? 'default' : 'outline'}
                            size="sm"
                            onClick={toggleSpeechRecognition}
                            style={isListening ? { backgroundColor: '#EF4444' } : {}}
                            disabled={isPaused}
                          >
                            {isListening ? (
                              <>
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <Mic className="h-4 w-4" />
                                </motion.div>
                                <span className="ml-1 text-xs">Recording...</span>
                              </>
                            ) : (
                              <>
                                <Mic className="h-4 w-4" />
                                <span className="ml-1 text-xs">Speak</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400"
                        onClick={handleSkipQuestion}
                        disabled={submittingAnswer}
                      >
                        <SkipForward className="h-4 w-4 mr-1" /> Skip
                      </Button>
                      <div className="flex-1" />
                      <Button
                        className="min-w-[140px]"
                        style={{ backgroundColor: theme.primary }}
                        onClick={handleSubmitAnswer}
                        disabled={submittingAnswer || (!currentResponse.trim() && !isListening)}
                      >
                        {submittingAnswer ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                        ) : currentQ === questions.length - 1 ? (
                          <><CheckCircle2 className="h-4 w-4 mr-2" /> Finish Interview</>
                        ) : (
                          <><ChevronRight className="h-4 w-4 mr-2" /> Next Question</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Mobile question timeline (collapsed) */}
            <div className="lg:hidden">
              <Card className="border-gray-100">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                        style={{
                          backgroundColor: i < currentQ ? theme.primary : i === currentQ ? theme.primaryLight : '#F3F4F6',
                          color: i < currentQ ? 'white' : i === currentQ ? theme.primary : '#9CA3AF',
                        }}
                      >
                        {i < currentQ ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: AI Feedback Panel */}
          <Card className="border-gray-100 hidden lg:block">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="h-3 w-3" style={{ color: theme.primary }} />
                AI Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-4">
              {/* Running Scores */}
              {runningScores && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Live Scores</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Communication', score: runningScores.communication, weight: '30%' },
                      { label: 'Technical', score: runningScores.technical, weight: '25%' },
                      { label: 'Problem Solving', score: runningScores.problemSolving, weight: '20%' },
                      { label: 'Leadership', score: runningScores.leadership, weight: '10%' },
                      { label: 'Culture Fit', score: runningScores.cultureFit, weight: '10%' },
                      { label: 'Confidence', score: runningScores.confidence, weight: '5%' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium" style={{ color: getScoreColor(item.score) }}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: getScoreColor(item.score) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Overall</span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(runningScores.overall) }}>
                      {runningScores.overall}%
                    </span>
                  </div>
                </div>
              )}

              {/* Coaching Tips */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  Coaching Tips
                </h4>
                <div className="space-y-1.5">
                  {(liveHints.length > 0 ? liveHints : question?.hints || []).map((hint, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-amber-50 text-xs text-amber-800">
                      <ChevronRight className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyword Reminder */}
              {question?.keywords && question.keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3" style={{ color: theme.primary }} />
                    Key Topics
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {question.keywords.slice(0, 6).map((kw, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] py-0 px-1.5"
                        style={{
                          borderColor: currentResponse.toLowerCase().includes(kw.toLowerCase()) ? theme.primary : '#D1D5DB',
                          color: currentResponse.toLowerCase().includes(kw.toLowerCase()) ? theme.primary : '#6B7280',
                          backgroundColor: currentResponse.toLowerCase().includes(kw.toLowerCase()) ? theme.primaryLight : 'transparent',
                        }}
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ── Phase 6: Results Screen ───────────────────────────────
  const renderResults = () => {
    const finalScores = scores || {
      communication: results?.communicationScore || 0,
      technical: results?.technicalScore || 0,
      problemSolving: results?.problemSolvingScore || 0,
      leadership: results?.leadershipScore || 0,
      cultureFit: results?.cultureFitScore || 0,
      confidence: results?.confidenceScore || 0,
      overall: results?.overallScore || 0,
    }

    const overallScore = finalScores.overall || 0
    const recStyle = getRecommendationStyle(recommendation)

    // Ring chart data
    const circumference = 2 * Math.PI * 54
    const strokeDashoffset = circumference - (overallScore / 100) * circumference

    const competencyData = [
      { label: 'Communication', score: finalScores.communication, weight: '30%', icon: MessageSquare, desc: 'Clarity, structure & articulation' },
      { label: 'Technical Knowledge', score: finalScores.technical, weight: '25%', icon: Target, desc: 'Depth & accuracy of knowledge' },
      { label: 'Problem Solving', score: finalScores.problemSolving, weight: '20%', icon: Lightbulb, desc: 'Analytical & systematic approach' },
      { label: 'Leadership', score: finalScores.leadership, weight: '10%', icon: Users, desc: 'Team influence & initiative' },
      { label: 'Culture Fit', score: finalScores.cultureFit, weight: '10%', icon: Heart, desc: 'Values alignment & collaboration' },
      { label: 'Confidence', score: finalScores.confidence, weight: '5%', icon: Star, desc: 'Assertiveness & specificity' },
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-7 w-7" style={{ color: theme.primary }} />
              Interview Results
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {results?.jobRole || jobRole} • {results?.difficulty || difficulty} •
              Completed {results?.completedAt ? new Date(results.completedAt).toLocaleDateString() : 'Today'}
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: recStyle.bg, color: recStyle.text }}
          >
            {recStyle.icon}
            <span className="font-semibold text-sm">{recommendation}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Overall Score Ring */}
          <Card className="border-gray-100">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={getScoreColor(overallScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-3xl font-bold"
                    style={{ color: getScoreColor(overallScore) }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {overallScore}%
                  </motion.span>
                  <span className="text-xs text-gray-500">Overall</span>
                </div>
              </div>

              <div className="mt-4 text-center w-full">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: recStyle.bg, color: recStyle.text }}
                >
                  {recStyle.icon} {recommendation}
                </div>
              </div>

              {results?.duration && (
                <p className="text-xs text-gray-500 mt-2">
                  Duration: {formatDuration(results.duration)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Competency Scores */}
          <Card className="border-gray-100 lg:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Competency Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid sm:grid-cols-2 gap-3">
                {competencyData.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" style={{ color: getScoreColor(item.score) }} />
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">{item.weight}</span>
                        <span className="text-sm font-bold" style={{ color: getScoreColor(item.score) }}>
                          {item.score}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getScoreColor(item.score) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gray-100">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" style={{ color: theme.primary }} />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: theme.primaryLight }}>
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: theme.primary }} />
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
                {strengths.length === 0 && <p className="text-sm text-gray-400">Complete an interview to see your strengths</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
                <TrendingUp className="h-4 w-4" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {improvements.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
                {improvements.length === 0 && <p className="text-sm text-gray-400">Great job! Keep up the excellent work.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-Question Breakdown & Transcript */}
        <Card className="border-gray-100">
          <CardContent className="p-0">
            <Tabs defaultValue="breakdown" className="w-full">
              <TabsList className="w-full rounded-none border-b border-gray-100 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="breakdown"
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                  style={{}}
                >
                  <ListChecks className="h-4 w-4 mr-1.5" /> Question Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="transcript"
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Transcript
                </TabsTrigger>
                <TabsTrigger
                  value="feedback"
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-b-2 data-[state=active]:shadow-none"
                >
                  <Brain className="h-4 w-4 mr-1.5" /> AI Feedback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="p-4">
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {perQuestion.map((pq, i) => {
                      const pqCatColor = getCategoryColor(pq.category)
                      return (
                        <div key={i} className="p-3 rounded-lg border border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">Q{i + 1}</Badge>
                              <Badge className="text-xs" style={{ backgroundColor: pqCatColor.bg, color: pqCatColor.text }}>
                                {pq.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            {pq.scores && (
                              <span className="text-sm font-bold" style={{ color: getScoreColor(pq.scores.overall || Object.values(pq.scores).reduce((a: number, b: number) => a + b, 0) / Object.values(pq.scores).length) }}>
                                {Math.round(Object.values(pq.scores).reduce((a: number, b: number) => a + b, 0) / Object.values(pq.scores).length)}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{pq.question}</p>
                          <p className="text-xs text-gray-400">{pq.feedback}</p>
                        </div>
                      )
                    })}
                    {perQuestion.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No question breakdown available</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transcript" className="p-4">
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {transcript.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: theme.primary }}
                          >
                            Q
                          </div>
                          <div className="flex-1 p-2 rounded-lg" style={{ backgroundColor: theme.primaryLight }}>
                            <p className="text-sm text-gray-800">{item.question}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 ml-8">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            A
                          </div>
                          <div className="flex-1 p-2 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-700">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {transcript.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No transcript available</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="feedback" className="p-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: theme.primaryLight }}>
                  <h4 className="font-medium flex items-center gap-2 mb-2" style={{ color: theme.primary }}>
                    <Brain className="h-5 w-5" /> AI Overall Feedback
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{feedback || 'No feedback available.'}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            className="flex-1 min-w-[120px]"
            onClick={() => {
              setPhase('dashboard')
              setJobRole('')
              setIndustry('')
              setDifficulty('intermediate')
              setSessionId(null)
              setResults(null)
              setScores(null)
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
          </Button>
          <Button
            variant="outline"
            className="flex-1 min-w-[120px]"
            onClick={() => setPhase('history')}
          >
            <BarChart3 className="h-4 w-4 mr-2" /> View History
          </Button>
          <Button
            className="flex-1 min-w-[120px]"
            style={{ backgroundColor: theme.primary }}
            onClick={() => {
              // Generate downloadable report
              const reportData = {
                session: results,
                scores: finalScores,
                strengths,
                improvements,
                recommendation,
                feedback,
                transcript,
                perQuestion,
              }
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `interview-report-${jobRole.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Report downloaded!')
            }}
          >
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>
    )
  }

  // ── Phase 7: History ──────────────────────────────────────
  const renderHistory = () => {
    const filteredHistory = historyFilter === 'all'
      ? history
      : historyFilter === 'completed'
      ? history.filter(s => s.completedAt || s.status === 'completed')
      : history.filter(s => !s.completedAt && s.status !== 'completed')

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6" style={{ color: theme.primary }} />
            Interview History
          </h2>
          <Button
            style={{ backgroundColor: theme.primary }}
            size="sm"
            onClick={() => {
              setPhase('dashboard')
              setJobRole('')
              setIndustry('')
              setDifficulty('intermediate')
            }}
          >
            <Play className="h-4 w-4 mr-1" /> New Interview
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {['all', 'completed', 'in-progress'].map(f => (
            <Button
              key={f}
              variant={historyFilter === f ? 'default' : 'outline'}
              size="sm"
              style={historyFilter === f ? { backgroundColor: theme.primary } : {}}
              onClick={() => setHistoryFilter(f)}
              className="capitalize"
            >
              {f.replace('-', ' ')}
            </Button>
          ))}
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">
              {historyFilter === 'all' ? 'No interview history yet. Start your first mock interview!' : `No ${historyFilter.replace('-', ' ')} interviews found.`}
            </p>
            <Button
              className="mt-4"
              style={{ backgroundColor: theme.primary }}
              onClick={() => setPhase('dashboard')}
            >
              <Play className="h-4 w-4 mr-2" /> Start Interview
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => fetchReport(s.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: theme.primaryLight }}
                        >
                          <Briefcase className="h-5 w-5" style={{ color: theme.primary }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{s.jobRole}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="capitalize">{s.difficulty}</span>
                            <span>•</span>
                            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                            {s.duration && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(s.duration)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.recommendation && (
                          <Badge
                            className="text-xs"
                            style={getRecommendationStyle(s.recommendation)}
                          >
                            {s.recommendation}
                          </Badge>
                        )}
                        {s.overallScore != null && (
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: getScoreColor(s.overallScore) }}>
                              {s.overallScore}%
                            </div>
                            <p className="text-[10px] text-gray-400">Overall</p>
                          </div>
                        )}
                        <Badge
                          variant={s.completedAt || s.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                          style={s.completedAt || s.status === 'completed' ? { backgroundColor: theme.primary } : {}}
                        >
                          {s.completedAt || s.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Fetch Report for History Item ─────────────────────────

  const fetchReport = async (sid: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai-interview?action=report&sessionId=${sid}`)
      const data = await res.json()
      if (res.ok) {
        setResults(data.session)
        setScores(data.scores)
        setTranscript(data.transcript || [])
        setStrengths(data.strengths || [])
        setImprovements(data.improvements || [])
        setPerQuestion(data.perQuestion || [])
        setRecommendation(data.recommendation || 'Pending')
        setFeedback(data.feedback || '')
        setSessionId(sid)
        setPhase('results')
      } else {
        toast.error(data.error || 'Failed to load report')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Main Render ──────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {phase === 'dashboard' && renderDashboard()}
      {phase === 'lobby' && renderLobby()}
      {phase === 'device-check' && renderDeviceCheck()}
      {phase === 'consent' && renderConsent()}
      {phase === 'interview' && renderInterview()}
      {phase === 'results' && renderResults()}
      {phase === 'history' && renderHistory()}

      {/* Loading Overlay */}
      {loading && phase !== 'interview' && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        </div>
      )}
    </div>
  )
}
