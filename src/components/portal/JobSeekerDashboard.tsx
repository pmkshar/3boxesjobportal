'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { JobSearchView } from './JobSearchView'
import { ApplicationsView } from './ApplicationsView'
import { ResumeBuilder } from './ResumeBuilder'
import { AiInterviewView } from './AiInterviewView'
import { TrainingView } from './TrainingView'
import { AnalyticsView } from './AnalyticsView'
import { ProfileView } from './ProfileView'
import { SkillGapAnalysis } from './SkillGapAnalysis'
import { JobFitEvaluation } from './JobFitEvaluation'
import { ApplicationTracker } from './ApplicationTracker'
import { CandidateBuddyView } from './CandidateBuddyView'
import { Navbar } from './Navbar'
import { ThemeSwitcher } from '@/components/portal/ThemeSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, Search, FileText, Brain, GraduationCap, BarChart3,
  User, Briefcase, FileCheck, Target, TrendingUp, Award, ChevronRight,
  Users, Calendar, Clock, MapPin, DollarSign, Star, MessageSquare,
  Eye, CheckCircle2, ArrowUpRight, ArrowDownRight, LogOut, Settings,
  Monitor, Banknote, Lightbulb, Headphones, BookOpen, FilePlus2,
  BarChart2, UserCheck, Home, X, Menu, ChevronLeft, Bot,
} from 'lucide-react'

type View = 'dashboard' | 'jobs' | 'applications' | 'resume' | 'interview' | 'training' | 'analytics' | 'profile' | 'skill-gap' | 'job-fit' | 'tracker' | 'ai-buddy'

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Find Jobs', icon: Search },
  { id: 'applications', label: 'Applications', icon: FileCheck },
  { id: 'tracker', label: 'Tracker', icon: FileCheck },
  { id: 'resume', label: 'CV Manager', icon: FileText },
  { id: 'interview', label: 'AI Interview', icon: Brain },
  { id: 'ai-buddy', label: 'AI Buddy', icon: Bot },
  { id: 'skill-gap', label: 'Skill Gap', icon: Target },
  { id: 'job-fit', label: 'Job Fit', icon: Target },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'profile', label: 'My Profile', icon: User },
]

export function JobSeekerDashboard() {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [recentJobs, setRecentJobs] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const init = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          fetch(`/api/analytics?userId=${user?.id}`),
          fetch('/api/jobs?search=&limit=5'),
        ])
        if (statsRes.ok && !cancelled) {
          const data = await statsRes.json()
          setStats(data.summary)
        }
        if (jobsRes.ok && !cancelled) {
          const data = await jobsRes.json()
          setRecentJobs(data.jobs || [])
        }
      } catch {}
    }
    init()
    return () => { cancelled = true }
  }, [user])

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardHome stats={stats} recentJobs={recentJobs} onNavigate={setActiveView} />
      case 'jobs': return <JobSearchView embedded />
      case 'applications': return <ApplicationsView />
      case 'tracker': return <ApplicationTracker />
      case 'resume': return <ResumeBuilder />
      case 'interview': return <AiInterviewView />
      case 'ai-buddy': return <CandidateBuddyView />
      case 'skill-gap': return <SkillGapAnalysis />
      case 'job-fit': return <JobFitEvaluation />
      case 'training': return <TrainingView />
      case 'analytics': return <AnalyticsView />
      case 'profile': return <ProfileView />
    }
  }

  const profileComplete = 75

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="flex">
        {/* Sidebar - JobBox style dark navy */}
        <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} hidden lg:flex flex-col bg-[var(--theme-sidebar)] min-h-[calc(100vh-4rem)] transition-all duration-300 relative border-r-0`}>
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className={`h-3 w-3 text-gray-600 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Nav items */}
          <nav className="flex-1 px-3 pt-6 space-y-1">
            {navItems.map((item) => (
              <button key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  activeView === item.id
                    ? 'active bg-[var(--theme-sidebar-hover)] text-white font-medium'
                    : 'text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white'
                }`}>
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Profile completion ring - only when sidebar open */}
          {sidebarOpen && (
            <div className="px-6 pb-4">
              <div className="border-t border-[var(--theme-sidebar-hover)] pt-5">
                <div className="text-center mb-3">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" style={{ stroke: 'var(--theme-sidebar-hover)' }} strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" style={{ stroke: 'var(--theme-sidebar-active)' }} strokeWidth="6"
                        strokeDasharray={`${profileComplete * 2.14} 214`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                      {profileComplete}%
                    </span>
                  </div>
                  <p className="text-xs text-[#A3B8D0] font-medium">Profile Completed</p>
                  <p className="text-[10px] text-[#6B8AB8] mt-1 leading-tight">Add details to boost your career visibility</p>
                </div>
                <Button size="sm" className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs rounded-lg h-8"
                  onClick={() => setActiveView('profile')}>
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          {/* Sidebar hiring banner */}
          {sidebarOpen && (
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-br from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-4 text-center">
                <span className="text-[#A3B8D0] text-[10px] uppercase tracking-wider font-semibold">We Are</span>
                <span className="block text-xl font-bold text-white -mt-1">HIRING</span>
                <p className="text-[9px] text-[#8BA6C4] mt-1 leading-tight">Explore thousands of job opportunities</p>
                <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-7 border-[var(--theme-primary)] text-[var(--theme-sidebar-active)] hover:bg-white/10"
                  onClick={() => setActiveView('jobs')}>
                  Know More
                </Button>
              </div>
            </div>
          )}

          {/* Bottom: ThemeSwitcher, Settings & Logout */}
          <div className="px-3 pb-4 space-y-1">
            {sidebarOpen && (
              <>
                <ThemeSwitcher />
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white transition-colors"
                  onClick={() => setActiveView('profile')}>
                  <Settings className="h-[18px] w-[18px]" />
                  <span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-red-400 transition-colors"
                  onClick={() => { useAuthStore.getState().logout(); window.location.reload() }}>
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Mobile nav overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[var(--theme-sidebar)] flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--theme-sidebar-hover)]">
                <span className="text-white font-bold">3 Boxes Jobs</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#A3B8D0]"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 px-3 pt-4 space-y-1">
                {navItems.map((item) => (
                  <button key={item.id}
                    onClick={() => { setActiveView(item.id); setMobileMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeView === item.id ? 'bg-[var(--theme-sidebar-hover)] text-white font-medium' : 'text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white'
                    }`}>
                    <item.icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="px-3 pb-4 space-y-1">
                <ThemeSwitcher />
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#A3B8D0] hover:text-red-400"
                  onClick={() => { useAuthStore.getState().logout(); window.location.reload() }}>
                  <LogOut className="h-[18px] w-[18px]" /><span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1.5 shadow-lg">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-xs rounded-lg transition-colors ${
                  activeView === item.id ? 'text-[var(--theme-primary)] font-medium' : 'text-[#66789C]'
                }`}>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="truncate max-w-[56px] text-[10px]">{item.label}</span>
              </button>
            ))}
            <button className="flex flex-col items-center py-1 px-2 text-xs text-[#66789C]" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">More</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb - JobBox style */}
          <div className="px-4 lg:px-8 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#66789C]">
                <Home className="h-3.5 w-3.5" />
                <span className="hover:text-[var(--theme-primary)] cursor-pointer">Home</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#05264E] font-medium capitalize">{activeView === 'jobs' ? 'Find Jobs' : activeView === 'resume' ? 'CV Manager' : activeView === 'interview' ? 'AI Interview' : activeView === 'skill-gap' ? 'Skill Gap' : activeView === 'job-fit' ? 'Job Fit' : activeView === 'tracker' ? 'Tracker' : activeView === 'ai-buddy' ? 'AI Buddy' : activeView}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#66789C]">
                <Calendar className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-8 pb-24 lg:pb-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ========== Stat Card Icons (SVG like JobBox) ========== */
function ComputerIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="6" width="32" height="22" rx="3" style={{ stroke: 'var(--theme-primary)', fill: 'var(--theme-primary-light)' }} strokeWidth="2"/>
      <rect x="8" y="10" width="24" height="14" rx="1" style={{ fill: 'var(--theme-primary-medium)' }}/>
      <line x1="16" y1="28" x2="24" y2="28" style={{ stroke: 'var(--theme-primary)' }} strokeWidth="2"/>
      <line x1="12" y1="32" x2="28" y2="32" style={{ stroke: 'var(--theme-primary)' }} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function BankIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="4" width="32" height="32" rx="8" fill="#ECFDF5"/>
      <path d="M12 24h16M12 20h16M12 16h16" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="12" r="2" fill="#10B981"/>
      <path d="M14 28v-4M20 28v-4M26 28v-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function LampIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="4" width="32" height="32" rx="8" fill="#FFFBEB"/>
      <path d="M16 10h8l2 10H14l2-10z" stroke="#F59E0B" strokeWidth="2" fill="#FEF3C7"/>
      <line x1="20" y1="22" x2="20" y2="28" stroke="#F59E0B" strokeWidth="2"/>
      <line x1="16" y1="30" x2="24" y2="30" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 6v2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function HeadphoneIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="4" width="32" height="32" rx="8" fill="#F5F3FF"/>
      <path d="M12 22v-4a8 8 0 1 1 16 0v4" stroke="#8B5CF6" strokeWidth="2" fill="none"/>
      <rect x="10" y="22" width="4" height="8" rx="2" fill="#8B5CF6"/>
      <rect x="26" y="22" width="4" height="8" rx="2" fill="#8B5CF6"/>
    </svg>
  )
}
function LookIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="4" width="32" height="32" rx="8" fill="#ECFEFF"/>
      <circle cx="20" cy="20" r="6" stroke="#06B6D4" strokeWidth="2" fill="none"/>
      <circle cx="20" cy="20" r="2" fill="#06B6D4"/>
      <path d="M10 20c2-5 6-8 10-8s8 3 10 8c-2 5-6 8-10 8s-8-3-10-8z" stroke="#06B6D4" strokeWidth="2" fill="none"/>
    </svg>
  )
}
function DocIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="4" width="32" height="32" rx="8" fill="#FFF7ED"/>
      <rect x="14" y="8" width="12" height="16" rx="2" stroke="#F97316" strokeWidth="2" fill="#FFF7ED"/>
      <path d="M14 8h8l4 4v12" stroke="#F97316" strokeWidth="2"/>
      <line x1="17" y1="16" x2="23" y2="16" stroke="#FB923C" strokeWidth="1.5"/>
      <line x1="17" y1="19" x2="23" y2="19" stroke="#FB923C" strokeWidth="1.5"/>
      <line x1="17" y1="22" x2="21" y2="22" stroke="#FB923C" strokeWidth="1.5"/>
    </svg>
  )
}
function ManIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <rect x="4" y="4" width="32" height="32" rx="8" style={{ fill: 'var(--theme-primary-light)' }}/>
      <circle cx="20" cy="14" r="4" style={{ stroke: 'var(--theme-primary)', fill: 'var(--theme-primary-medium)' }} strokeWidth="2"/>
      <path d="M12 30c0-5 4-8 8-8s8 3 8 8" style={{ stroke: 'var(--theme-primary)' }} strokeWidth="2" fill="none"/>
    </svg>
  )
}

/* ========== Dashboard Home (JobBox Style) ========== */
function DashboardHome({ stats, recentJobs, onNavigate }: { stats: any; recentJobs: any[]; onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()

  const statCards = [
    { label: 'Interview Schedules', value: stats?.interviewsCompleted || 0, change: '+25%', up: true, icon: ComputerIcon, color: 'var(--theme-primary)', bg: 'var(--theme-primary-light)' },
    { label: 'Applied Jobs', value: stats?.totalApplications || 0, change: '+5%', up: true, icon: BankIcon, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Task Bids Won', value: stats?.trainingsCompleted || 0, change: '+12%', up: true, icon: LampIcon, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Application Sent', value: stats?.totalApplications || 0, change: '+5%', up: true, icon: HeadphoneIcon, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Profile Viewed', value: 165, change: '+15%', up: true, icon: LookIcon, color: '#06B6D4', bg: '#ECFEFF' },
    { label: 'New Messages', value: 23, change: '-2%', up: false, icon: MessageSquare, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'Articles Added', value: 8, change: '+2%', up: true, icon: DocIcon, color: '#F97316', bg: '#FFF7ED' },
    { label: 'CV Added', value: 2, change: '+48%', up: true, icon: ManIcon, color: 'var(--theme-primary)', bg: 'var(--theme-primary-light)' },
  ]

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed'
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`
    if (min && max) return `₹${fmt(min)} - ₹${fmt(max)} PA`
    return min ? `₹${fmt(min)}+ PA` : `Up to ₹${fmt(max!)} PA`
  }

  const searchQueries = [
    { term: 'Developer', count: 2635, pct: 100 },
    { term: 'UI/UX Designer', count: 1658, pct: 90 },
    { term: 'Marketing', count: 1452, pct: 80 },
    { term: 'Data Science', count: 1325, pct: 70 },
    { term: 'Product Manager', count: 985, pct: 60 },
    { term: 'DevOps', count: 920, pct: 50 },
  ]

  const topCandidates = [
    { name: 'Robert Fox', role: 'UI/UX Designer', location: 'Chicago, US', rating: 5, reviews: 65, online: true },
    { name: 'Cody Fisher', role: 'Network Engineer', location: 'New York, US', rating: 5, reviews: 65, online: true },
    { name: 'Jane Cooper', role: 'Content Manager', location: 'Chicago, US', rating: 5, reviews: 65, online: false },
    { name: 'Jerome Bell', role: 'Frontend Developer', location: 'Austin, US', rating: 5, reviews: 65, online: true },
    { name: 'Floyd Miles', role: 'NodeJS Dev', location: 'Boston, US', rating: 5, reviews: 65, online: false },
  ]

  const companyLogos = [
    { name: 'Google', color: '#4285F4' },
    { name: 'Microsoft', color: '#00A4EF' },
    { name: 'Amazon', color: '#FF9900' },
    { name: 'Meta', color: '#1877F2' },
    { name: 'Apple', color: '#A2AAAD' },
  ]

  // Chart data for vacancy stats
  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const chartValues = [65, 80, 45, 90, 70, 55, 85, 75, 60, 95, 50, 88]
  const maxVal = Math.max(...chartValues)

  return (
    <div className="space-y-6">
      {/* Welcome Banner - JobBox style */}
      <div className="bg-gradient-to-r from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-[#A3B8D0] mt-2 text-sm lg:text-base">Here&apos;s what&apos;s happening with your job search today.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm" className="bg-white text-[#05264E] hover:bg-gray-100 font-semibold text-xs rounded-lg px-4 h-9"
              onClick={() => onNavigate('jobs')}>
              <Search className="h-3.5 w-3.5 mr-1.5" /> Find Jobs
            </Button>
            <Button size="sm" variant="outline" className="border-[var(--theme-primary)] text-[var(--theme-sidebar-active)] hover:bg-white/10 font-semibold text-xs rounded-lg px-4 h-9"
              onClick={() => onNavigate('resume')}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Build Resume
            </Button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--theme-primary-light)] rounded-full -mr-20 -mt-20" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-[var(--theme-primary-light)] rounded-full -mb-10" />
      </div>

      {/* Stat cards - JobBox 4-col grid with 8 cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.slice(0, 8).map((s) => {
          const IconComp = 'icon' in s && typeof s.icon === 'function' ? s.icon : null
          return (
            <div key={s.label} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC] cursor-pointer"
              onClick={() => {
                if (s.label === 'Applied Jobs' || s.label === 'Application Sent') onNavigate('applications')
                else if (s.label === 'Interview Schedules') onNavigate('interview')
                else if (s.label.includes('Task') || s.label.includes('Article') || s.label.includes('Training')) onNavigate('training')
                else if (s.label === 'Profile Viewed' || s.label === 'CV Added') onNavigate('profile')
              }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#66789C] font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-[#05264E] mt-1">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                </div>
                {IconComp ? <IconComp /> : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {s.up ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>{s.change}</span>
                <span className="text-xs text-[#66789C]">vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main content: 2-column layout like JobBox */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Vacancy Stats Chart - JobBox style with real chart */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Vacancy Stats</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-[#66789C] border-[#E4E8EC]">Monthly</Badge>
              </div>
            </div>
            {/* Chart area */}
            <div className="relative h-56">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] text-[#66789C]">
                <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
              </div>
              {/* Grid lines */}
              <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="border-t border-[#F0F2F5]" />
                ))}
              </div>
              {/* Bars */}
              <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end justify-around gap-2 px-2">
                {chartValues.map((v, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="relative w-full max-w-[32px]">
                      <div
                        className="w-full rounded-t-md transition-all duration-500 hover:opacity-80 cursor-pointer"
                        style={{ height: `${(v / maxVal) * 100}%`, background: 'linear-gradient(180deg, var(--theme-primary) 0%, var(--theme-primary-ring) 100%)' }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#05264E] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {v} vacancies
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* X-axis labels */}
              <div className="absolute left-10 right-0 bottom-0 flex justify-around px-2">
                {chartMonths.map((m) => (
                  <span key={m} className="text-[9px] text-[#66789C] flex-1 text-center">{m}</span>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#F0F2F5]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[var(--theme-primary)]" />
                <span className="text-[10px] text-[#66789C]">Open Positions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[var(--theme-primary-ring)]" />
                <span className="text-[10px] text-[#66789C]">Filled Positions</span>
              </div>
            </div>
          </div>

          {/* Latest Jobs - JobBox card style */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Latest Jobs</h3>
              <Button variant="ghost" size="sm" className="text-[var(--theme-primary)] text-xs font-medium hover:bg-[var(--theme-primary-light)]"
                onClick={() => onNavigate('jobs')}>
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-0">
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-[#66789C]">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No jobs available right now</p>
                </div>
              ) : recentJobs.map((job, idx) => (
                <div key={job.id} className={`flex items-center justify-between py-3.5 ${idx < recentJobs.length - 1 ? 'border-b border-[#F0F2F5]' : ''} group hover:bg-[#F9FAFB] -mx-2 px-2 rounded-lg transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Company logo placeholder */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--theme-primary-light)] to-purple-50 flex items-center justify-center flex-shrink-0 border border-[#E4E8EC]">
                      <Briefcase className="h-5 w-5 text-[var(--theme-primary)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[#05264E] truncate group-hover:text-[var(--theme-primary)] transition-colors">{job.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-0 font-medium">{job.jobType}</Badge>
                        <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />Just now</span>
                        {job.location && <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{job.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {/* Skill tags */}
                    <div className="hidden md:flex gap-1">
                      {job.skills?.split(',').slice(0, 2).map((s: string) => (
                        <Badge key={s.trim()} variant="outline" className="text-[10px] h-5 px-1.5 border-[#E4E8EC] text-[#66789C] rounded-md">{s.trim()}</Badge>
                      ))}
                    </div>
                    {/* Salary */}
                    <span className="text-sm font-bold text-[#05264E] whitespace-nowrap">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Top Candidates - JobBox style */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Top Candidates</h3>
              <Button variant="ghost" size="sm" className="text-[var(--theme-primary)] text-xs">View All</Button>
            </div>
            <div className="space-y-0">
              {topCandidates.map((c, idx) => (
                <div key={c.name} className={`flex items-center gap-3 py-3 ${idx < topCandidates.length - 1 ? 'border-b border-[#F0F2F5]' : ''} hover:bg-[#F9FAFB] -mx-2 px-2 rounded-lg transition-colors cursor-pointer`}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-sidebar-active)] flex items-center justify-center text-white text-xs font-semibold">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#05264E]">{c.name}</h4>
                    <p className="text-[10px] text-[#66789C]">{c.role}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-2.5 w-2.5 text-[#66789C]" />
                      <span className="text-[10px] text-[#66789C]">{c.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-0.5">
                      {[...Array(c.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-[#F59E0B] fill-[#F59E0B]" />
                      ))}
                    </div>
                    <span className="text-[9px] text-[#66789C]">({c.reviews})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Queries - JobBox style */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Queries by Search</h3>
            </div>
            <div className="space-y-3">
              {searchQueries.map((q) => (
                <div key={q.term} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#05264E] group-hover:text-[var(--theme-primary)] transition-colors">{q.term}</span>
                    <span className="text-xs text-[#66789C]">{q.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#F0F2F5] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-ring)] h-2 rounded-full transition-all duration-300" style={{ width: `${q.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Career Insights - JobBox hiring-style card */}
          <div className="bg-gradient-to-br from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-[var(--theme-primary-light)] rounded-full -mr-8 -mb-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary-medium)] flex items-center justify-center">
                  <Brain className="h-4 w-4 text-[var(--theme-sidebar-active)]" />
                </div>
                <h3 className="text-sm font-semibold">AI Career Insights</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#A3B8D0] leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>Complete your profile to increase visibility by <strong className="text-white">80%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>Take the AI Mock Interview to boost your confidence score</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>Enroll in &quot;System Design&quot; to match <strong className="text-white">40%</strong> more jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>Add AWS skills — <strong className="text-white">65%</strong> of current postings require it</span>
                </li>
              </ul>
              <Button size="sm" className="w-full mt-4 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs rounded-lg h-8"
                onClick={() => onNavigate('interview')}>
                Start AI Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
