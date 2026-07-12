'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Bot, Search, Briefcase, MapPin, IndianRupee, Clock, Building2, ExternalLink,
  FileText, Mail, CheckCircle2, XCircle, Loader2, Zap, Target, TrendingUp,
  Star, Globe, Send, Calendar, Users, ArrowUpRight, Sparkles, Brain,
  Bookmark, Share2, ChevronRight, AlertTriangle, Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ──────────────────────────────────────────────────────────────

interface BuddyAgent {
  id: string
  name: string
  status: string
  dailyLimit: number
  dailySent: number
  totalTasks: number
  totalSuccess: number
  totalFailed: number
  totalEmailsSent: number
  totalResponses: number
  totalConversions: number
  avgResponseRate: number
  lastRunAt: string | null
  createdAt: string
  strategy?: string | null
  description?: string | null
}

interface ExternalJob {
  id: string
  title: string
  company: string
  location: string
  salary: string
  source: string
  sourceUrl: string
  matchScore: number
  jobType: string
  experience: string
  skills: string[]
  postedDate: string
  applied: boolean
  applicationStatus?: string
}

interface BuddyTask {
  id: string
  type: string
  status: string
  targetCompany?: string
  targetUrl?: string
  result?: string
  createdAt: string
  completedAt?: string
}

interface BuddyEmail {
  id: string
  toEmail: string
  toName?: string
  company?: string
  subject: string
  status: string
  sentAt?: string
  repliedAt?: string
  followUpSequence: number
  createdAt: string
}

// ─── Constants ──────────────────────────────────────────────────────────

const PORTAL_NAMES = ['Naukri', 'LinkedIn', 'Indeed', 'Glassdoor', 'Foundit', 'IIMJobs', 'HackerRank Jobs']
const PORTAL_COLORS: Record<string, string> = {
  Naukri: '#4A90D9',
  LinkedIn: '#0A66C2',
  Indeed: '#2164F3',
  Glassdoor: '#0CAA41',
  Foundit: '#E84E3C',
  IIMJobs: '#8B5CF6',
  'HackerRank Jobs': '#2EC866',
}

const TASK_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  RUNNING: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

// ─── Main Component ─────────────────────────────────────────────────────

export function CandidateBuddyView() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState<BuddyAgent | null>(null)
  const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([])
  const [tasks, setTasks] = useState<BuddyTask[]>([])
  const [emails, setEmails] = useState<BuddyEmail[]>([])
  const [setupOpen, setSetupOpen] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<ExternalJob | null>(null)

  // Setup form
  const [skills, setSkills] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [preferredJobType, setPreferredJobType] = useState('all')
  const [experienceYears, setExperienceYears] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [dailyApplyLimit, setDailyApplyLimit] = useState('10')
  const [portals, setPortals] = useState<string[]>(['Naukri', 'LinkedIn', 'Indeed'])
  const [autoApply, setAutoApply] = useState(true)

  // Fetch buddy agent
  const fetchAgent = useCallback(async () => {
    try {
      const res = await fetch('/api/agents?type=CANDIDATE_BUDDY')
      if (res.ok) {
        const data = await res.json()
        const buddyAgents = (data.agents || []).filter((a: any) => a.type === 'CANDIDATE_BUDDY')
        if (buddyAgents.length > 0) {
          setAgent(buddyAgents[0])
          // Initialize form from strategy
          if (buddyAgents[0].strategy) {
            try {
              const strat = typeof buddyAgents[0].strategy === 'string'
                ? JSON.parse(buddyAgents[0].strategy)
                : buddyAgents[0].strategy
              if (strat.skills) setSkills(strat.skills)
              if (strat.preferredLocation) setPreferredLocation(strat.preferredLocation)
              if (strat.preferredJobType) setPreferredJobType(strat.preferredJobType)
              if (strat.experienceYears) setExperienceYears(strat.experienceYears)
              if (strat.portals) setPortals(strat.portals.split(',').filter(Boolean))
              if (strat.autoApply) setAutoApply(strat.autoApply === 'true')
            } catch {}
          }
          // Fetch tasks and emails for this agent
          const [tasksRes, emailsRes] = await Promise.all([
            fetch(`/api/agents/${buddyAgents[0].id}/tasks?limit=50`),
            fetch(`/api/agents/${buddyAgents[0].id}/emails?limit=50`),
          ])
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json()
            setTasks(tasksData.tasks || [])
          }
          if (emailsRes.ok) {
            const emailsData = await emailsRes.json()
            setEmails(emailsData.emails || [])
          }
        }
      }
    } catch (err) {
      console.error('Fetch agent error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search external jobs (simulated)
  const searchExternalJobs = async () => {
    setJobsLoading(true)
    try {
      const res = await fetch('/api/agents/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `https://search-${portals.join('-').toLowerCase()}.simulated`,
          agentId: agent?.id || 'buddy',
          searchQuery: skills,
          location: preferredLocation,
        }),
      })
      // Generate simulated external jobs for demo
      const simulatedJobs: ExternalJob[] = generateSimulatedJobs(skills, preferredLocation, portals)
      setExternalJobs(simulatedJobs)
    } catch (err) {
      console.error('Search error:', err)
      // Still show simulated jobs on error
      const simulatedJobs: ExternalJob[] = generateSimulatedJobs(skills, preferredLocation, portals)
      setExternalJobs(simulatedJobs)
    } finally {
      setJobsLoading(false)
    }
  }

  // Create buddy agent
  const handleSetup = async () => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AI Buddy - ${user?.name || 'Candidate'}`,
          type: 'CANDIDATE_BUDDY',
          description: `Auto job search & apply agent for ${user?.name}. Skills: ${skills}. Location: ${preferredLocation}. Portals: ${portals.join(', ')}`,
          dailyLimit: parseInt(dailyApplyLimit) || 10,
          strategy: {
            skills,
            preferredLocation,
            preferredJobType,
            experienceYears,
            portals: portals.join(','),
            autoApply: autoApply.toString(),
            resumeSummary: resumeText.slice(0, 500),
          },
          createdBy: user?.id || 'candidate',
        }),
      })
      if (res.ok) {
        setSetupOpen(false)
        await fetchAgent()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create AI Buddy')
      }
    } catch (err) {
      console.error('Setup error:', err)
      alert('Failed to create AI Buddy')
    }
  }

  // Apply to job
  const handleApply = async (job: ExternalJob) => {
    if (!agent) return
    try {
      // Create an application task
      const res = await fetch(`/api/agents/${agent.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EXTERNAL_APPLY',
          targetCompany: job.company,
          targetUrl: job.sourceUrl,
          targetData: JSON.stringify(job),
          requiresApproval: !autoApply,
        }),
      })
      if (res.ok) {
        setExternalJobs(prev => prev.map(j =>
          j.id === job.id ? { ...j, applied: true, applicationStatus: autoApply ? 'APPLIED' : 'PENDING_APPROVAL' } : j
        ))
        await fetchAgent()
      }
    } catch (err) {
      console.error('Apply error:', err)
    }
  }

  useEffect(() => {
    fetchAgent()
  }, [fetchAgent])

  // ─── Simulated Jobs Generator ─────────────────────────────────────────

  const generateSimulatedJobs = (skillStr: string, location: string, portalList: string[]): ExternalJob[] => {
    const skillList = skillStr.split(',').map(s => s.trim()).filter(Boolean)
    if (skillList.length === 0) return []

    const titles = [
      `Senior ${skillList[0]} Developer`,
      `${skillList[0]} Engineer`,
      `Full Stack ${skillList[0]} Developer`,
      `${skillList[Math.min(1, skillList.length - 1)]} Specialist`,
      `Lead ${skillList[0]} Architect`,
      `${skillList[0]} Consultant`,
      `Junior ${skillList[0]} Developer`,
      `${skillList[0]} Tech Lead`,
    ]
    const companies = ['TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'Google India', 'Microsoft India', 'Amazon India', 'Flipkart', 'Razorpay', 'Swiggy', 'Zomato', 'Paytm', 'Freshworks', 'Zoho', 'Dream11', 'PhonePe', 'Meesho', 'CRED', 'UpGrad']
    const jobTypes = ['Full Time', 'Remote', 'Hybrid', 'Contract']
    const experiences = ['0-2 Years', '2-4 Years', '3-5 Years', '5-8 Years', '8-12 Years']
    const salaries = ['₹6L - ₹10L/yr', '₹10L - ₹18L/yr', '₹15L - ₹25L/yr', '₹20L - ₹35L/yr', '₹30L - ₹50L/yr', '₹40L - ₹70L/yr']
    const locations = location ? [location, `${location} (Remote)`, `${location} (Hybrid)`] : ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Remote']

    const jobs: ExternalJob[] = []
    const usedTitles = new Set<string>()

    for (let i = 0; i < 15; i++) {
      const title = titles[i % titles.length]
      const company = companies[Math.floor(Math.random() * companies.length)]
      const portal = portalList[i % portalList.length]
      const matchScore = 60 + Math.floor(Math.random() * 35)
      const id = `ext-job-${i}-${Date.now()}`

      jobs.push({
        id,
        title,
        company,
        location: locations[i % locations.length],
        salary: salaries[Math.floor(Math.random() * salaries.length)],
        source: portal,
        sourceUrl: `https://${portal.toLowerCase().replace(/\s/g, '')}.com/job/${id}`,
        matchScore,
        jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        experience: experiences[Math.floor(Math.random() * experiences.length)],
        skills: skillList.slice(0, 3 + Math.floor(Math.random() * 3)),
        postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        applied: false,
      })
    }

    return jobs.sort((a, b) => b.matchScore - a.matchScore)
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#16a34a]" />
        <span className="ml-3 text-[#5f6368]">Loading AI Buddy...</span>
      </div>
    )
  }

  // No agent yet - show setup
  if (!agent) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg overflow-hidden">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] p-8 text-center relative">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Career Buddy</h2>
                <p className="text-white/80 text-sm max-w-md mx-auto">
                  Your personal AI agent that searches jobs across multiple portals, applies on your behalf, and coordinates via email until your interview is scheduled.
                </p>
                <Badge className="mt-3 bg-[#f9ab00] text-[#202124] border-0 font-semibold">
                  <Sparkles className="h-3 w-3 mr-1" /> Premium Feature
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* How it works */}
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { icon: Search, label: 'Search Jobs', desc: 'Across 7+ portals' },
                  { icon: FileText, label: 'Auto Apply', desc: 'On your behalf' },
                  { icon: Mail, label: 'Email Follow-up', desc: 'Until interview' },
                  { icon: CheckCircle2, label: 'Interview', desc: 'Get scheduled' },
                ].map((step, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="w-10 h-10 mx-auto bg-[#16a34a]/10 rounded-xl flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-[#16a34a]" />
                    </div>
                    <p className="text-xs font-semibold text-[#202124]">{step.label}</p>
                    <p className="text-[10px] text-[#5f6368]">{step.desc}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Setup Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#202124] flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#16a34a]" />
                  Configure Your AI Buddy
                </h3>

                <div>
                  <Label>Key Skills *</Label>
                  <Input
                    placeholder="e.g., React, Node.js, Python, AWS"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-[10px] text-[#5f6368] mt-0.5">Comma-separated skills for job matching</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preferred Location</Label>
                    <Input
                      placeholder="e.g., Bangalore, Remote"
                      value={preferredLocation}
                      onChange={e => setPreferredLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Experience (Years)</Label>
                    <Input
                      placeholder="e.g., 3-5"
                      value={experienceYears}
                      onChange={e => setExperienceYears(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Job Type</Label>
                  <Select value={preferredJobType} onValueChange={setPreferredJobType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Search Portals</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PORTAL_NAMES.map(portal => (
                      <button
                        key={portal}
                        onClick={() => setPortals(prev =>
                          prev.includes(portal) ? prev.filter(p => p !== portal) : [...prev, portal]
                        )}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          portals.includes(portal)
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={portals.includes(portal) ? { backgroundColor: PORTAL_COLORS[portal] || '#16a34a' } : {}}
                      >
                        <Globe className="h-3 w-3" />
                        {portal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Resume Summary (Optional)</Label>
                  <Textarea
                    placeholder="Paste key highlights from your resume..."
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Apply Limit</Label>
                    <p className="text-[10px] text-[#5f6368]">Max applications per day</p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={dailyApplyLimit}
                    onChange={e => setDailyApplyLimit(e.target.value)}
                    className="w-20 mt-1"
                  />
                </div>

                <div className="flex items-center justify-between bg-[#f5f7fc] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#f9ab00]" />
                    <div>
                      <p className="text-sm font-medium text-[#202124]">Auto-Apply Mode</p>
                      <p className="text-[10px] text-[#5f6368]">Apply automatically to matching jobs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoApply(!autoApply)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${autoApply ? 'bg-[#16a34a]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoApply ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleSetup}
                disabled={!skills.trim()}
                className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-base"
              >
                <Bot className="h-5 w-5 mr-2" />
                Activate AI Buddy
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Agent exists - show dashboard
  const dailyProgress = agent.dailyLimit > 0 ? Math.min((agent.dailySent / agent.dailyLimit) * 100, 100) : 0
  const successRate = agent.totalTasks > 0 ? ((agent.totalSuccess / agent.totalTasks) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] p-5 relative">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">
                      {agent.status}
                    </Badge>
                    <span className="text-white/60 text-xs">
                      Last run: {agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Daily Progress</p>
                <p className="text-white font-bold text-lg">{agent.dailySent}/{agent.dailyLimit}</p>
                <div className="w-24 h-1.5 bg-white/20 rounded-full mt-1">
                  <div className="h-full bg-[#f9ab00] rounded-full" style={{ width: `${dailyProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jobs Applied', value: agent.totalTasks, icon: Briefcase, color: '#16a34a' },
          { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: '#3b82f6' },
          { label: 'Emails Sent', value: agent.totalEmailsSent, icon: Mail, color: '#f9ab00' },
          { label: 'Interviews', value: agent.totalConversions, icon: Calendar, color: '#8b5cf6' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#202124]">{stat.value}</p>
                  <p className="text-[10px] text-[#5f6368]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-1.5">Overview</TabsTrigger>
          <TabsTrigger value="jobs" className="gap-1.5">External Jobs</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">Tasks</TabsTrigger>
          <TabsTrigger value="emails" className="gap-1.5">Emails</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Strategy Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#16a34a]" />
                  Your Search Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {agent.strategy ? (
                  Object.entries(JSON.parse(agent.strategy)).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-[#5f6368] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium text-[#202124] max-w-[200px] truncate">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#5f6368] text-xs">No strategy configured</p>
                )}
              </CardContent>
            </Card>

            {/* Portal Coverage */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#3b82f6]" />
                  Portal Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PORTAL_NAMES.map(portal => {
                  const isActive = portals.includes(portal)
                  return (
                    <div key={portal} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PORTAL_COLORS[portal] }} />
                        <span className="text-sm font-medium text-[#202124]">{portal}</span>
                      </div>
                      <Badge className={`text-[9px] ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 && emails.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-[#5f6368] mx-auto mb-2" />
                  <p className="text-sm text-[#5f6368]">No activity yet. Search for external jobs to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...tasks.slice(0, 5).map(t => ({ ...t, itemType: 'task' })), ...emails.slice(0, 5).map(e => ({ ...e, itemType: 'email' }))]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 8)
                    .map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          {item.itemType === 'task' ? (
                            <Briefcase className="h-4 w-4 text-[#16a34a]" />
                          ) : (
                            <Mail className="h-4 w-4 text-[#3b82f6]" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-[#202124]">
                              {item.itemType === 'task' ? (item as any).type : (item as any).subject}
                            </p>
                            <p className="text-[10px] text-[#5f6368]">
                              {item.itemType === 'task' ? (item as any).targetCompany : (item as any).toEmail}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-[9px] ${TASK_STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-600'}`}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#202124]">External Job Matches</h3>
            <Button
              onClick={searchExternalJobs}
              disabled={jobsLoading || !skills.trim()}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white"
            >
              {jobsLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              Search Jobs
            </Button>
          </div>

          {externalJobs.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <Search className="h-10 w-10 text-[#5f6368] mx-auto mb-3" />
                <h4 className="font-semibold text-[#202124] mb-1">No Jobs Searched Yet</h4>
                <p className="text-sm text-[#5f6368] max-w-sm mx-auto">
                  Click &quot;Search Jobs&quot; to find matching positions across {portals.join(', ')} and other portals.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {externalJobs.map((job, idx) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                            style={{ backgroundColor: PORTAL_COLORS[job.source] || '#16a34a' }}>
                            {job.source.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-[#202124] text-sm truncate">{job.title}</h4>
                            <p className="text-[#5f6368] text-xs mt-0.5">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[10px] text-[#5f6368]">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                              <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{job.salary}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.experience}</span>
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.jobType}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.skills.slice(0, 4).map(skill => (
                                <Badge key={skill} className="text-[9px] bg-[#16a34a]/10 text-[#16a34a] border-0 px-1.5 py-0">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Badge className="text-[9px] border-0 font-semibold" style={{ backgroundColor: `${PORTAL_COLORS[job.source]}20`, color: PORTAL_COLORS[job.source] }}>
                              {job.source}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${job.matchScore >= 85 ? 'text-[#16a34a]' : job.matchScore >= 70 ? 'text-[#f9ab00]' : 'text-[#5f6368]'}`}>
                              {job.matchScore}%
                            </div>
                            <p className="text-[9px] text-[#5f6368]">Match</p>
                          </div>
                          {job.applied ? (
                            <Badge className="text-[9px] bg-green-100 text-green-700 border-0">
                              <CheckCircle2 className="h-3 w-3 mr-0.5" />
                              {job.applicationStatus === 'PENDING_APPROVAL' ? 'Pending' : 'Applied'}
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApply(job)}
                              className="h-7 text-[10px] bg-[#16a34a] hover:bg-[#15803d] text-white"
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <h3 className="font-semibold text-[#202124]">Application Tasks</h3>
          {tasks.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-10 w-10 text-[#5f6368] mx-auto mb-3" />
                <p className="text-sm text-[#5f6368]">No tasks yet. Apply to external jobs to create tasks.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <Card key={task.id} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#16a34a]/10">
                        <Briefcase className="h-4 w-4 text-[#16a34a]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#202124]">{task.type}</p>
                        <p className="text-[10px] text-[#5f6368]">{task.targetCompany || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-[9px] ${TASK_STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
                        {task.status}
                      </Badge>
                      <p className="text-[9px] text-[#5f6368] mt-1">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-4 mt-4">
          <h3 className="font-semibold text-[#202124]">Email Communications</h3>
          {emails.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <Mail className="h-10 w-10 text-[#5f6368] mx-auto mb-3" />
                <p className="text-sm text-[#5f6368]">No emails yet. The AI Buddy will coordinate with recruiters via email.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {emails.map((email, idx) => (
                <Card key={email.id} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-[#3b82f6]/10 flex-shrink-0">
                        <Mail className="h-4 w-4 text-[#3b82f6]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#202124] truncate">{email.subject}</p>
                        <p className="text-[10px] text-[#5f6368]">{email.toName || email.toEmail} {email.company ? `· ${email.company}` : ''}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge className={`text-[9px] ${email.status === 'SENT' ? 'bg-blue-100 text-blue-700' : email.status === 'REPLIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {email.status}
                      </Badge>
                      {email.followUpSequence > 0 && (
                        <p className="text-[9px] text-[#5f6368] mt-1">Follow-up #{email.followUpSequence}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
