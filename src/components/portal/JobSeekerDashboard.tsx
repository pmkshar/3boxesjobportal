'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { JobSearchView } from './JobSearchView'
import { ApplicationsView } from './ApplicationsView'
import { ResumeBuilder } from './ResumeBuilder'
import { AiInterviewView } from './AiInterviewView'
import { TrainingView } from './TrainingView'
import { AnalyticsView } from './AnalyticsView'
import { ProfileView } from './ProfileView'
import { Navbar } from './Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, Search, FileText, Brain, GraduationCap, BarChart3,
  User, Briefcase, FileCheck, Target, TrendingUp, Award, ChevronRight,
  Users, Calendar, Clock, MapPin, DollarSign, Star, MessageSquare,
  Eye, CheckCircle2, ArrowUpRight, ArrowDownRight, LogOut, Settings,
} from 'lucide-react'

type View = 'dashboard' | 'jobs' | 'applications' | 'resume' | 'interview' | 'training' | 'analytics' | 'profile'

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Find Jobs', icon: Search },
  { id: 'applications', label: 'Applications', icon: FileCheck },
  { id: 'resume', label: 'CV Manager', icon: FileText },
  { id: 'interview', label: 'AI Interview', icon: Brain },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'profile', label: 'My Profile', icon: User },
]

export function JobSeekerDashboard() {
  const { user } = useAuthStore()
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [recentJobs, setRecentJobs] = useState<any[]>([])

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/analytics?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.summary)
      }
    } catch {}
  }

  const loadRecentJobs = async () => {
    try {
      const res = await fetch('/api/jobs?search=&limit=5')
      if (res.ok) {
        const data = await res.json()
        setRecentJobs(data.jobs || [])
      }
    } catch {}
  }

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
      case 'jobs': return <JobSearchView />
      case 'applications': return <ApplicationsView />
      case 'resume': return <ResumeBuilder />
      case 'interview': return <AiInterviewView />
      case 'training': return <TrainingView />
      case 'analytics': return <AnalyticsView />
      case 'profile': return <ProfileView />
    }
  }

  const profileComplete = 75 // Demo value

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="flex">
        {/* Sidebar - JobBox style dark navy */}
        <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} hidden lg:flex flex-col bg-[#05264E] min-h-[calc(100vh-4rem)] transition-all duration-300 relative`}>
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
                    ? 'active bg-[#0A3575] text-white font-medium'
                    : 'text-[#A3B8D0] hover:bg-[#0A3575]/50 hover:text-white'
                }`}>
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Profile completion ring - only when sidebar open */}
          {sidebarOpen && (
            <div className="px-6 pb-4">
              <div className="border-t border-[#1A3A6B] pt-5">
                <div className="text-center mb-3">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#1A3A6B" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#3B82F6" strokeWidth="6"
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
                <Button size="sm" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs rounded-lg h-8"
                  onClick={() => setActiveView('profile')}>
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          {/* Bottom: Settings & Logout */}
          {sidebarOpen && (
            <div className="px-3 pb-4 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[#0A3575]/50 hover:text-white transition-colors"
                onClick={() => setActiveView('profile')}>
                <Settings className="h-[18px] w-[18px]" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[#0A3575]/50 hover:text-red-400 transition-colors"
                onClick={() => { useAuthStore.getState().logout(); window.location.reload() }}>
                <LogOut className="h-[18px] w-[18px]" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1.5 shadow-lg">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-xs rounded-lg transition-colors ${
                  activeView === item.id ? 'text-[#3B82F6] font-medium' : 'text-[#66789C]'
                }`}>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="truncate max-w-[56px] text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="px-4 lg:px-8 pt-4 pb-0">
            <div className="flex items-center gap-2 text-xs text-[#66789C]">
              <span className="hover:text-[#3B82F6] cursor-pointer">Home</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#05264E] font-medium capitalize">{activeView === 'jobs' ? 'Find Jobs' : activeView === 'resume' ? 'CV Manager' : activeView}</span>
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

function DashboardHome({ stats, recentJobs, onNavigate }: { stats: any; recentJobs: any[]; onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()

  const statCards = [
    { label: 'Interview Schedules', value: stats?.interviewsCompleted || 0, change: '+25%', up: true, icon: Calendar, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Applied Jobs', value: stats?.totalApplications || 0, change: '+5%', up: true, icon: FileCheck, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Task Bids Won', value: stats?.trainingsCompleted || 0, change: '+12%', up: true, icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Application Sent', value: stats?.totalApplications || 0, change: '+5%', up: true, icon: Target, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Profile Viewed', value: 165, change: '+15%', up: true, icon: Eye, color: '#06B6D4', bg: '#ECFEFF' },
    { label: 'New Messages', value: 23, change: '-2%', up: false, icon: MessageSquare, color: '#EF4444', bg: '#FEF2F2' },
    { label: 'Articles Added', value: 8, change: '+2%', up: true, icon: FileText, color: '#F97316', bg: '#FFF7ED' },
    { label: 'CV Added', value: 2, change: '+48%', up: true, icon: FileText, color: '#3B82F6', bg: '#EFF6FF' },
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
    { name: 'Robert Fox', role: 'UI/UX Designer', location: 'Chicago, US', rating: 5, reviews: 65 },
    { name: 'Cody Fisher', role: 'Network Engineer', location: 'New York, US', rating: 5, reviews: 65 },
    { name: 'Jane Cooper', role: 'Content Manager', location: 'Chicago, US', rating: 5, reviews: 65 },
    { name: 'Jerome Bell', role: 'Frontend Developer', location: 'Austin, US', rating: 5, reviews: 65 },
    { name: 'Floyd Miles', role: 'NodeJS Dev', location: 'Boston, US', rating: 5, reviews: 65 },
  ]

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#05264E]">Dashboard</h1>
        <p className="text-sm text-[#66789C]">Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>

      {/* Stat cards - 4 columns on xl, 2 on smaller */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.slice(0, 8).map((s) => (
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
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
        ))}
      </div>

      {/* Main content: 2-column layout like JobBox */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Vacancy Stats Chart placeholder */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Vacancy Stats</h3>
              <Badge variant="outline" className="text-xs text-[#66789C]">Monthly</Badge>
            </div>
            <div className="h-48 bg-gradient-to-r from-[#EFF6FF] to-[#F0F9FF] rounded-lg flex items-end justify-around px-6 pb-4 gap-2">
              {[65, 80, 45, 90, 70, 55, 85, 75, 60, 95, 50, 88].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{ height: `${h}%`, background: `linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%)` }} />
                  <span className="text-[9px] text-[#66789C]">
                    {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Jobs */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Latest Jobs</h3>
              <Button variant="ghost" size="sm" className="text-[#3B82F6] text-xs font-medium hover:bg-[#EFF6FF]"
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
                <div key={job.id} className={`flex items-center justify-between py-3 ${idx < recentJobs.length - 1 ? 'border-b border-[#F0F2F5]' : ''} group hover:bg-[#F9FAFB] -mx-2 px-2 rounded-lg transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#05264E] truncate group-hover:text-[#3B82F6] transition-colors">{job.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-[#E7F0FA] text-[#3B82F6] border-0 font-medium">{job.jobType}</Badge>
                        <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />Just now</span>
                        {job.location && <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{job.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex gap-1">
                      {job.skills?.split(',').slice(0, 2).map((s: string) => (
                        <Badge key={s.trim()} variant="outline" className="text-[10px] h-5 px-1.5 border-[#E4E8EC] text-[#66789C]">{s.trim()}</Badge>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#05264E]">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Top Candidates */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Top Candidates</h3>
              <Button variant="ghost" size="sm" className="text-[#3B82F6] text-xs">View All</Button>
            </div>
            <div className="space-y-0">
              {topCandidates.map((c, idx) => (
                <div key={c.name} className={`flex items-center gap-3 py-2.5 ${idx < topCandidates.length - 1 ? 'border-b border-[#F0F2F5]' : ''}`}>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-semibold">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#05264E]">{c.name}</h4>
                    <p className="text-[10px] text-[#66789C]">{c.role}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-2.5 w-2.5 text-[#66789C]" />
                      <span className="text-[10px] text-[#66789C]">{c.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(c.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-[#F59E0B] fill-[#F59E0B]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Queries */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Queries by Search</h3>
            </div>
            <div className="space-y-3">
              {searchQueries.map((q) => (
                <div key={q.term} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#05264E] group-hover:text-[#3B82F6] transition-colors cursor-pointer">{q.term}</span>
                    <span className="text-xs text-[#66789C]">{q.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#F0F2F5] rounded-full h-1.5">
                    <div className="bg-[#3B82F6] h-1.5 rounded-full transition-all duration-300" style={{ width: `${q.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Career Insights */}
          <div className="bg-gradient-to-br from-[#05264E] to-[#0A3575] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-[#60A5FA]" />
              <h3 className="text-sm font-semibold">AI Career Insights</h3>
            </div>
            <ul className="space-y-2 text-xs text-[#A3B8D0] leading-relaxed">
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
          </div>
        </div>
      </div>
    </div>
  )
}
