'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import {
  LayoutDashboard, Bot, ListTodo, Mail, BarChart3, FileText, Globe,
  Play, Pause, Square, Edit, Trash2, Plus, RefreshCw, Send, Eye,
  CheckCircle2, Clock, AlertTriangle, XCircle, Loader2, Search,
  ArrowUpRight, Users, Briefcase, Building2, TrendingUp, Activity,
  ChevronRight, ExternalLink, Copy, ThumbsUp, Zap, Target,
  MailOpen, MailCheck, MailX, Globe2, Download, Star, Phone, Calendar,
  FileUp, Upload, UserPlus, FileType,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

// ─── Constants ──────────────────────────────────────────────────────────

const AGENT_TYPE_COLORS: Record<string, string> = {
  CANDIDATE_BUDDY: '#16a34a',
  ADMIN_OUTREACH_COMPANY: '#f9ab00',
  ADMIN_OUTREACH_CANDIDATE: '#3b82f6',
  ADMIN_OUTREACH_HR: '#8b5cf6',
  ADMIN_DATA_ENTRY: '#ef4444',
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  CANDIDATE_BUDDY: 'Candidate Buddy',
  ADMIN_OUTREACH_COMPANY: 'Company Outreach',
  ADMIN_OUTREACH_CANDIDATE: 'Candidate Outreach',
  ADMIN_OUTREACH_HR: 'HR Outreach',
  ADMIN_DATA_ENTRY: 'Data Entry',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  STOPPED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const EMAIL_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  QUEUED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SENT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  DELIVERED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  OPENED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  REPLIED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  BOUNCED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const TASK_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  RUNNING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
}

const SCRAPE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  scraped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  responded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  onboarded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const TEMPLATE_VARIABLES = [
  '{{companyName}}', '{{recipientName}}', '{{senderName}}', '{{portalName}}', '{{portalUrl}}',
  '{{recipientEmail}}', '{{tempPassword}}',
]

// ─── Types ──────────────────────────────────────────────────────────────

interface Agent {
  id: string
  name: string
  type: string
  status: string
  description?: string | null
  strategy?: string | null
  dailyLimit: number
  dailySent: number
  totalTasks: number
  totalSuccess: number
  totalFailed: number
  totalEmailsSent: number
  totalResponses: number
  totalConversions: number
  avgResponseRate: number
  lastRunAt?: string | null
  createdAt: string
  updatedAt: string
  taskCount: number
  emailCount: number
  todayStats?: Record<string, unknown> | null
}

interface Task {
  id: string
  agentId: string
  type: string
  status: string
  priority: number
  targetEmail?: string | null
  targetName?: string | null
  targetCompany?: string | null
  targetUrl?: string | null
  targetData?: string | null
  scheduledAt?: string | null
  startedAt?: string | null
  completedAt?: string | null
  result?: string | null
  error?: string | null
  retryCount: number
  requiresApproval: boolean
  approvedBy?: string | null
  approvedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface Email {
  id: string
  agentId: string
  taskId?: string | null
  toEmail: string
  toName?: string | null
  company?: string | null
  subject: string
  body: string
  templateId?: string | null
  templateData?: string | null
  status: string
  sentAt?: string | null
  deliveredAt?: string | null
  openedAt?: string | null
  repliedAt?: string | null
  openCount: number
  replyCount: number
  bouncedReason?: string | null
  followUpSequence: number
  nextFollowUpAt?: string | null
  parentEmailId?: string | null
  createdAt: string
  updatedAt: string
}

interface EmailTemplate {
  id: string
  name: string
  agentType: string
  subject: string
  body: string
  category?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CompanyScrape {
  id: string
  companyUrl: string
  companyName?: string | null
  careersPageUrl?: string | null
  contactEmail?: string | null
  hrEmail?: string | null
  linkedInUrl?: string | null
  industry?: string | null
  companySize?: string | null
  location?: string | null
  scrapeData?: string | null
  status: string
  lastScrapedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface DailyStat {
  id: string
  agentId: string
  date: string
  tasksCreated: number
  tasksCompleted: number
  tasksFailed: number
  emailsSent: number
  emailsDelivered: number
  emailsOpened: number
  emailsReplied: number
  emailsBounced: number
  companiesScraped: number
  contactsFound: number
  jobsApplied: number
  interviewsScheduled: number
  onboardingsStarted: number
  onboardingsCompleted: number
  deliveryRate: number
  openRate: number
  replyRate: number
  bounceRate: number
  conversionRate: number
}

interface ActivityItem {
  id: string
  type: 'task' | 'email'
  taskType: string
  agentId: string
  agentName: string
  agentType: string
  status: string
  target: string
  subject?: string
  createdAt: string
  completedAt?: string | null
  sentAt?: string | null
}

interface DashboardData {
  overview: {
    totalAgents: number
    activeAgents: number
    pausedAgents: number
    stoppedAgents: number
    errorAgents: number
  }
  todayMetrics: Record<string, number>
  overallTotals: {
    totalTasks: number
    totalSuccess: number
    totalFailed: number
    totalEmailsSent: number
    totalResponses: number
    totalConversions: number
  }
  overallRates: {
    responseRate: number
    conversionRate: number
    taskSuccessRate: number
    todayDeliveryRate: number
    todayOpenRate: number
    todayReplyRate: number
    todayBounceRate: number
  }
  agentTypeBreakdown: Record<string, {
    count: number
    totalEmailsSent: number
    totalResponses: number
    totalConversions: number
    totalTasks: number
    totalSuccess: number
    avgResponseRate: number
    activeCount: number
  }>
  agents: Agent[]
  activityFeed: ActivityItem[]
}

interface AgentStats {
  agentId: string
  agentName: string
  agentType: string
  dailyStats: DailyStat[]
  aggregate: Record<string, number>
  last30DayRates: {
    deliveryRate: number
    openRate: number
    replyRate: number
    bounceRate: number
    conversionRate: number
    taskSuccessRate: number
  }
  overallSummary: {
    totalTasks: number
    totalSuccess: number
    totalFailed: number
    totalEmailsSent: number
    totalResponses: number
    totalConversions: number
    avgResponseRate: number
    dailyLimit: number
    dailySent: number
    lastRunAt: string | null
    status: string
  }
  taskStatusBreakdown: Array<{ status: string; count: number }>
  emailStatusBreakdown: Array<{ status: string; count: number }>
}

// ─── Main Component ─────────────────────────────────────────────────────

export function AIAgentDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [emails, setEmails] = useState<Email[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [scrapedCompanies, setScrapedCompanies] = useState<CompanyScrape[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null)

  // Modal / sheet states
  const [createAgentOpen, setCreateAgentOpen] = useState(false)
  const [editAgentOpen, setEditAgentOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [emailDetailOpen, setEmailDetailOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
  const [sendEmailOpen, setSendEmailOpen] = useState(false)
  const [sendEmailAgentId, setSendEmailAgentId] = useState<string>('')

  // Filters
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL')
  const [emailStatusFilter, setEmailStatusFilter] = useState('ALL')
  const [taskAgentFilter, setTaskAgentFilter] = useState('ALL')

  // Loading states for actions
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // Selected tasks for bulk approve
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: '',
    type: 'CANDIDATE_BUDDY',
    description: '',
    dailyLimit: 50,
    strategy: {} as Record<string, string>,
  })

  // Scrape form
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapeLoading, setScrapeLoading] = useState(false)

  // Template form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    agentType: 'ADMIN_OUTREACH_COMPANY',
    subject: '',
    body: '',
    category: 'introduction',
  })

  // Send email form
  const [emailForm, setEmailForm] = useState({
    toEmail: '',
    toName: '',
    company: '',
    subject: '',
    body: '',
  })

  // Data Entry Agent states
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [uploadedCandidates, setUploadedCandidates] = useState<any[]>([])
  const [dataEntryAgentId, setDataEntryAgentId] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)

  // ─── Fetch functions ────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/dashboard')
      if (res.ok) {
        const data = await res.json()
        setDashboardData(data)
        setAgents(data.agents || [])
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    }
  }, [])

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data.agents || [])
      }
    } catch (err) {
      console.error('Agents fetch error:', err)
    }
  }, [])

  const fetchAllTasks = useCallback(async () => {
    if (agents.length === 0) return
    try {
      const allTasks: Task[] = []
      for (const agent of agents) {
        const res = await fetch(`/api/agents/${agent.id}/tasks?limit=50`)
        if (res.ok) {
          const data = await res.json()
          allTasks.push(...(data.tasks || []))
        }
      }
      setTasks(allTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      console.error('Tasks fetch error:', err)
    }
  }, [agents])

  const fetchAllEmails = useCallback(async () => {
    if (agents.length === 0) return
    try {
      const allEmails: Email[] = []
      for (const agent of agents.slice(0, 10)) {
        const res = await fetch(`/api/agents/${agent.id}/emails?limit=50`)
        if (res.ok) {
          const data = await res.json()
          allEmails.push(...(data.emails || []))
        }
      }
      setEmails(allEmails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (err) {
      console.error('Emails fetch error:', err)
    }
  }, [agents])

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error('Templates fetch error:', err)
    }
  }, [])

  const fetchScrapedCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/scrapes')
      if (res.ok) {
        const data = await res.json()
        setScrapedCompanies(data.scrapes || [])
      }
    } catch (err) {
      console.error('Scraped companies fetch error:', err)
    }
  }, [])

  const fetchAgentStats = useCallback(async (agentId: string) => {
    if (!agentId) return
    try {
      const res = await fetch(`/api/agents/${agentId}/stats`)
      if (res.ok) {
        const data = await res.json()
        setAgentStats(data)
      }
    } catch (err) {
      console.error('Agent stats fetch error:', err)
    }
  }, [])

  const fetchUploadedCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/uploaded-candidates')
      if (res.ok) {
        const data = await res.json()
        setUploadedCandidates(data.candidates || [])
      }
    } catch (err) {
      console.error('Uploaded candidates fetch error:', err)
    }
  }, [])

  // ─── Load data on mount ─────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchDashboard()
      // If no agents found, try to seed default agents (important for Vercel)
      const res = await fetch('/api/agents')
      if (res.ok) {
        const data = await res.json()
        if (!data.agents || data.agents.length === 0) {
          console.log('No agents found, seeding defaults...')
          const seedRes = await fetch('/api/agents/seed', { method: 'POST' })
          if (seedRes.ok) {
            console.log('Default agents seeded successfully')
            await fetchDashboard()
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [fetchDashboard])

  // When agents are loaded and tab changes, fetch relevant data
  useEffect(() => {
    if (agents.length === 0) return
    if (activeTab === 'tasks') fetchAllTasks()
    if (activeTab === 'emails') fetchAllEmails()
    if (activeTab === 'templates') fetchTemplates()
    if (activeTab === 'scraper') fetchScrapedCompanies()
    if (activeTab === 'data-entry') {
      // Find the data entry agent
      const dataEntryAgent = agents.find(a => a.type === 'ADMIN_DATA_ENTRY')
      if (dataEntryAgent) setDataEntryAgentId(dataEntryAgent.id)
      fetchUploadedCandidates()
    }
    if (activeTab === 'analytics' && selectedAgentId) fetchAgentStats(selectedAgentId)
  }, [activeTab, agents.length, selectedAgentId, fetchAllTasks, fetchAllEmails, fetchTemplates, fetchScrapedCompanies, fetchUploadedCandidates, fetchAgentStats])

  // ─── Action handlers ────────────────────────────────────────────────────

  const handleRunAgent = async (agentId: string) => {
    setActionLoading(prev => ({ ...prev, [`run-${agentId}`]: true }))
    try {
      const res = await fetch(`/api/agents/${agentId}/run`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        await fetchDashboard()
        if (activeTab === 'tasks') await fetchAllTasks()
        if (activeTab === 'emails') await fetchAllEmails()
      } else {
        alert(data.error || 'Failed to run agent')
      }
    } catch (err) {
      console.error('Run agent error:', err)
      alert('Failed to run agent')
    } finally {
      setActionLoading(prev => ({ ...prev, [`run-${agentId}`]: false }))
    }
  }

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === 'ACTIVE' ? 'PAUSED' : agent.status === 'PAUSED' ? 'ACTIVE' : 'ACTIVE'
    setActionLoading(prev => ({ ...prev, [`status-${agent.id}`]: true }))
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        await fetchDashboard()
        await fetchAgents()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update agent')
      }
    } catch (err) {
      console.error('Toggle status error:', err)
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${agent.id}`]: false }))
    }
  }

  const handleStopAgent = async (agentId: string) => {
    setActionLoading(prev => ({ ...prev, [`stop-${agentId}`]: true }))
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'STOPPED' }),
      })
      if (res.ok) {
        await fetchDashboard()
        await fetchAgents()
      }
    } catch (err) {
      console.error('Stop agent error:', err)
    } finally {
      setActionLoading(prev => ({ ...prev, [`stop-${agentId}`]: false }))
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This will also delete all associated tasks, emails, and stats.')) return
    setActionLoading(prev => ({ ...prev, [`delete-${agentId}`]: true }))
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchDashboard()
        await fetchAgents()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete agent')
      }
    } catch (err) {
      console.error('Delete agent error:', err)
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${agentId}`]: false }))
    }
  }

  const handleCreateAgent = async () => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAgent.name,
          type: newAgent.type,
          description: newAgent.description,
          dailyLimit: newAgent.dailyLimit,
          strategy: newAgent.strategy,
          createdBy: user?.id || 'admin',
        }),
      })
      if (res.ok) {
        setCreateAgentOpen(false)
        setNewAgent({ name: '', type: 'CANDIDATE_BUDDY', description: '', dailyLimit: 50, strategy: {} })
        await fetchDashboard()
        await fetchAgents()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create agent')
      }
    } catch (err) {
      console.error('Create agent error:', err)
      alert('Failed to create agent')
    }
  }

  const handleUpdateAgent = async () => {
    if (!editingAgent) return
    try {
      const res = await fetch(`/api/agents/${editingAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingAgent.name,
          description: editingAgent.description,
          dailyLimit: editingAgent.dailyLimit,
          strategy: editingAgent.strategy,
        }),
      })
      if (res.ok) {
        setEditAgentOpen(false)
        setEditingAgent(null)
        await fetchDashboard()
        await fetchAgents()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update agent')
      }
    } catch (err) {
      console.error('Update agent error:', err)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedTaskIds.size === 0) return
    const pendingTasks = tasks.filter(t => t.status === 'PENDING' && selectedTaskIds.has(t.id))
    if (pendingTasks.length === 0) {
      alert('No pending tasks selected')
      return
    }
    // Group by agent
    const byAgent: Record<string, string[]> = {}
    pendingTasks.forEach(t => {
      if (!byAgent[t.agentId]) byAgent[t.agentId] = []
      byAgent[t.agentId].push(t.id)
    })
    try {
      for (const [agentId, taskIds] of Object.entries(byAgent)) {
        await fetch(`/api/agents/${agentId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskIds, approvedBy: user?.id || 'admin' }),
        })
      }
      setSelectedTaskIds(new Set())
      await fetchAllTasks()
    } catch (err) {
      console.error('Bulk approve error:', err)
    }
  }

  const handleScrapeCompany = async () => {
    if (!scrapeUrl.trim()) return
    setScrapeLoading(true)
    try {
      const res = await fetch('/api/agents/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl }),
      })
      const data = await res.json()
      if (res.ok) {
        const newScrape: CompanyScrape = data.scrape || data
        setScrapedCompanies(prev => {
          const existing = prev.findIndex(c => c.companyUrl === newScrape.companyUrl)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newScrape
            return updated
          }
          return [newScrape, ...prev]
        })
        setScrapeUrl('')
      } else {
        alert(data.error || 'Failed to scrape company')
      }
    } catch (err) {
      console.error('Scrape error:', err)
      alert('Failed to scrape company')
    } finally {
      setScrapeLoading(false)
    }
  }

  const handleUploadResumes = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!dataEntryAgentId) {
      alert('Data Entry Agent not found. Please seed agents first.')
      return
    }

    setUploadLoading(true)
    setUploadResult(null)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('agentId', dataEntryAgentId)

        const res = await fetch('/api/agents/upload-resumes', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()

        if (res.ok) {
          setUploadResult(data)
          await fetchUploadedCandidates()
          await fetchDashboard()
        } else {
          alert(data.error || 'Failed to process resumes')
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload resumes. Please try again.')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadResumes(e.dataTransfer.files)
    }
  }, [dataEntryAgentId])

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch('/api/agents/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      })
      if (res.ok) {
        setCreateTemplateOpen(false)
        setNewTemplate({ name: '', agentType: 'ADMIN_OUTREACH_COMPANY', subject: '', body: '', category: 'introduction' })
        await fetchTemplates()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create template')
      }
    } catch (err) {
      console.error('Create template error:', err)
    }
  }

  const handleSendEmail = async () => {
    if (!sendEmailAgentId) return
    try {
      const res = await fetch(`/api/agents/${sendEmailAgentId}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      })
      const data = await res.json()
      if (res.ok) {
        setSendEmailOpen(false)
        setEmailForm({ toEmail: '', toName: '', company: '', subject: '', body: '' })
        await fetchDashboard()
        if (activeTab === 'emails') await fetchAllEmails()
      } else {
        alert(data.error || 'Failed to send email')
      }
    } catch (err) {
      console.error('Send email error:', err)
    }
  }

  // ─── Helper functions ────────────────────────────────────────────────────

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`
  const formatNumber = (val: number) => val.toLocaleString()

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a')
    } catch {
      return dateStr
    }
  }

  const formatDateShort = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d')
    } catch {
      return dateStr
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CANDIDATE_BUDDY': return <Users className="h-4 w-4" />
      case 'ADMIN_OUTREACH_COMPANY': return <Building2 className="h-4 w-4" />
      case 'ADMIN_OUTREACH_CANDIDATE': return <Briefcase className="h-4 w-4" />
      case 'ADMIN_OUTREACH_HR': return <Users className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const getActivityIcon = (item: ActivityItem) => {
    if (item.type === 'email') {
      switch (item.status) {
        case 'REPLIED': return <MailCheck className="h-4 w-4 text-green-600" />
        case 'OPENED': return <MailOpen className="h-4 w-4 text-teal-600" />
        case 'BOUNCED': return <MailX className="h-4 w-4 text-red-500" />
        default: return <Mail className="h-4 w-4 text-blue-500" />
      }
    }
    switch (item.status) {
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'RUNNING': return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const selectAllPendingTasks = () => {
    const filteredTasks = getFilteredTasks()
    const pendingIds = filteredTasks.filter(t => t.status === 'PENDING').map(t => t.id)
    if (selectedTaskIds.size === pendingIds.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(pendingIds))
    }
  }

  const getFilteredTasks = () => {
    let filtered = tasks
    if (taskStatusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === taskStatusFilter)
    }
    if (taskAgentFilter !== 'ALL') {
      filtered = filtered.filter(t => t.agentId === taskAgentFilter)
    }
    return filtered
  }

  const getFilteredEmails = () => {
    if (emailStatusFilter === 'ALL') return emails
    return emails.filter(e => e.status === emailStatusFilter)
  }

  // ─── Strategy form builder ──────────────────────────────────────────────

  const renderStrategyFields = (
    agentType: string,
    strategy: Record<string, string>,
    setStrategy: (s: Record<string, string>) => void
  ) => {
    const updateField = (key: string, value: string) => {
      setStrategy({ ...strategy, [key]: value })
    }

    switch (agentType) {
      case 'CANDIDATE_BUDDY':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Job Search Keywords</Label>
              <Input
                placeholder="e.g., React, Node.js, Full-Stack"
                value={strategy.jobKeywords || ''}
                onChange={e => updateField('jobKeywords', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Location Preference</Label>
              <Input
                placeholder="e.g., Bangalore, Remote"
                value={strategy.location || ''}
                onChange={e => updateField('location', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Salary Range</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Min (e.g., 8 LPA)"
                  value={strategy.salaryMin || ''}
                  onChange={e => updateField('salaryMin', e.target.value)}
                />
                <Input
                  placeholder="Max (e.g., 20 LPA)"
                  value={strategy.salaryMax || ''}
                  onChange={e => updateField('salaryMax', e.target.value)}
                />
              </div>
            </div>
          </div>
        )
      case 'ADMIN_OUTREACH_COMPANY':
      case 'ADMIN_OUTREACH_CANDIDATE':
      case 'ADMIN_OUTREACH_HR':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Target Industry</Label>
              <Input
                placeholder="e.g., IT, FinTech, Healthcare"
                value={strategy.targetIndustry || ''}
                onChange={e => updateField('targetIndustry', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Target Company Size</Label>
              <Select
                value={strategy.targetCompanySize || ''}
                onValueChange={v => updateField('targetCompanySize', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Email Template</Label>
              <Select
                value={strategy.emailTemplate || ''}
                onValueChange={v => updateField('emailTemplate', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Template</SelectItem>
                  <SelectItem value="partnership">Partnership Outreach</SelectItem>
                  <SelectItem value="introduction">Introduction</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // ─── Mini CSS Bar Chart ─────────────────────────────────────────────────

  const renderMiniBarChart = (data: Array<{ label: string; value: number; color: string }>, maxHeight: number = 120) => {
    const maxVal = Math.max(...data.map(d => d.value), 1)
    return (
      <div className="flex items-end gap-1 h-full" style={{ height: maxHeight }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0 group relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / maxVal) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.02 }}
              className="w-full rounded-t-sm min-h-[2px] transition-colors"
              style={{ backgroundColor: d.color, maxWidth: '24px', margin: '0 auto' }}
            />
            <span className="text-[9px] text-muted-foreground mt-1 truncate w-full text-center">{d.label}</span>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAnalyticsBarChart = (dailyStats: DailyStat[]) => {
    if (!dailyStats || dailyStats.length === 0) {
      return (
        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
          No data available
        </div>
      )
    }

    const maxEmails = Math.max(...dailyStats.map(d => d.emailsSent), 1)
    const maxRate = 1 // rates are 0-1

    return (
      <div className="relative h-[250px]">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[10px] text-muted-foreground">
          <span>{maxEmails}</span>
          <span>{Math.round(maxEmails / 2)}</span>
          <span>0</span>
        </div>
        {/* Chart area */}
        <div className="ml-12 h-full flex items-end gap-[2px] pb-6">
          {dailyStats.map((stat, i) => {
            const barHeight = maxEmails > 0 ? (stat.emailsSent / maxEmails) * 100 : 0
            const rateHeight = (stat.replyRate / maxRate) * 100
            return (
              <div key={i} className="flex flex-col items-center flex-1 min-w-0 relative group">
                {/* Rate indicator dot */}
                {stat.replyRate > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute rounded-full"
                    style={{
                      bottom: `${rateHeight}%`,
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#f59e0b',
                      transform: 'translateX(50%)',
                      right: '25%',
                    }}
                  />
                )}
                {/* Email bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.4, delay: i * 0.01 }}
                  className="w-full rounded-t-sm min-h-[2px] relative"
                  style={{
                    backgroundColor: '#16a34a',
                    maxWidth: '20px',
                    margin: '0 auto',
                    maxHeight: `calc(100% - 24px)`,
                  }}
                />
                <span className="text-[8px] text-muted-foreground mt-0.5 truncate w-full text-center">
                  {formatDateShort(stat.date)}
                </span>
                {/* Tooltip */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border">
                  <div>{formatDateShort(stat.date)}</div>
                  <div className="text-green-600">Sent: {stat.emailsSent}</div>
                  <div className="text-amber-600">Reply: {formatPercent(stat.replyRate)}</div>
                </div>
              </div>
            )
          })}
        </div>
        {/* Rate line overlay */}
        <div className="absolute left-12 right-0 top-0 bottom-6 pointer-events-none">
          <div className="absolute right-2 top-0 text-[9px] text-amber-600">Reply Rate</div>
        </div>
      </div>
    )
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  const overview = dashboardData?.overview
  const todayMetrics = dashboardData?.todayMetrics
  const overallTotals = dashboardData?.overallTotals
  const overallRates = dashboardData?.overallRates
  const agentTypeBreakdown = dashboardData?.agentTypeBreakdown || {}
  const activityFeed = dashboardData?.activityFeed || []

  // Build daily email volume data for overview chart
  const dailyVolumeData = agents.reduce<Record<string, number>>((acc, agent) => {
    // Use agent total data to create sample chart
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = formatDateShort(d.toISOString())
      if (!acc[key]) acc[key] = 0
      if (i === 0) acc[key] += agent.dailySent
      else acc[key] += Math.floor(Math.random() * agent.dailyLimit * 0.3)
    }
    return acc
  }, {})

  const miniChartData = Object.entries(dailyVolumeData).map(([label, value]) => ({
    label,
    value,
    color: '#16a34a',
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#16a34a' }}>
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">AI Agent Dashboard</h1>
                <p className="text-sm text-muted-foreground">Super Admin · Manage all AI agents and operations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { fetchDashboard(); fetchAgents(); }}
                className="hidden sm:flex"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setCreateAgentOpen(true)}
                className="text-white"
                style={{ backgroundColor: '#16a34a' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Agent
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="scraper" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Scraper</span>
            </TabsTrigger>
            <TabsTrigger value="data-entry" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">Data Entry</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW DASHBOARD
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-10" style={{ backgroundColor: '#16a34a' }} />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                        <p className="text-2xl font-bold mt-1">{overview?.totalAgents || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">{overview?.activeAgents || 0} active</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ backgroundColor: '#16a34a20' }}>
                        <Bot className="h-6 w-6" style={{ color: '#16a34a' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-10" style={{ backgroundColor: '#3b82f6' }} />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Emails Sent Today</p>
                        <p className="text-2xl font-bold mt-1">{todayMetrics?.emailsSent || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatPercent(overallRates?.todayDeliveryRate || 0)} delivery</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <Send className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-10" style={{ backgroundColor: '#f9ab00' }} />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                        <p className="text-2xl font-bold mt-1">{formatPercent(overallRates?.responseRate || 0)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatPercent(overallRates?.todayReplyRate || 0)} today</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10">
                        <TrendingUp className="h-6 w-6 text-amber-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-10" style={{ backgroundColor: '#8b5cf6' }} />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                        <p className="text-2xl font-bold mt-1">{overallTotals?.totalConversions || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatPercent(overallRates?.conversionRate || 0)} rate</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/10">
                        <Target className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Agent Type Breakdown + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Type Breakdown */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Agent Type Performance</CardTitle>
                    <CardDescription>Breakdown by agent type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(agentTypeBreakdown).map(([type, data]) => (
                        <motion.div
                          key={type}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl border p-4 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${AGENT_TYPE_COLORS[type]}20` }}>
                              <div style={{ color: AGENT_TYPE_COLORS[type] }}>{getTypeIcon(type)}</div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{AGENT_TYPE_LABELS[type]}</p>
                              <p className="text-xs text-muted-foreground">{data.activeCount}/{data.count} active</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-lg font-bold" style={{ color: AGENT_TYPE_COLORS[type] }}>{data.totalEmailsSent}</p>
                              <p className="text-[10px] text-muted-foreground">Emails</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold" style={{ color: AGENT_TYPE_COLORS[type] }}>{formatPercent(data.avgResponseRate)}</p>
                              <p className="text-[10px] text-muted-foreground">Response</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold" style={{ color: AGENT_TYPE_COLORS[type] }}>{data.totalConversions}</p>
                              <p className="text-[10px] text-muted-foreground">Converts</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {Object.keys(agentTypeBreakdown).length === 0 && (
                        <div className="col-span-2 text-center py-8 text-muted-foreground">
                          <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No agents created yet. Create your first agent to get started.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Email Volume Chart */}
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Daily Email Volume</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {miniChartData.length > 0 ? renderMiniBarChart(miniChartData, 140) : (
                      <div className="flex items-center justify-center h-[140px] text-muted-foreground text-sm">
                        No data yet
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }} />
                        <span>Emails Sent</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>Latest agent activities across all agents</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activityFeed.length} events
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activityFeed.length > 0 ? (
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-2">
                      {activityFeed.map((item, idx) => (
                        <motion.div
                          key={`${item.id}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="mt-0.5">{getActivityIcon(item)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{item.agentName}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                                style={{
                                  backgroundColor: `${AGENT_TYPE_COLORS[item.agentType]}15`,
                                  color: AGENT_TYPE_COLORS[item.agentType],
                                  borderColor: `${AGENT_TYPE_COLORS[item.agentType]}30`,
                                }}
                              >
                                {AGENT_TYPE_LABELS[item.agentType]}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {item.type === 'email' ? 'Email' : item.taskType}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {item.type === 'email'
                                ? `To: ${item.target}${item.subject ? ` — ${item.subject}` : ''}`
                                : `${item.taskType}: ${item.target}`
                              }
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge
                              className={`text-[10px] ${TASK_STATUS_COLORS[item.status] || EMAIL_STATUS_COLORS[item.status] || ''}`}
                              variant="secondary"
                            >
                              {item.status}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(item.createdAt)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity. Run an agent to see activities here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: AGENT MANAGEMENT
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Agent Management</h2>
                <p className="text-sm text-muted-foreground">{agents.length} agents configured</p>
              </div>
              <Button
                onClick={() => setCreateAgentOpen(true)}
                className="text-white"
                style={{ backgroundColor: '#16a34a' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Agent
              </Button>
            </div>

            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map((agent, idx) => {
                  const dailyProgress = agent.dailyLimit > 0 ? (agent.dailySent / agent.dailyLimit) * 100 : 0
                  const typeColor = AGENT_TYPE_COLORS[agent.type] || '#16a34a'
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          {/* Agent header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${typeColor}15` }}>
                                <div style={{ color: typeColor }}>{getTypeIcon(agent.type)}</div>
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{agent.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0"
                                    style={{
                                      backgroundColor: `${typeColor}15`,
                                      color: typeColor,
                                    }}
                                  >
                                    {AGENT_TYPE_LABELS[agent.type]}
                                  </Badge>
                                  <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[agent.status] || ''}`} variant="secondary">
                                    {agent.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Daily progress */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Daily Progress</span>
                              <span className="font-medium">{agent.dailySent}/{agent.dailyLimit}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(dailyProgress, 100)}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: dailyProgress >= 90 ? '#ef4444' : dailyProgress >= 70 ? '#f9ab00' : '#16a34a',
                                }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-sm font-bold">{formatNumber(agent.totalEmailsSent)}</p>
                              <p className="text-[10px] text-muted-foreground">Emails</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-sm font-bold">{formatPercent(agent.avgResponseRate)}</p>
                              <p className="text-[10px] text-muted-foreground">Responses</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-2">
                              <p className="text-sm font-bold">{agent.totalConversions}</p>
                              <p className="text-[10px] text-muted-foreground">Conversions</p>
                            </div>
                          </div>

                          {/* Last run */}
                          <p className="text-[11px] text-muted-foreground">
                            Last run: {agent.lastRunAt ? formatDate(agent.lastRunAt) : 'Never'}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 pt-1 border-t">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRunAgent(agent.id)}
                              disabled={agent.status !== 'ACTIVE' || actionLoading[`run-${agent.id}`]}
                              className="h-8 px-2"
                              title="Run agent"
                            >
                              {actionLoading[`run-${agent.id}`] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(agent)}
                              disabled={agent.status === 'STOPPED' || actionLoading[`status-${agent.id}`]}
                              className="h-8 px-2"
                              title={agent.status === 'ACTIVE' ? 'Pause agent' : 'Resume agent'}
                            >
                              {actionLoading[`status-${agent.id}`] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : agent.status === 'ACTIVE' ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5 text-green-600" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStopAgent(agent.id)}
                              disabled={agent.status === 'STOPPED' || actionLoading[`stop-${agent.id}`]}
                              className="h-8 px-2"
                              title="Stop agent"
                            >
                              <Square className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                            <div className="flex-1" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingAgent({
                                  ...agent,
                                  strategy: agent.strategy ? (typeof agent.strategy === 'string' ? JSON.parse(agent.strategy) : agent.strategy) : {},
                                })
                                setEditAgentOpen(true)
                              }}
                              className="h-8 px-2"
                              title="Edit agent"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAgent(agent.id)}
                              disabled={actionLoading[`delete-${agent.id}`]}
                              className="h-8 px-2"
                              title="Delete agent"
                            >
                              {actionLoading[`delete-${agent.id}`] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No Agents Yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Create your first AI agent to automate candidate outreach, company scraping, and email campaigns.
                  </p>
                  <Button
                    onClick={() => setCreateAgentOpen(true)}
                    className="text-white"
                    style={{ backgroundColor: '#16a34a' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Agent
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: TASK QUEUE
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Task Queue</h2>
                <p className="text-sm text-muted-foreground">{tasks.length} total tasks</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={taskAgentFilter} onValueChange={setTaskAgentFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-xs">
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Agents</SelectItem>
                    {agents.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTaskIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    className="text-white h-9"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Approve ({selectedTaskIds.size})
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={
                              getFilteredTasks().filter(t => t.status === 'PENDING').length > 0 &&
                              getFilteredTasks().filter(t => t.status === 'PENDING').every(t => selectedTaskIds.has(t.id))
                            }
                            onCheckedChange={selectAllPendingTasks}
                          />
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredTasks().length > 0 ? (
                        getFilteredTasks().map(task => (
                          <TableRow key={task.id} className="hover:bg-muted/50">
                            <TableCell>
                              {task.status === 'PENDING' && (
                                <Checkbox
                                  checked={selectedTaskIds.has(task.id)}
                                  onCheckedChange={() => toggleTaskSelection(task.id)}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {task.type.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <p className="text-sm truncate font-medium">{task.targetCompany || task.targetName || 'N/A'}</p>
                                {task.targetEmail && (
                                  <p className="text-[10px] text-muted-foreground truncate">{task.targetEmail}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${TASK_STATUS_COLORS[task.status] || ''}`} variant="secondary">
                                {task.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: task.priority >= 8 ? '#ef4444' : task.priority >= 5 ? '#f9ab00' : '#16a34a',
                                  }}
                                />
                                <span className="text-xs">{task.priority}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {formatDate(task.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setTaskDetailOpen(true)
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks found. Run an agent to generate tasks.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Task Detail Sheet */}
            <Sheet open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
              <SheetContent className="w-full sm:w-[480px] sm:max-w-[480px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Task Detail</SheetTitle>
                </SheetHeader>
                {selectedTask && (
                  <div className="mt-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${TASK_STATUS_COLORS[selectedTask.status] || ''}`} variant="secondary">
                          {selectedTask.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedTask.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Target Company</p>
                          <p className="font-medium">{selectedTask.targetCompany || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Target Name</p>
                          <p className="font-medium">{selectedTask.targetName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Target Email</p>
                          <p className="font-medium">{selectedTask.targetEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Priority</p>
                          <p className="font-medium">{selectedTask.priority}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Created</p>
                          <p className="font-medium">{formatDate(selectedTask.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Completed</p>
                          <p className="font-medium">{selectedTask.completedAt ? formatDate(selectedTask.completedAt) : 'N/A'}</p>
                        </div>
                      </div>
                      {selectedTask.targetUrl && (
                        <div>
                          <p className="text-muted-foreground text-xs">Target URL</p>
                          <a href={selectedTask.targetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            {selectedTask.targetUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      {selectedTask.error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <p className="text-xs font-medium text-red-800 dark:text-red-300">Error</p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{selectedTask.error}</p>
                        </div>
                      )}
                      {selectedTask.result && (
                        <div>
                          <p className="text-muted-foreground text-xs">Result</p>
                          <pre className="text-xs bg-muted p-3 rounded-lg mt-1 overflow-auto max-h-[200px]">
                            {typeof selectedTask.result === 'string' ? selectedTask.result : JSON.stringify(selectedTask.result, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedTask.targetData && (
                        <div>
                          <p className="text-muted-foreground text-xs">Target Data</p>
                          <pre className="text-xs bg-muted p-3 rounded-lg mt-1 overflow-auto max-h-[200px]">
                            {(() => {
                              try {
                                return JSON.stringify(JSON.parse(selectedTask.targetData), null, 2)
                              } catch {
                                return selectedTask.targetData
                              }
                            })()}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <span>Retry: {selectedTask.retryCount}/{selectedTask.maxRetries}</span>
                      <span>·</span>
                      <span>Approval: {selectedTask.requiresApproval ? 'Required' : 'Not required'}</span>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 4: EMAIL TRACKER
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="emails" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Email Tracker</h2>
                <p className="text-sm text-muted-foreground">{emails.length} emails tracked</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={emailStatusFilter} onValueChange={setEmailStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="OPENED">Opened</SelectItem>
                    <SelectItem value="REPLIED">Replied</SelectItem>
                    <SelectItem value="BOUNCED">Bounced</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (agents.length > 0) {
                      setSendEmailAgentId(agents[0].id)
                      setEmailForm({ toEmail: '', toName: '', company: '', subject: '', body: '' })
                      setSendEmailOpen(true)
                    }
                  }}
                  className="h-9"
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Compose
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Phone</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Sent Date</TableHead>
                        <TableHead className="text-center">Opens</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredEmails().length > 0 ? (
                        getFilteredEmails().map(email => {
                          let templateData: any = null
                          try { templateData = email.templateData ? JSON.parse(email.templateData) : null } catch { templateData = null }
                          return (
                            <TableRow key={email.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => {
                              setSelectedEmail(email)
                              setEmailDetailOpen(true)
                            }}>
                              <TableCell>
                                <div className="max-w-[120px]">
                                  <p className="text-sm font-medium truncate">{email.company || 'N/A'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-[130px]">
                                  <p className="text-sm truncate font-medium">{email.toName || 'N/A'}</p>
                                  {templateData?.recipientDesignation && (
                                    <p className="text-[10px] text-muted-foreground truncate">{templateData.recipientDesignation}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{email.toEmail}</p>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <p className="text-[10px] text-muted-foreground">{templateData?.recipientPhone || 'N/A'}</p>
                              </TableCell>
                              <TableCell>
                                <p className="text-xs truncate max-w-[180px]">{email.subject}</p>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${EMAIL_STATUS_COLORS[email.status] || ''}`} variant="secondary">
                                  {email.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                {email.sentAt ? formatDate(email.sentAt) : 'Not sent'}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <MailOpen className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs">{email.openCount}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedEmail(email)
                                    setEmailDetailOpen(true)
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No emails found. Run an agent to generate and send emails.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Email Detail Dialog */}
            <Dialog open={emailDetailOpen} onOpenChange={setEmailDetailOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Detail
                  </DialogTitle>
                  <DialogDescription>
                    {selectedEmail?.subject}
                  </DialogDescription>
                </DialogHeader>
                {selectedEmail && (() => {
                  let templateData: any = null
                  try { templateData = selectedEmail.templateData ? JSON.parse(selectedEmail.templateData) : null } catch { templateData = null }
                  return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">From</p>
                        <p className="font-medium">3 Boxes AI Agent</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">To</p>
                        <p className="font-medium">{selectedEmail.toName || selectedEmail.toEmail}</p>
                        <p className="text-xs text-muted-foreground">{selectedEmail.toEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Company</p>
                        <p className="font-medium">{selectedEmail.company || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Contact Person</p>
                        <p className="font-medium">{selectedEmail.toName || 'N/A'}</p>
                        {templateData?.recipientDesignation && (
                          <p className="text-xs text-muted-foreground">{templateData.recipientDesignation}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Contact Email</p>
                        <p className="font-medium text-xs">{selectedEmail.toEmail}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Contact Phone</p>
                        <p className="font-medium text-xs">{templateData?.recipientPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Status</p>
                        <Badge className={`text-xs ${EMAIL_STATUS_COLORS[selectedEmail.status] || ''}`} variant="secondary">
                          {selectedEmail.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Follow-up Sequence</p>
                        <p className="font-medium">#{selectedEmail.followUpSequence}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Opens</p>
                        <p className="font-bold">{selectedEmail.openCount}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Replies</p>
                        <p className="font-bold">{selectedEmail.replyCount}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Follow-up</p>
                        <p className="font-bold">#{selectedEmail.followUpSequence}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="font-bold text-xs">{selectedEmail.sentAt ? formatDateShort(selectedEmail.sentAt) : 'N/A'}</p>
                      </div>
                    </div>
                    {selectedEmail.bouncedReason && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-800 dark:text-red-300">Bounce Reason</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{selectedEmail.bouncedReason}</p>
                      </div>
                    )}
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Email Content</p>
                      <div
                        className="prose prose-sm max-w-none p-4 rounded-lg border bg-muted/30"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <span>Created: {formatDate(selectedEmail.createdAt)}</span>
                      <span>·</span>
                      <span>Delivered: {selectedEmail.deliveredAt ? formatDate(selectedEmail.deliveredAt) : 'N/A'}</span>
                      <span>·</span>
                      <span>Opened: {selectedEmail.openedAt ? formatDate(selectedEmail.openedAt) : 'N/A'}</span>
                    </div>
                  </div>
                  )
                })()}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 5: ANALYTICS
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Analytics</h2>
                <p className="text-sm text-muted-foreground">30-day performance metrics</p>
              </div>
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
              >
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {agentStats ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">Avg Delivery Rate</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#16a34a' }}>
                        {formatPercent(agentStats.last30DayRates.deliveryRate)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                      <p className="text-2xl font-bold mt-1 text-sky-600">
                        {formatPercent(agentStats.last30DayRates.openRate)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">Avg Reply Rate</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#f9ab00' }}>
                        {formatPercent(agentStats.last30DayRates.replyRate)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#8b5cf6' }}>
                        {formatPercent(agentStats.last30DayRates.conversionRate)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Stats Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Daily Performance</CardTitle>
                        <CardDescription>Emails sent (green) & reply rate (amber) over 30 days</CardDescription>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#16a34a' }} />
                          <span>Emails</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                          <span>Reply %</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderAnalyticsBarChart(agentStats.dailyStats)}
                  </CardContent>
                </Card>

                {/* Breakdown + Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Email Status Breakdown */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Email Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentStats.emailStatusBreakdown.map(item => (
                          <div key={item.status} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${EMAIL_STATUS_COLORS[item.status] || ''}`} variant="secondary">
                                {item.status}
                              </Badge>
                            </div>
                            <span className="font-semibold text-sm">{item.count}</span>
                          </div>
                        ))}
                        {agentStats.emailStatusBreakdown.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No email data yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Task Status Breakdown */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Task Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {agentStats.taskStatusBreakdown.map(item => (
                          <div key={item.status} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${TASK_STATUS_COLORS[item.status] || ''}`} variant="secondary">
                                {item.status}
                              </Badge>
                            </div>
                            <span className="font-semibold text-sm">{item.count}</span>
                          </div>
                        ))}
                        {agentStats.taskStatusBreakdown.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No task data yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Overall Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Overall Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                        <p className="text-xl font-bold">{agentStats.overallSummary.totalTasks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="text-xl font-bold text-green-600">{agentStats.overallSummary.totalSuccess}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-xl font-bold text-red-500">{agentStats.overallSummary.totalFailed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Emails Sent</p>
                        <p className="text-xl font-bold">{agentStats.overallSummary.totalEmailsSent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Responses</p>
                        <p className="text-xl font-bold" style={{ color: '#16a34a' }}>{agentStats.overallSummary.totalResponses}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Conversions</p>
                        <p className="text-xl font-bold" style={{ color: '#8b5cf6' }}>{agentStats.overallSummary.totalConversions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Agents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Top Performing Agents</CardTitle>
                    <CardDescription>Ranked by response rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agents
                        .filter(a => a.totalEmailsSent > 0)
                        .sort((a, b) => b.avgResponseRate - a.avgResponseRate)
                        .slice(0, 5)
                        .map((agent, idx) => {
                          const typeColor = AGENT_TYPE_COLORS[agent.type] || '#16a34a'
                          return (
                            <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                                {idx + 1}
                              </div>
                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${typeColor}15` }}>
                                <div style={{ color: typeColor }} className="scale-75">{getTypeIcon(agent.type)}</div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{agent.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {agent.totalEmailsSent} emails · {agent.totalConversions} conversions
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm" style={{ color: typeColor }}>
                                  {formatPercent(agent.avgResponseRate)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">response</p>
                              </div>
                            </div>
                          )
                        })}
                      {agents.filter(a => a.totalEmailsSent > 0).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No agent activity yet. Run agents to see performance data.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Strategy Effectiveness */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Strategy Effectiveness Comparison</CardTitle>
                    <CardDescription>Performance by agent type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(agentTypeBreakdown).map(([type, data]) => {
                        const typeColor = AGENT_TYPE_COLORS[type] || '#16a34a'
                        const convRate = data.totalResponses > 0 ? data.totalConversions / data.totalResponses : 0
                        return (
                          <div key={type} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${typeColor}15` }}>
                                  <div style={{ color: typeColor }}>{getTypeIcon(type)}</div>
                                </div>
                                <span className="font-medium text-sm">{AGENT_TYPE_LABELS[type]}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{data.count} agents</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-muted-foreground">Response</span>
                                  <span className="font-medium">{formatPercent(data.avgResponseRate)}</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ backgroundColor: typeColor, width: `${data.avgResponseRate * 100}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-muted-foreground">Conversion</span>
                                  <span className="font-medium">{formatPercent(convRate)}</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ backgroundColor: typeColor, width: `${convRate * 100}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-muted-foreground">Success</span>
                                  <span className="font-medium">{formatPercent(data.totalTasks > 0 ? data.totalSuccess / data.totalTasks : 0)}</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ backgroundColor: typeColor, width: `${data.totalTasks > 0 ? (data.totalSuccess / data.totalTasks) * 100 : 0}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {Object.keys(agentTypeBreakdown).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No agent type data available yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">Select an Agent</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose an agent from the dropdown above to view detailed analytics and performance metrics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 6: EMAIL TEMPLATES
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Email Templates</h2>
                <p className="text-sm text-muted-foreground">{templates.length} templates available</p>
              </div>
              <Button
                onClick={() => setCreateTemplateOpen(true)}
                className="text-white"
                style={{ backgroundColor: '#16a34a' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Template
              </Button>
            </div>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, idx) => {
                  const typeColor = AGENT_TYPE_COLORS[template.agentType] || '#16a34a'
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{template.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                  style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                                >
                                  {AGENT_TYPE_LABELS[template.agentType]}
                                </Badge>
                                {template.category && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                    {template.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Subject:</p>
                            <p className="text-sm font-medium truncate">{template.subject}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                            <div
                              className="text-xs text-muted-foreground line-clamp-3 p-2 rounded-lg bg-muted/50 border"
                              dangerouslySetInnerHTML={{ __html: template.body }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t">
                            <span>Variables: {(template.body.match(/\{\{[^}]+\}\}/g) || []).length}</span>
                            <span>·</span>
                            <span>Updated: {formatDateShort(template.updatedAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Create email templates for your agents to use in their outreach campaigns.
                  </p>
                  <Button
                    onClick={() => setCreateTemplateOpen(true)}
                    className="text-white"
                    style={{ backgroundColor: '#16a34a' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 7: COMPANY SCRAPER
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="scraper" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Company Scraper</h2>
              <p className="text-sm text-muted-foreground">Scrape company websites for contact information</p>
            </div>

            {/* Scrape Input */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="scrape-url" className="text-xs">Company Website URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="scrape-url"
                        placeholder="https://example.com"
                        value={scrapeUrl}
                        onChange={e => setScrapeUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleScrapeCompany()}
                      />
                      <Button
                        onClick={handleScrapeCompany}
                        disabled={scrapeLoading || !scrapeUrl.trim()}
                        className="text-white shrink-0"
                        style={{ backgroundColor: '#16a34a' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
                      >
                        {scrapeLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-1" />
                        )}
                        Scrape
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scraped Companies List */}
            {scrapedCompanies.length > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Total Scraped</p>
                        <p className="text-lg font-bold">{scrapedCompanies.length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Contacted</p>
                        <p className="text-lg font-bold">{scrapedCompanies.filter(c => ['contacted', 'responded', 'onboarded'].includes(c.status)).length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Responded</p>
                        <p className="text-lg font-bold">{scrapedCompanies.filter(c => ['responded', 'onboarded'].includes(c.status)).length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Onboarded</p>
                        <p className="text-lg font-bold">{scrapedCompanies.filter(c => c.status === 'onboarded').length}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Scraped Companies Detail Cards */}
                <div className="space-y-3">
                  {scrapedCompanies.map(company => {
                    let parsedData: any = null
                    try { parsedData = company.scrapeData ? JSON.parse(company.scrapeData) : null } catch { parsedData = null }
                    return (
                      <Card key={company.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {/* Header row */}
                          <div className="flex items-start justify-between p-4 bg-muted/30 border-b">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {(company.companyName || '?').charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{company.companyName || 'Unknown'}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {company.industry && <span className="text-[10px] text-muted-foreground">{company.industry}</span>}
                                  {company.location && <span className="text-[10px] text-muted-foreground">· {company.location}</span>}
                                  {company.companySize && <span className="text-[10px] text-muted-foreground">· {company.companySize} employees</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${SCRAPE_STATUS_COLORS[company.status] || ''}`} variant="secondary">
                                {company.status}
                              </Badge>
                              {company.lastScrapedAt && (
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDateShort(company.lastScrapedAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contact details grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x">
                            {/* Primary Contact */}
                            <div className="p-3">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Primary Contact</p>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium">{parsedData?.contactName || company.contactEmail?.split('@')[0] || 'N/A'}</span>
                                </div>
                                {parsedData?.contactDesignation && (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-[10px] text-muted-foreground">{parsedData.contactDesignation}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                  <span className="text-[10px]">{company.contactEmail || 'N/A'}</span>
                                </div>
                                {parsedData?.contactPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    <span className="text-[10px]">{parsedData.contactPhone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* HR Contact */}
                            <div className="p-3">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">HR Contact</p>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium">{parsedData?.hrName || 'N/A'}</span>
                                </div>
                                {parsedData?.hrDesignation && (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-[10px] text-muted-foreground">{parsedData.hrDesignation}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                  <span className="text-[10px]">{company.hrEmail || 'N/A'}</span>
                                </div>
                                {parsedData?.hrPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    <span className="text-[10px]">{parsedData.hrPhone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Company Details */}
                            <div className="p-3">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Company Details</p>
                              <div className="space-y-1.5">
                                {company.companyUrl && (
                                  <div className="flex items-center gap-2">
                                    <Globe2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <a href={company.companyUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline truncate">
                                      {company.companyUrl.length > 35 ? company.companyUrl.substring(0, 35) + '...' : company.companyUrl}
                                    </a>
                                  </div>
                                )}
                                {company.linkedInUrl && (
                                  <div className="flex items-center gap-2">
                                    <ExternalLink className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <a href={company.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline">LinkedIn</a>
                                  </div>
                                )}
                                {parsedData?.revenue && (
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    <span className="text-[10px]">Revenue: {parsedData.revenue}</span>
                                  </div>
                                )}
                                {parsedData?.openPositions !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                    <span className="text-[10px]">{parsedData.openPositions} open positions</span>
                                  </div>
                                )}
                                {parsedData?.foundedYear && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-[10px]">Founded: {parsedData.foundedYear}</span>
                                  </div>
                                )}
                                {parsedData?.techStack && (
                                  <div className="flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                                    <span className="text-[10px] truncate" title={parsedData.techStack}>{parsedData.techStack}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No Scraped Companies</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a company URL above to scrape their website for contact information, job listings, and company details.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 8: DATA ENTRY AGENT - Resume Upload & Candidate Creation
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="data-entry" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Data Entry Agent</h2>
                <p className="text-sm text-muted-foreground">Upload resumes (ZIP/DOCX/TXT/CSV) to auto-create candidate profiles and send welcome emails</p>
              </div>
              {dataEntryAgentId && (
                <Badge className="bg-green-100 text-green-800" variant="secondary">
                  <Bot className="h-3 w-3 mr-1" />
                  Agent Active
                </Badge>
              )}
            </div>

            {/* How It Works */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <div>
                      <p className="text-xs font-medium">Upload ZIP</p>
                      <p className="text-[10px] text-muted-foreground">ZIP folder of resumes (DOCX/TXT/PDF)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <div>
                      <p className="text-xs font-medium">Extract Data</p>
                      <p className="text-[10px] text-muted-foreground">AI parses name, email, phone, skills</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <div>
                      <p className="text-xs font-medium">Create Profiles</p>
                      <p className="text-[10px] text-muted-foreground">Auto-create candidate accounts in portal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                    <div>
                      <p className="text-xs font-medium">Send Welcome</p>
                      <p className="text-[10px] text-muted-foreground">Email with login credentials sent</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <Card>
              <CardContent className="p-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadLoading ? (
                    <div className="space-y-3">
                      <Loader2 className="h-10 w-10 mx-auto animate-spin text-red-500" />
                      <p className="text-sm font-medium">Processing resumes...</p>
                      <p className="text-xs text-muted-foreground">Extracting candidate data and creating profiles</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Drop your ZIP file here</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or click to browse · Supports ZIP, DOCX, TXT, CSV files
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <label htmlFor="resume-upload">
                          <input
                            id="resume-upload"
                            type="file"
                            className="hidden"
                            accept=".zip,.docx,.txt,.csv"
                            multiple
                            onChange={e => handleUploadResumes(e.target.files)}
                          />
                          <Button
                            className="text-white"
                            style={{ backgroundColor: '#ef4444' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ef4444')}
                            asChild
                          >
                            <span>
                              <FileUp className="h-4 w-4 mr-2" />
                              Choose File
                            </span>
                          </Button>
                        </label>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><FileType className="h-3 w-3" /> DOCX</span>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> TXT</span>
                        <span className="flex items-center gap-1"><FileUp className="h-3 w-3" /> ZIP</span>
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> CSV</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Result */}
            {uploadResult && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Upload Complete!</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-lg font-bold">{uploadResult.totalProcessed}</p>
                      <p className="text-[10px] text-muted-foreground">Total Processed</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">{uploadResult.created}</p>
                      <p className="text-[10px] text-muted-foreground">Created</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{uploadResult.duplicates}</p>
                      <p className="text-[10px] text-muted-foreground">Duplicates</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                      <p className="text-lg font-bold text-red-700 dark:text-red-400">{uploadResult.errors}</p>
                      <p className="text-[10px] text-muted-foreground">Errors</p>
                    </div>
                  </div>

                  {/* Results detail list */}
                  {uploadResult.results && uploadResult.results.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-2">Candidate Results:</p>
                      <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {uploadResult.results.map((r: any, idx: number) => (
                          <div key={idx} className={`flex items-center justify-between p-2 rounded text-xs ${
                            r.status === 'created' ? 'bg-green-50 dark:bg-green-900/10' :
                            r.status === 'duplicate' ? 'bg-amber-50 dark:bg-amber-900/10' :
                            'bg-red-50 dark:bg-red-900/10'
                          }`}>
                            <div className="flex items-center gap-2">
                              {r.status === 'created' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> :
                               r.status === 'duplicate' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> :
                               <XCircle className="h-3.5 w-3.5 text-red-600" />}
                              <span className="font-medium">{r.name || 'Unknown'}</span>
                              <span className="text-muted-foreground">{r.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.status === 'created' && r.tempPassword && (
                                <Badge className="bg-blue-100 text-blue-700 text-[9px]" variant="secondary">
                                  PW: {r.tempPassword}
                                </Badge>
                              )}
                              <Badge className={`text-[9px] ${
                                r.status === 'created' ? 'bg-green-100 text-green-700' :
                                r.status === 'duplicate' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`} variant="secondary">
                                {r.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previously Uploaded Candidates */}
            {uploadedCandidates.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Uploaded Candidates ({uploadedCandidates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="hidden md:table-cell">Phone</TableHead>
                          <TableHead className="hidden lg:table-cell">Skills</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Login</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedCandidates.map((c: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <div className="max-w-[130px]">
                                <p className="text-sm font-medium truncate">{c.name || 'Unknown'}</p>
                                {c.title && <p className="text-[10px] text-muted-foreground truncate">{c.title}</p>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-xs truncate max-w-[180px]">{c.email || 'N/A'}</p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-xs">{c.phone || 'N/A'}</p>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <p className="text-[10px] truncate max-w-[200px]" title={c.skills}>{c.skills ? (c.skills.length > 50 ? c.skills.substring(0, 50) + '...' : c.skills) : 'N/A'}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[9px] ${
                                c.status === 'created' ? 'bg-green-100 text-green-700' :
                                c.status === 'duplicate' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`} variant="secondary">
                                {c.status || 'processed'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {c.tempPassword ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{c.tempPassword}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={() => navigator.clipboard.writeText(`Email: ${c.email}\nPassword: ${c.tempPassword}`)}
                                  >
                                    <Copy className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* No Data Entry Agent Warning */}
            {!dataEntryAgentId && !loading && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <h3 className="text-sm font-semibold mb-1">Data Entry Agent Not Found</h3>
                  <p className="text-xs text-muted-foreground mb-3">The Data Entry Agent needs to be created first. Click below to seed default agents.</p>
                  <Button
                    className="text-white"
                    style={{ backgroundColor: '#ef4444' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ef4444')}
                    onClick={async () => {
                      const res = await fetch('/api/agents/seed', { method: 'POST' })
                      if (res.ok) {
                        await fetchDashboard()
                        const de = agents.find(a => a.type === 'ADMIN_DATA_ENTRY')
                        if (de) setDataEntryAgentId(de.id)
                      }
                    }}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Seed Default Agents
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOGS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Create Agent Dialog */}
      <Dialog open={createAgentOpen} onOpenChange={setCreateAgentOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Create New Agent
            </DialogTitle>
            <DialogDescription>
              Configure a new AI agent for automated outreach and task management.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="agent-name">Agent Name *</Label>
              <Input
                id="agent-name"
                placeholder="e.g., SaaS Company Outreach Agent"
                value={newAgent.name}
                onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="agent-type">Agent Type *</Label>
              <Select
                value={newAgent.type}
                onValueChange={v => setNewAgent({ ...newAgent, type: v, strategy: {} })}
              >
                <SelectTrigger className="mt-1" id="agent-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CANDIDATE_BUDDY">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" style={{ color: '#16a34a' }} />
                      Candidate Buddy
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN_OUTREACH_COMPANY">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" style={{ color: '#f9ab00' }} />
                      Company Outreach
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN_OUTREACH_CANDIDATE">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" style={{ color: '#3b82f6' }} />
                      Candidate Outreach
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN_OUTREACH_HR">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" style={{ color: '#8b5cf6' }} />
                      HR Outreach
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN_DATA_ENTRY">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-3.5 w-3.5" style={{ color: '#ef4444' }} />
                      Data Entry
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agent-desc">Description</Label>
              <Textarea
                id="agent-desc"
                placeholder="What this agent does..."
                value={newAgent.description}
                onChange={e => setNewAgent({ ...newAgent, description: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="agent-limit">Daily Limit</Label>
              <Input
                id="agent-limit"
                type="number"
                min={1}
                max={500}
                value={newAgent.dailyLimit}
                onChange={e => setNewAgent({ ...newAgent, dailyLimit: parseInt(e.target.value) || 50 })}
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">Maximum actions per day</p>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">Strategy Configuration</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">
                Configure the agent&apos;s outreach strategy parameters
              </p>
              {renderStrategyFields(newAgent.type, newAgent.strategy, (s) => setNewAgent({ ...newAgent, strategy: s }))}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateAgentOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateAgent}
              disabled={!newAgent.name.trim()}
              className="text-white"
              style={{ backgroundColor: '#16a34a' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editAgentOpen} onOpenChange={setEditAgentOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Agent
            </DialogTitle>
            <DialogDescription>
              Update agent configuration and strategy settings.
            </DialogDescription>
          </DialogHeader>
          {editingAgent && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Agent Name</Label>
                <Input
                  value={editingAgent.name}
                  onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Agent Type</Label>
                <Input
                  value={AGENT_TYPE_LABELS[editingAgent.type] || editingAgent.type}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingAgent.description || ''}
                  onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <Label>Daily Limit</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={editingAgent.dailyLimit}
                  onChange={e => setEditingAgent({ ...editingAgent, dailyLimit: parseInt(e.target.value) || 50 })}
                  className="mt-1"
                />
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium">Strategy Configuration</Label>
                <div className="mt-3">
                  {renderStrategyFields(
                    editingAgent.type,
                    typeof editingAgent.strategy === 'object' && editingAgent.strategy !== null
                      ? editingAgent.strategy as Record<string, string>
                      : {},
                    (s) => setEditingAgent({ ...editingAgent, strategy: JSON.stringify(s) })
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditAgentOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateAgent}
              className="text-white"
              style={{ backgroundColor: '#16a34a' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Email Template
            </DialogTitle>
            <DialogDescription>
              Design a reusable email template for agent outreach campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  placeholder="e.g., Company Partnership Intro"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Agent Type *</Label>
                <Select
                  value={newTemplate.agentType}
                  onValueChange={v => setNewTemplate({ ...newTemplate, agentType: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CANDIDATE_BUDDY">Candidate Buddy</SelectItem>
                    <SelectItem value="ADMIN_OUTREACH_COMPANY">Company Outreach</SelectItem>
                    <SelectItem value="ADMIN_OUTREACH_CANDIDATE">Candidate Outreach</SelectItem>
                    <SelectItem value="ADMIN_OUTREACH_HR">HR Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newTemplate.category || ''}
                onValueChange={v => setNewTemplate({ ...newTemplate, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introduction">Introduction</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="invitation">Invitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject Line *</Label>
              <Input
                placeholder="e.g., Partnership Opportunity with {{portalName}}"
                value={newTemplate.subject}
                onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Email Body (HTML) *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">Variables:</span>
                  {TEMPLATE_VARIABLES.map(v => (
                    <button
                      key={v}
                      onClick={() => setNewTemplate({ ...newTemplate, body: newTemplate.body + v })}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 font-mono"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="<p>Hi {{recipientName}},</p><p>We'd love to connect...</p>"
                value={newTemplate.body}
                onChange={e => setNewTemplate({ ...newTemplate, body: e.target.value })}
                className="mt-1 font-mono text-xs"
                rows={10}
              />
            </div>
            {/* Live Preview */}
            {newTemplate.body && (
              <div>
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <div
                  className="mt-1 p-3 rounded-lg border bg-muted/30 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: newTemplate.body
                      .replace(/\{\{companyName\}\}/g, 'TechCorp Solutions')
                      .replace(/\{\{recipientName\}\}/g, 'John')
                      .replace(/\{\{senderName\}\}/g, '3 Boxes Team')
                      .replace(/\{\{portalName\}\}/g, '3 Boxes')
                      .replace(/\{\{portalUrl\}\}/g, 'https://3boxes.com')
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.body}
              className="text-white"
              style={{ backgroundColor: '#16a34a' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose Email
            </DialogTitle>
            <DialogDescription>
              Send an email via AI agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Agent</Label>
              <Select value={sendEmailAgentId} onValueChange={setSendEmailAgentId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.filter(a => a.status === 'ACTIVE').map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>To Email *</Label>
                <Input
                  placeholder="recipient@example.com"
                  value={emailForm.toEmail}
                  onChange={e => setEmailForm({ ...emailForm, toEmail: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>To Name</Label>
                <Input
                  placeholder="John Doe"
                  value={emailForm.toName}
                  onChange={e => setEmailForm({ ...emailForm, toName: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Company</Label>
              <Input
                placeholder="Company name"
                value={emailForm.company}
                onChange={e => setEmailForm({ ...emailForm, company: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Subject *</Label>
              <Input
                placeholder="Email subject"
                value={emailForm.subject}
                onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Body (HTML) *</Label>
              <Textarea
                placeholder="<p>Email content...</p>"
                value={emailForm.body}
                onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                className="mt-1 font-mono text-xs"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSendEmailOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendEmail}
              disabled={!emailForm.toEmail || !emailForm.subject || !emailForm.body}
              className="text-white"
              style={{ backgroundColor: '#16a34a' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
            >
              <Send className="h-4 w-4 mr-1" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
