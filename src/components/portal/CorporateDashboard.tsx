'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { ThemeSwitcher } from '@/components/portal/ThemeSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Navbar } from './Navbar'
import { toast } from 'sonner'
import {
  LayoutDashboard, Briefcase, FileCheck, Building2, BarChart3, Plus,
  Users, TrendingUp, MapPin, Clock, DollarSign, Search, Target,
  ChevronRight, Eye, CheckCircle2, XCircle, Star,
  Calendar, FileText, Brain, GraduationCap, ArrowUpRight, ArrowDownRight,
  LogOut, Settings, User, Home, Menu, X, PieChart, BriefcaseMedical,
  UserCheck, Award, MessageSquare, Globe, Zap,
} from 'lucide-react'

type View = 'dashboard' | 'post-job' | 'my-jobs' | 'applications' | 'find-candidates' | 'profile' | 'analytics'

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'post-job', label: 'Post Job', icon: Plus },
  { id: 'my-jobs', label: 'My Jobs', icon: Briefcase },
  { id: 'applications', label: 'Applications', icon: FileCheck },
  { id: 'find-candidates', label: 'Find Candidates', icon: Search },
  { id: 'profile', label: 'Company Profile', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export function CorporateDashboard() {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplications: 0, shortlisted: 0 })
  const [jobs, setJobs] = useState<any[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const loadJobs = async () => {
    try {
      const profile = await fetch(`/api/auth/me?userId=${user?.id}`).then(r => r.json())
      if (profile.corporateProfile) {
        const res = await fetch(`/api/jobs?search=&limit=50`)
        if (res.ok) {
          const data = await res.json()
          const myJobs = (data.jobs || []).filter((j: any) => j.corporateId === profile.corporateProfile.id)
          setJobs(myJobs)
          setStats({
            totalJobs: myJobs.length,
            activeJobs: myJobs.filter((j: any) => j.status === 'ACTIVE').length,
            totalApplications: myJobs.reduce((acc: number, j: any) => acc + (j.applications?.length || 0), 0),
            shortlisted: 0,
          })
        }
      }
    } catch {}
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const init = async () => {
      try {
        const profile = await fetch(`/api/auth/me?userId=${user.id}`).then(r => r.json())
        if (profile.corporateProfile && !cancelled) {
          const res = await fetch(`/api/jobs?search=&limit=50`)
          if (res.ok) {
            const data = await res.json()
            const myJobs = (data.jobs || []).filter((j: any) => j.corporateId === profile.corporateProfile.id)
            setJobs(myJobs)
            setStats({
              totalJobs: myJobs.length,
              activeJobs: myJobs.filter((j: any) => j.status === 'ACTIVE').length,
              totalApplications: myJobs.reduce((acc: number, j: any) => acc + (j.applications?.length || 0), 0),
              shortlisted: 0,
            })
          }
        }
      } catch {}
    }
    init()
    return () => { cancelled = true }
  }, [user])

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <CorpDashboardHome stats={stats} jobs={jobs} onNavigate={setActiveView} />
      case 'post-job': return <PostJobForm onPosted={loadJobs} />
      case 'my-jobs': return <MyJobsList jobs={jobs} onRefresh={loadJobs} />
      case 'applications': return <CorpApplications />
      case 'find-candidates': return <FindCandidates />
      case 'profile': return <CompanyProfile />
      case 'analytics': return <CorpAnalytics stats={stats} jobs={jobs} />
    }
  }

  const profileComplete = 60

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="flex">
        {/* Sidebar - JobBox style */}
        <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} hidden lg:flex flex-col bg-[var(--theme-sidebar)] min-h-[calc(100vh-4rem)] transition-all duration-300 relative`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ChevronRight className={`h-3 w-3 text-gray-600 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          <nav className="flex-1 px-3 pt-6 space-y-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
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

          {sidebarOpen && (
            <div className="px-6 pb-4">
              <div className="border-t border-[var(--theme-sidebar-hover)] pt-5">
                <div className="text-center mb-3">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" style={{ stroke: theme.sidebarHover }} />
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6"
                        strokeDasharray={`${profileComplete * 2.14} 214`} strokeLinecap="round" style={{ stroke: theme.sidebarActive }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">{profileComplete}%</span>
                  </div>
                  <p className="text-xs text-[#A3B8D0] font-medium">Profile Completed</p>
                  <p className="text-[10px] text-[#6B8AB8] mt-1 leading-tight">Complete your company profile to attract top talent</p>
                </div>
                <Button size="sm" className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs rounded-lg h-8"
                  onClick={() => setActiveView('profile')}>
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          {sidebarOpen && (
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-br from-[var(--theme-sidebar-hover)] to-[var(--theme-sidebar)] rounded-xl p-4 text-center">
                <span className="text-[#A3B8D0] text-[10px] uppercase tracking-wider font-semibold">Need</span>
                <span className="block text-xl font-bold text-white -mt-1">TALENT?</span>
                <p className="text-[9px] text-[#8BA6C4] mt-1 leading-tight">Post your job and reach thousands of candidates</p>
                <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-7 border-[var(--theme-sidebar-active)] text-[var(--theme-sidebar-active)] hover:bg-[var(--theme-sidebar-active)]"
                  onClick={() => setActiveView('post-job')}>
                  Post Job Now
                </Button>
              </div>
            </div>
          )}

          <div className="px-3 pb-4 space-y-1">
            {sidebarOpen && (
              <>
                <ThemeSwitcher />
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white transition-colors"
                  onClick={() => setActiveView('profile')}>
                  <Settings className="h-[18px] w-[18px]" /><span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-red-400 transition-colors"
                  onClick={() => { useAuthStore.getState().logout(); window.location.reload() }}>
                  <LogOut className="h-[18px] w-[18px]" /><span>Logout</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Mobile menu */}
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
                  <button key={item.id} onClick={() => { setActiveView(item.id); setMobileMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeView === item.id ? 'bg-[var(--theme-sidebar-hover)] text-white font-medium' : 'text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white'
                    }`}>
                    <item.icon className="h-[18px] w-[18px]" /><span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1.5 shadow-lg">
          <div className="flex justify-around">
            {navItems.slice(0, 4).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-xs rounded-lg transition-colors ${
                  activeView === item.id ? 'text-[var(--theme-primary)] font-medium' : 'text-[#66789C]'
                }`}>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="truncate max-w-[56px] text-[10px]">{item.label}</span>
              </button>
            ))}
            <button className="flex flex-col items-center py-1 px-2 text-xs text-[#66789C]" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 mb-0.5" /><span className="text-[10px]">More</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#66789C]">
                <Home className="h-3.5 w-3.5" />
                <span className="hover:text-[var(--theme-primary)] cursor-pointer">Home</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#05264E] font-medium capitalize">{activeView === 'post-job' ? 'Post Job' : activeView === 'my-jobs' ? 'My Jobs' : activeView}</span>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-8 pb-24 lg:pb-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

function CorpDashboardHome({ stats, jobs, onNavigate }: { stats: any; jobs: any[]; onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()
  const { theme } = useTheme()

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, change: '+12%', up: true, icon: Briefcase, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Active Jobs', value: stats.activeJobs, change: '+8%', up: true, icon: Target, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Applications', value: stats.totalApplications, change: '+25%', up: true, icon: FileCheck, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Shortlisted', value: stats.shortlisted, change: '-3%', up: false, icon: Users, color: '#8B5CF6', bg: '#F5F3FF' },
  ]

  const recentApplicants = [
    { name: 'Rahul Sharma', role: 'Senior React Developer', match: 92, status: 'New', avatar: 'RS' },
    { name: 'Anita Desai', role: 'Full-Stack Engineer', match: 87, status: 'Screening', avatar: 'AD' },
    { name: 'Vikram Patel', role: 'Backend Developer', match: 78, status: 'Shortlisted', avatar: 'VP' },
    { name: 'Meera Krishnan', role: 'DevOps Engineer', match: 85, status: 'New', avatar: 'MK' },
    { name: 'Arjun Reddy', role: 'Data Scientist', match: 90, status: 'Interview', avatar: 'AR' },
  ]

  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const chartValues = [45, 60, 35, 80, 55, 70, 90, 65, 50, 85, 75, 95]
  const maxVal = Math.max(...chartValues)

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-[#A3B8D0] mt-2 text-sm lg:text-base">Manage your job postings and find top talent for your team.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm" className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold text-xs rounded-lg px-4 h-9"
              onClick={() => onNavigate('post-job')}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Post New Job
            </Button>
            <Button size="sm" variant="outline" className="border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] font-semibold text-xs rounded-lg px-4 h-9"
              onClick={() => onNavigate('applications')}>
              <FileCheck className="h-3.5 w-3.5 mr-1.5" /> Review Applications
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full -mr-20 -mt-20" style={{ backgroundColor: theme.primary + '1A' }} />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full -mb-10" style={{ backgroundColor: theme.primary + '0D' }} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC] cursor-pointer"
            onClick={() => {
              if (s.label === 'Applications' || s.label === 'Shortlisted') onNavigate('applications')
              else if (s.label === 'Active Jobs' || s.label === 'Total Jobs') onNavigate('my-jobs')
            }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#66789C] font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-[#05264E] mt-1">{s.value.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {s.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
              <span className={`text-xs font-medium ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>{s.change}</span>
              <span className="text-xs text-[#66789C]">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left: Application Stats chart + Recent Jobs */}
        <div className="xl:col-span-2 space-y-6">
          {/* Application Stats Chart */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Application Stats</h3>
              <Badge variant="outline" className="text-[10px] text-[#66789C] border-[#E4E8EC]">Monthly</Badge>
            </div>
            <div className="relative h-56">
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] text-[#66789C]">
                <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
              </div>
              <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between">
                {[0,1,2,3,4].map(i => <div key={i} className="border-t border-[#F0F2F5]" />)}
              </div>
              <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end justify-around gap-2 px-2">
                {chartValues.map((v, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="relative w-full max-w-[32px]">
                      <div className="w-full rounded-t-md transition-all duration-500 hover:opacity-80 cursor-pointer"
                        style={{ height: `${(v / maxVal) * 100}%`, background: `linear-gradient(180deg, ${theme.primary} 0%, ${theme.primaryRing} 100%)` }} />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#05264E] text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {v} apps
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute left-10 right-0 bottom-0 flex justify-around px-2">
                {chartMonths.map(m => <span key={m} className="text-[9px] text-[#66789C] flex-1 text-center">{m}</span>)}
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">My Jobs</h3>
              <Button variant="ghost" size="sm" className="text-[var(--theme-primary)] text-xs font-medium hover:bg-[var(--theme-primary-light)]"
                onClick={() => onNavigate('my-jobs')}>
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-[#66789C]">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No jobs posted yet. Post your first job!</p>
                <Button size="sm" className="mt-3 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs rounded-lg"
                  onClick={() => onNavigate('post-job')}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Post Job
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {jobs.slice(0, 5).map((job: any, idx: number) => (
                  <div key={job.id} className={`flex items-center justify-between py-3.5 ${idx < Math.min(jobs.length, 5) - 1 ? 'border-b border-[#F0F2F5]' : ''} group hover:bg-[#F9FAFB] -mx-2 px-2 rounded-lg transition-colors cursor-pointer`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E4E8EC]" style={{ background: `linear-gradient(135deg, ${theme.primary}1A 0%, ${theme.primaryRing}1A 100%)` }}>
                        <Briefcase className="h-5 w-5 text-[var(--theme-primary)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-[#05264E] truncate">{job.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{job.location || 'Remote'}</span>
                          <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{new Date(job.postedDate).toLocaleDateString()}</span>
                          <span className="text-[10px] text-[#66789C] flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{job.applications?.length || 0} apps</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] h-5 px-2 border-0 font-medium ${
                      job.status === 'ACTIVE' ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]' : 'bg-[#F0F2F5] text-[#66789C]'
                    }`}>{job.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Applicants + Quick Actions */}
        <div className="space-y-6">
          {/* Recent Applicants */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Recent Applicants</h3>
              <Button variant="ghost" size="sm" className="text-[var(--theme-primary)] text-xs"
                onClick={() => onNavigate('applications')}>View All</Button>
            </div>
            <div className="space-y-0">
              {recentApplicants.map((a, idx) => (
                <div key={a.name} className={`flex items-center gap-3 py-3 ${idx < recentApplicants.length - 1 ? 'border-b border-[#F0F2F5]' : ''}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-semibold" style={{ background: theme.gradient }}>
                    {a.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#05264E]">{a.name}</h4>
                    <p className="text-[10px] text-[#66789C]">{a.role}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 border-0 font-medium ${
                      a.status === 'New' ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]' :
                      a.status === 'Shortlisted' ? 'bg-[#ECFDF5] text-[#10B981]' :
                      a.status === 'Interview' ? 'bg-[#FFFBEB] text-[#F59E0B]' :
                      'bg-[#F0F2F5] text-[#66789C]'
                    }`}>{a.status}</Badge>
                    <span className="text-[9px] text-[#66789C]">{a.match}% match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel p-5">
            <h3 className="text-base font-semibold text-[#05264E] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs h-9 rounded-lg"
                onClick={() => onNavigate('post-job')}>
                <Plus className="h-3.5 w-3.5 mr-2" /> Post New Job
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 rounded-lg border-[#E4E8EC] text-[#05264E] hover:bg-[#F9FAFB]"
                onClick={() => onNavigate('applications')}>
                <FileCheck className="h-3.5 w-3.5 mr-2" /> Review Applications
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 rounded-lg border-[#E4E8EC] text-[#05264E] hover:bg-[#F9FAFB]"
                onClick={() => onNavigate('analytics')}>
                <BarChart3 className="h-3.5 w-3.5 mr-2" /> View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 rounded-lg border-[#E4E8EC] text-[#05264E] hover:bg-[#F9FAFB]"
                onClick={() => onNavigate('profile')}>
                <Building2 className="h-3.5 w-3.5 mr-2" /> Company Profile
              </Button>
            </div>
          </div>

          {/* Hiring banner */}
          <div className="bg-gradient-to-br from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full -mr-8 -mb-8" style={{ backgroundColor: theme.primary + '1A' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-[var(--theme-sidebar-active)]" />
                <h3 className="text-sm font-semibold">AI-Powered Hiring</h3>
              </div>
              <ul className="space-y-2 text-xs text-[#A3B8D0] leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--theme-sidebar-active)] mt-0.5 flex-shrink-0" />
                  <span>AI matches candidates to your job requirements automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--theme-sidebar-active)] mt-0.5 flex-shrink-0" />
                  <span>Smart screening reduces hiring time by <strong className="text-white">60%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--theme-sidebar-active)] mt-0.5 flex-shrink-0" />
                  <span>Get real-time analytics on applicant quality</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostJobForm({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    salaryMin: '', salaryMax: '', jobType: 'full-time',
    experienceMin: '', experienceMax: '', location: '', isRemote: false,
    skills: '', benefits: '', openings: '1', closingDate: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user || !form.title || !form.description) { toast.error('Title and description are required'); return }
    setLoading(true)
    try {
      const meRes = await fetch(`/api/auth/me?userId=${user.id}`)
      const meData = await meRes.json()
      if (!meData.corporateProfile) { toast.error('Corporate profile not found'); return }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, corporateId: meData.corporateProfile.id,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) * 100000 : null,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) * 100000 : null,
          experienceMin: form.experienceMin ? parseInt(form.experienceMin) : null,
          experienceMax: form.experienceMax ? parseInt(form.experienceMax) : null,
          openings: parseInt(form.openings) || 1,
        }),
      })
      if (res.ok) {
        toast.success('Job posted successfully!')
        setForm({ title: '', description: '', requirements: '', responsibilities: '', salaryMin: '', salaryMax: '', jobType: 'full-time', experienceMin: '', experienceMax: '', location: '', isRemote: false, skills: '', benefits: '', openings: '1', closingDate: '' })
        onPosted()
      } else { toast.error('Failed to post job') }
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#05264E]">Post New Job</h2>
        <Badge variant="outline" className="text-[10px] border-[#E4E8EC] text-[#66789C]">Fill all required fields</Badge>
      </div>
      <Card className="border-[#E4E8EC]"><CardContent className="p-5 space-y-4">
        <div><Label className="text-[#05264E] font-medium">Title *</Label><Input placeholder="e.g., Senior React Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary-ring)]" /></div>
        <div><Label className="text-[#05264E] font-medium">Description *</Label><Textarea placeholder="Describe the role..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary-ring)]" /></div>
        <div><Label className="text-[#05264E] font-medium">Requirements</Label><Textarea placeholder="Required skills and qualifications..." value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary-ring)]" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[#05264E] font-medium">Min Salary (LPA)</Label><Input placeholder="12" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
          <div><Label className="text-[#05264E] font-medium">Max Salary (LPA)</Label><Input placeholder="20" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-[#05264E] font-medium">Job Type</Label>
            <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="mt-1 w-full border border-[#E4E8EC] rounded-md px-2 py-1.5 text-sm focus:border-[var(--theme-primary)] focus:ring-1 focus:ring-[var(--theme-primary-ring)]">
              <option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="contract">Contract</option><option value="remote">Remote</option>
            </select>
          </div>
          <div><Label className="text-[#05264E] font-medium">Min Exp (yrs)</Label><Input placeholder="3" value={form.experienceMin} onChange={(e) => setForm({ ...form, experienceMin: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
          <div><Label className="text-[#05264E] font-medium">Max Exp (yrs)</Label><Input placeholder="7" value={form.experienceMax} onChange={(e) => setForm({ ...form, experienceMax: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
        </div>
        <div><Label className="text-[#05264E] font-medium">Location</Label><Input placeholder="Bangalore, India" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
        <div><Label className="text-[#05264E] font-medium">Required Skills (comma-separated)</Label><Input placeholder="React, TypeScript, Node.js" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
        <div><Label className="text-[#05264E] font-medium">Benefits</Label><Input placeholder="Health insurance, Stock options, Remote work" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} className="mt-1 border-[#E4E8EC]" /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} className="rounded border-[#E4E8EC] accent-[var(--theme-primary)]" />
          <Label className="text-[#05264E]">Remote Friendly</Label>
        </div>
        <Button className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold rounded-lg h-10" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent></Card>
    </div>
  )
}

function MyJobsList({ jobs, onRefresh }: { jobs: any[]; onRefresh: () => void }) {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#05264E]">My Jobs ({jobs.length})</h2>
        <Button size="sm" className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs rounded-lg" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
      {jobs.length === 0 ? (
        <div className="text-center py-16 text-[#66789C]">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No jobs posted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#E4E8EC]" style={{ background: `linear-gradient(135deg, ${theme.primary}1A 0%, ${theme.primaryRing}1A 100%)` }}>
                    <Briefcase className="h-5 w-5 text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#05264E]">{job.title}</h3>
                    <div className="flex gap-3 mt-1 text-xs text-[#66789C]">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.postedDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.applications?.length || 0} apps</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] h-5 px-2 border-0 font-medium ${
                  job.status === 'ACTIVE' ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]' : 'bg-[#F0F2F5] text-[#66789C]'
                }`}>{job.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CorpApplications() {
  const { theme } = useTheme()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadApplications() }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs?limit=50')
      if (res.ok) {
        const data = await res.json()
        const allApps = (data.jobs || []).flatMap((j: any) => j.applications || [])
        setApplications(allApps.slice(0, 20))
      }
    } catch {} finally { setLoading(false) }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) { toast.success(`Status updated to ${status}`); loadApplications() }
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#05264E]">Applications</h2>
      {loading ? (
        <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#E4E8EC]"><div className="h-16 bg-[#F0F2F5] rounded"/></div>
        ))}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-[#66789C]"><Users className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No applications yet</p></div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div key={app.id} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: theme.gradient }}>
                    {(app.user?.name || 'C').split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#05264E]">{app.user?.name || 'Candidate'}</p>
                    <p className="text-[10px] text-[#66789C]">AI Match: {app.aiMatchScore || 'N/A'}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-5 border-[#E4E8EC] text-[#66789C]">{app.status?.replace(/_/g, ' ')}</Badge>
                  <Button size="sm" variant="ghost" className="h-7 text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)]" onClick={() => updateStatus(app.id, 'SHORTLISTED')}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-500 hover:bg-[#FEF2F2]" onClick={() => updateStatus(app.id, 'REJECTED')}>
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyProfile() {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/me?userId=${user.id}`).then(r => r.json()).then(d => setProfile(d.corporateProfile || {}))
    }
  }, [user])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-[#05264E]">Company Profile</h2>
      <Card className="border-[#E4E8EC]"><CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: theme.gradient }}>
            {(profile.companyName || 'C')[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#05264E]">{profile.companyName || 'Company Name'}</h3>
            <p className="text-sm text-[#66789C]">{profile.industry || 'Industry'} • {profile.companySize || 'Size'}</p>
          </div>
        </div>
        <Separator className="bg-[#F0F2F5]" />
        <div><Label className="text-[#05264E] font-medium">Company Name</Label><Input value={profile.companyName || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" onChange={(e) => setProfile({...profile, companyName: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[#05264E] font-medium">Industry</Label><Input value={profile.industry || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" onChange={(e) => setProfile({...profile, industry: e.target.value})} /></div>
          <div><Label className="text-[#05264E] font-medium">Company Size</Label><Input value={profile.companySize || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" onChange={(e) => setProfile({...profile, companySize: e.target.value})} /></div>
        </div>
        <div><Label className="text-[#05264E] font-medium">Website</Label><Input value={profile.website || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" /></div>
        <div><Label className="text-[#05264E] font-medium">Description</Label><Textarea value={profile.description || ''} rows={4} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" onChange={(e) => setProfile({...profile, description: e.target.value})} /></div>
        <div><Label className="text-[#05264E] font-medium">Location</Label><Input value={profile.location || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" /></div>
        <Button className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold rounded-lg h-10">Save Profile</Button>
      </CardContent></Card>
    </div>
  )
}

function FindCandidates() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [expMin, setExpMin] = useState('')
  const [expMax, setExpMax] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (skillFilter) params.set('skills', skillFilter)
      if (locationFilter) params.set('location', locationFilter)
      if (expMin) params.set('experienceMin', expMin)
      if (expMax) params.set('experienceMax', expMax)

      const res = await fetch(`/api/candidates?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setCandidates(data.candidates || [])
      }
    } catch (err) {
      console.error('Error fetching candidates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCandidates() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCandidates()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#05264E]">Find Candidates</h2>
        <Badge variant="outline" className="text-xs border-[var(--theme-primary)] text-[var(--theme-primary)]">{candidates.length} candidates</Badge>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="panel p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input placeholder="Search by name, role, company..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-9 text-sm" />
          </div>
          <Input placeholder="Skills (e.g. React, Python)" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="h-9 text-sm" />
          <Input placeholder="Location (e.g. Bangalore)" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="h-9 text-sm" />
          <div className="flex gap-2">
            <Input placeholder="Min Yrs" type="number" min="0" value={expMin} onChange={e => setExpMin(e.target.value)} className="h-9 text-sm w-1/2" />
            <Input placeholder="Max Yrs" type="number" min="0" value={expMax} onChange={e => setExpMax(e.target.value)} className="h-9 text-sm w-1/2" />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Button type="submit" size="sm" className="text-white bg-[var(--theme-primary)] hover:opacity-90" disabled={loading}>
            <Search className="h-4 w-4 mr-1" /> {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-[#66789C]">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-[#D0D5DD] mb-3" />
          <p className="text-[#66789C]">No candidates found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-[#E4E8EC] p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCandidate(c)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)] font-semibold text-sm">
                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#05264E]">{c.name}</p>
                    <p className="text-xs text-[#66789C]">{c.headline || c.currentRole || 'Job Seeker'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-[#10B981] text-[#10B981] h-5">{c.experienceYears || 0} yrs</Badge>
              </div>
              {c.currentCompany && <p className="text-xs text-[#66789C] mt-2"><Building2 className="h-3 w-3 inline mr-1" />{c.currentCompany}</p>}
              {c.skills && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.skills.split(',').slice(0, 6).map((s: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] h-5 bg-[#F0F2F5] border-0 text-[#66789C]">{s.trim()}</Badge>
                  ))}
                  {c.skills.split(',').length > 6 && <Badge variant="outline" className="text-[10px] h-5 bg-[#F0F2F5] border-0 text-[#66789C]">+{c.skills.split(',').length - 6}</Badge>}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-[#66789C]">
                {c.location && <span><MapPin className="h-3 w-3 inline mr-0.5" />{c.location}</span>}
                {c.education && <span><GraduationCap className="h-3 w-3 inline mr-0.5" />{c.education.split('-')[0].trim()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#05264E]">{selectedCandidate?.name}</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)] font-bold text-xl">
                  {selectedCandidate.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#05264E]">{selectedCandidate.headline || selectedCandidate.currentRole || 'Job Seeker'}</p>
                  {selectedCandidate.currentCompany && <p className="text-sm text-[#66789C]">{selectedCandidate.currentCompany}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedCandidate.email && <div><span className="text-[#66789C]">Email:</span> <span className="text-[#05264E]">{selectedCandidate.email}</span></div>}
                {selectedCandidate.phone && <div><span className="text-[#66789C]">Phone:</span> <span className="text-[#05264E]">{selectedCandidate.phone}</span></div>}
                {selectedCandidate.location && <div><span className="text-[#66789C]">Location:</span> <span className="text-[#05264E]">{selectedCandidate.location}</span></div>}
                {selectedCandidate.experienceYears > 0 && <div><span className="text-[#66789C]">Experience:</span> <span className="text-[#05264E]">{selectedCandidate.experienceYears} years</span></div>}
                {selectedCandidate.education && <div><span className="text-[#66789C]">Education:</span> <span className="text-[#05264E]">{selectedCandidate.education}</span></div>}
                {selectedCandidate.availability && <div><span className="text-[#66789C]">Availability:</span> <span className="text-[#05264E]">{selectedCandidate.availability}</span></div>}
                {selectedCandidate.jobType && <div><span className="text-[#66789C]">Job Type:</span> <span className="text-[#05264E]">{selectedCandidate.jobType}</span></div>}
                {selectedCandidate.linkededInUrl && <div className="col-span-2"><span className="text-[#66789C]">LinkedIn:</span> <a href={selectedCandidate.linkededInUrl} target="_blank" className="text-[var(--theme-primary)] hover:underline ml-1">{selectedCandidate.linkededInUrl}</a></div>}
              </div>
              {selectedCandidate.skills && (
                <div>
                  <p className="text-sm text-[#66789C] mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidate.skills.split(',').map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[11px] h-6 bg-[var(--theme-primary-light)] border-0 text-[var(--theme-primary)]">{s.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedCandidate.bio && (
                <div>
                  <p className="text-sm text-[#66789C] mb-1">About</p>
                  <p className="text-sm text-[#05264E]">{selectedCandidate.bio}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CorpAnalytics({ stats, jobs }: { stats: any; jobs: any[] }) {
  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: Target, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Applications', value: stats.totalApplications, icon: FileCheck, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: Users, color: '#8B5CF6', bg: '#F5F3FF' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#05264E]">Analytics</h2>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC]">
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] uppercase tracking-wider text-[#66789C] font-medium">{s.label}</p><p className="text-2xl font-bold text-[#05264E] mt-1">{s.value}</p></div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="panel p-5">
        <h3 className="text-base font-semibold text-[#05264E] mb-4">Job Performance</h3>
        {jobs.length === 0 ? <p className="text-sm text-[#66789C]">No data available</p> : (
          <div className="space-y-3">
            {jobs.map((job, idx) => (
              <div key={job.id} className={`flex items-center justify-between py-3 ${idx < jobs.length - 1 ? 'border-b border-[#F0F2F5]' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--theme-primary-light)] flex items-center justify-center"><Briefcase className="h-4 w-4 text-[var(--theme-primary)]" /></div>
                  <span className="text-sm font-medium text-[#05264E]">{job.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#66789C]">{job.applications?.length || 0} applications</span>
                  <Badge variant="outline" className={`text-[10px] h-5 px-2 border-0 ${job.status === 'ACTIVE' ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]' : 'bg-[#F0F2F5] text-[#66789C]'}`}>{job.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
