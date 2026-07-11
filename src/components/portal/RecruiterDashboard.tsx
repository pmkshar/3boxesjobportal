'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { ThemeSwitcher } from '@/components/portal/ThemeSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Navbar } from './Navbar'
import { toast } from 'sonner'
import {
  LayoutDashboard, Search, Users, Calendar, BarChart3, UserCheck,
  Briefcase, Target, TrendingUp, Star, Clock, MapPin,
  ChevronRight, Eye, CheckCircle2, ArrowUpRight, ArrowDownRight,
  LogOut, Settings, Home, Menu, X, FileText, Brain, Award,
  MessageSquare, Phone, Mail, Building2, Zap, Plus,
} from 'lucide-react'

type View = 'dashboard' | 'search' | 'pipeline' | 'interviews' | 'analytics' | 'profile'

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Find Candidates', icon: Search },
  { id: 'pipeline', label: 'Pipeline', icon: Target },
  { id: 'interviews', label: 'Interviews', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'profile', label: 'My Profile', icon: UserCheck },
]

export function RecruiterDashboard() {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <RecruiterDashboardHome onNavigate={setActiveView} />
      case 'search': return <CandidateSearch />
      case 'pipeline': return <PipelineView />
      case 'interviews': return <InterviewsView />
      case 'analytics': return <RecruiterAnalytics />
      case 'profile': return <RecruiterProfile />
    }
  }

  const profileComplete = 80

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
                      <circle cx="40" cy="40" r="34" fill="none" stroke={theme.sidebarHover} strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke={theme.primaryRing} strokeWidth="6"
                        strokeDasharray={`${profileComplete * 2.14} 214`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">{profileComplete}%</span>
                  </div>
                  <p className="text-xs text-[#A3B8D0] font-medium">Profile Completed</p>
                  <p className="text-[10px] text-[#6B8AB8] mt-1 leading-tight">Complete your recruiter profile to build trust</p>
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
                <span className="text-[#A3B8D0] text-[10px] uppercase tracking-wider font-semibold">Top</span>
                <span className="block text-xl font-bold text-white -mt-1">RECRUITER</span>
                <p className="text-[9px] text-[#8BA6C4] mt-1 leading-tight">Access premium sourcing tools and analytics</p>
                <Button size="sm" variant="outline" className="w-full mt-3 text-xs h-7 border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10"
                  style={{ color: theme.primary, borderColor: theme.primary }}
                  onClick={() => setActiveView('search')}>
                  Find Candidates
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
                <span className="text-[#05264E] font-medium capitalize">{activeView === 'search' ? 'Find Candidates' : activeView}</span>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-8 pb-24 lg:pb-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

function RecruiterDashboardHome({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()
  const { theme } = useTheme()

  const statCards = [
    { label: 'Placements', value: '12', change: '+18%', up: true, icon: Target, color: '#06B6D4', bg: '#ECFEFF' },
    { label: 'Active Searches', value: '5', change: '+10%', up: true, icon: Search, color: '#10B981', bg: '#ECFDF5' },
    { label: 'In Pipeline', value: '28', change: '+35%', up: true, icon: Users, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Interviews', value: '8', change: '-5%', up: false, icon: Calendar, color: '#8B5CF6', bg: '#F5F3FF' },
  ]

  const recentCandidates = [
    { name: 'Priya Menon', role: 'Data Scientist', skills: 'Python, ML, TensorFlow', match: 95, avatar: 'PM', available: true },
    { name: 'Karthik Iyer', role: 'Senior DevOps', skills: 'AWS, Docker, K8s', match: 88, avatar: 'KI', available: true },
    { name: 'Sneha Reddy', role: 'Product Manager', skills: 'Strategy, Analytics', match: 82, avatar: 'SR', available: false },
    { name: 'Arun Kumar', role: 'Frontend Lead', skills: 'React, TypeScript, Next.js', match: 91, avatar: 'AK', available: true },
    { name: 'Deepa Nair', role: 'UX Designer', skills: 'Figma, Research, Prototyping', match: 79, avatar: 'DN', available: true },
  ]

  const pipelineStages = [
    { name: 'Sourced', count: 45, color: '#3B82F6' },
    { name: 'Screening', count: 32, color: '#06B6D4' },
    { name: 'Shortlisted', count: 18, color: '#10B981' },
    { name: 'Interview', count: 12, color: '#F59E0B' },
    { name: 'Offer', count: 5, color: '#8B5CF6' },
    { name: 'Hired', count: 3, color: '#EF4444' },
  ]

  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const chartValues = [30, 45, 25, 55, 40, 65, 80, 50, 70, 60, 75, 90]
  const maxVal = Math.max(...chartValues)

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-[#A3B8D0] mt-2 text-sm lg:text-base">Source and manage top talent efficiently with AI-powered tools.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm" className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold text-xs rounded-lg px-4 h-9"
              onClick={() => onNavigate('search')}>
              <Search className="h-3.5 w-3.5 mr-1.5" /> Find Candidates
            </Button>
            <Button size="sm" variant="outline" className="border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 font-semibold text-xs rounded-lg px-4 h-9"
              style={{ color: theme.primary, borderColor: theme.primary }}
              onClick={() => onNavigate('pipeline')}>
              <Target className="h-3.5 w-3.5 mr-1.5" /> View Pipeline
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full -mr-20 -mt-20" style={{ backgroundColor: `${theme.primary}15` }} />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full -mb-10" style={{ backgroundColor: `${theme.primary}0D` }} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC] cursor-pointer"
            onClick={() => {
              if (s.label === 'Placements') onNavigate('analytics')
              else if (s.label === 'In Pipeline') onNavigate('pipeline')
              else if (s.label === 'Interviews') onNavigate('interviews')
              else if (s.label === 'Active Searches') onNavigate('search')
            }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#66789C] font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-[#05264E] mt-1">{s.value}</p>
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
        {/* Left: Pipeline chart + Recent Candidates */}
        <div className="xl:col-span-2 space-y-6">
          {/* Placement Stats Chart */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Placement Stats</h3>
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
                        {v} placed
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

          {/* Recent Candidates */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Recent Candidates</h3>
              <Button variant="ghost" size="sm" className="text-[var(--theme-primary)] text-xs font-medium hover:bg-[var(--theme-primary-light)]"
                onClick={() => onNavigate('search')}>
                Find More <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-0">
              {recentCandidates.map((c, idx) => (
                <div key={c.name} className={`flex items-center justify-between py-3.5 ${idx < recentCandidates.length - 1 ? 'border-b border-[#F0F2F5]' : ''} group hover:bg-[#F9FAFB] -mx-2 px-2 rounded-lg transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.primaryRing})` }}>
                        {c.avatar}
                      </div>
                      {c.available && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[#05264E]">{c.name}</h4>
                      <p className="text-[10px] text-[#66789C]">{c.role}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-[#E4E8EC] text-[#66789C]">{c.skills.split(',')[0]}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 ml-3">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.match}%`, backgroundColor: theme.primary }} />
                      </div>
                      <span className="text-[9px] font-medium text-[var(--theme-primary)]">{c.match}%</span>
                    </div>
                    <span className="text-[9px] text-[#66789C]">match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Pipeline Overview + Quick Actions */}
        <div className="space-y-6">
          {/* Pipeline Overview */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#05264E]">Pipeline Overview</h3>
              <Button variant="ghost" size="sm" className="text-[var(--theme-primary)] text-xs"
                onClick={() => onNavigate('pipeline')}>View</Button>
            </div>
            <div className="space-y-3">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-xs font-medium text-[#05264E] group-hover:text-[var(--theme-primary)] transition-colors">{stage.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#05264E]">{stage.count}</span>
                  </div>
                  <div className="w-full bg-[#F0F2F5] rounded-full h-2 ml-4">
                    <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${(stage.count / 45) * 100}%`, backgroundColor: stage.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#F0F2F5] flex items-center justify-between">
              <span className="text-xs text-[#66789C]">Total in pipeline</span>
              <span className="text-sm font-bold text-[#05264E]">{pipelineStages.reduce((a, s) => a + s.count, 0)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel p-5">
            <h3 className="text-base font-semibold text-[#05264E] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs h-9 rounded-lg"
                onClick={() => onNavigate('search')}>
                <Search className="h-3.5 w-3.5 mr-2" /> Find Candidates
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 rounded-lg border-[#E4E8EC] text-[#05264E] hover:bg-[#F9FAFB]"
                onClick={() => onNavigate('pipeline')}>
                <Target className="h-3.5 w-3.5 mr-2" /> View Pipeline
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 rounded-lg border-[#E4E8EC] text-[#05264E] hover:bg-[#F9FAFB]"
                onClick={() => onNavigate('interviews')}>
                <Calendar className="h-3.5 w-3.5 mr-2" /> Schedule Interview
              </Button>
            </div>
          </div>

          {/* AI sourcing card */}
          <div className="bg-gradient-to-br from-[var(--theme-sidebar)] to-[var(--theme-sidebar-hover)] rounded-xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 rounded-full -mr-8 -mb-8" style={{ backgroundColor: `${theme.primary}1A` }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5" style={{ color: theme.primaryRing }} />
                <h3 className="text-sm font-semibold">AI Smart Sourcing</h3>
              </div>
              <ul className="space-y-2 text-xs text-[#A3B8D0] leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>AI matches candidates based on skill fit and cultural alignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>Reduce sourcing time by <strong className="text-white">70%</strong> with smart filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] mt-0.5 flex-shrink-0" />
                  <span>Auto-schedule interviews with AI calendar sync</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CandidateSearch() {
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [expFilter, setExpFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const demoCandidates = [
    { name: 'Priya Menon', role: 'Data Scientist', skills: 'Python, ML, TensorFlow, SQL', location: 'Bangalore', exp: '5 yrs', match: 95 },
    { name: 'Karthik Iyer', role: 'Senior DevOps Engineer', skills: 'AWS, Docker, Kubernetes, Terraform', location: 'Mumbai', exp: '7 yrs', match: 88 },
    { name: 'Sneha Reddy', role: 'Product Manager', skills: 'Strategy, Analytics, Roadmapping', location: 'Hyderabad', exp: '6 yrs', match: 82 },
    { name: 'Arun Kumar', role: 'Frontend Lead', skills: 'React, TypeScript, Next.js, GraphQL', location: 'Chennai', exp: '4 yrs', match: 91 },
    { name: 'Deepa Nair', role: 'UX Designer', skills: 'Figma, User Research, Prototyping', location: 'Delhi', exp: '3 yrs', match: 79 },
    { name: 'Vijay Singh', role: 'Backend Developer', skills: 'Java, Spring Boot, Microservices', location: 'Pune', exp: '5 yrs', match: 85 },
  ]

  const handleSearch = async () => {
    setSearching(true)
    try {
      const res = await fetch(`/api/jobs?search=${searchTerm}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.jobs || [])
      }
    } catch {}
    // Also show demo candidates
    if (demoCandidates.length > 0) {
      setResults(demoCandidates.map((c, i) => ({ id: `cand-${i}`, ...c })))
    }
    setSearching(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#05264E]">Find Candidates</h2>

      {/* Search bar - JobBox style */}
      <div className="panel p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs text-[#66789C] font-medium">Skills / Keywords</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66789C]" />
              <Input placeholder="React, Python, Data Science..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-[#E4E8EC] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary-ring)]/20"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-[#66789C] font-medium">Experience</Label>
            <Input placeholder="3+ years" value={expFilter} onChange={(e) => setExpFilter(e.target.value)}
              className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" />
          </div>
          <div>
            <Label className="text-xs text-[#66789C] font-medium">Location</Label>
            <Input placeholder="Bangalore, Mumbai..." value={locFilter} onChange={(e) => setLocFilter(e.target.value)}
              className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" />
          </div>
        </div>
        <Button className="mt-4 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold text-sm rounded-lg px-6 h-10"
          onClick={handleSearch} disabled={searching}>
          {searching ? 'Searching...' : <><Search className="h-4 w-4 mr-2" /> Search Candidates</>}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((cand: any) => (
            <div key={cand.id} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.primaryRing})` }}>
                    {(cand.name || 'C').split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#05264E]">{cand.name}</h3>
                    <p className="text-xs text-[#66789C]">{cand.role} &bull; {cand.exp || 'N/A'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-[#66789C]" />
                      <span className="text-[10px] text-[#66789C]">{cand.location || 'Remote'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-1">
                    {(cand.skills || '').split(',').slice(0, 3).map((s: string) => (
                      <Badge key={s.trim()} variant="outline" className="text-[10px] h-5 px-1.5 border-[#E4E8EC] text-[#66789C]">{s.trim()}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-[var(--theme-primary)]">{cand.match}%</span>
                    <span className="text-[9px] text-[#66789C]">match</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-[10px] h-7 border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)]"
                    style={{ color: theme.primary, borderColor: theme.primary }}>
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-[#66789C]">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Search for candidates based on skills, experience, and location</p>
        </div>
      )}
    </div>
  )
}

function PipelineView() {
  const { theme } = useTheme()
  const stages = [
    { name: 'Sourced', count: 45, color: theme.primary, bg: theme.primaryLight, candidates: ['Rahul S.', 'Priya M.', 'Karthik I.'] },
    { name: 'Screening', count: 32, color: '#06B6D4', bg: '#ECFEFF', candidates: ['Sneha R.', 'Arun K.'] },
    { name: 'Shortlisted', count: 18, color: '#10B981', bg: '#ECFDF5', candidates: ['Deepa N.', 'Vijay S.'] },
    { name: 'Interview', count: 12, color: '#F59E0B', bg: '#FFFBEB', candidates: ['Meera K.'] },
    { name: 'Offer', count: 5, color: '#8B5CF6', bg: '#F5F3FF', candidates: ['Sanjay P.'] },
    { name: 'Hired', count: 3, color: '#EF4444', bg: '#FEF2F2', candidates: ['Amit J.'] },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#05264E]">Pipeline</h2>
        <Badge variant="outline" className="text-xs border-[#E4E8EC] text-[#66789C]">{stages.reduce((a, s) => a + s.count, 0)} total candidates</Badge>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stages.map((stage) => (
          <div key={stage.name} className="panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
              <h3 className="text-xs font-semibold text-[#05264E]">{stage.name}</h3>
            </div>
            <p className="text-2xl font-bold text-[#05264E] mb-3">{stage.count}</p>
            <div className="space-y-1.5">
              {stage.candidates.map((c) => (
                <div key={c} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px]" style={{ backgroundColor: stage.bg }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-medium" style={{ backgroundColor: stage.color }}>
                    {c.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[#05264E] font-medium">{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InterviewsView() {
  const { theme } = useTheme()
  const interviews = [
    { candidate: 'Sanjay Patel', role: 'Senior Developer', company: 'TechCorp', date: 'Today, 2:00 PM', type: 'Technical', status: 'upcoming' },
    { candidate: 'Meera Krishnan', role: 'Data Scientist', company: 'DataFlow Inc', date: 'Tomorrow, 10:00 AM', type: 'HR Round', status: 'upcoming' },
    { candidate: 'Amit Joshi', role: 'DevOps Lead', company: 'CloudFirst', date: 'Jul 15, 3:00 PM', type: 'Final', status: 'scheduled' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#05264E]">Interviews</h2>
        <Button size="sm" className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs rounded-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Interview
        </Button>
      </div>

      {interviews.length === 0 ? (
        <div className="panel p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-[#66789C]">No interviews scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((intv, idx) => (
            <div key={idx} className="stat-card-hover bg-white rounded-xl p-4 border border-[#E4E8EC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[#E4E8EC]"
                    style={{ background: `linear-gradient(to bottom right, ${theme.primary}1A, ${theme.primaryRing}1A)` }}>
                    <Calendar className="h-5 w-5 text-[var(--theme-primary)]" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#05264E]">{intv.candidate}</h3>
                    <p className="text-[10px] text-[#66789C]">{intv.role} &bull; {intv.company}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`text-[10px] h-5 px-2 border-0 font-medium ${
                    intv.status === 'upcoming' ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)]' : 'bg-[#ECFEFF] text-[#06B6D4]'
                  }`}
                    style={intv.status === 'upcoming' ? { backgroundColor: theme.primaryLight, color: theme.primary } : undefined}>
                    {intv.type}
                  </Badge>
                  <span className="text-[10px] text-[#66789C] flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{intv.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecruiterAnalytics() {
  const statCards = [
    { label: 'Total Placements', value: '150', icon: Target, color: '#06B6D4', bg: '#ECFEFF' },
    { label: 'This Month', value: '12', icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Avg Time to Hire', value: '14 days', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Offer Accept Rate', value: '85%', icon: Award, color: '#8B5CF6', bg: '#F5F3FF' },
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
    </div>
  )
}

function RecruiterProfile() {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    if (user) fetch(`/api/auth/me?userId=${user.id}`).then(r => r.json()).then(d => setProfile(d.recruiterProfile || {}))
  }, [user])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-[#05264E]">My Profile</h2>
      <Card className="border-[#E4E8EC]"><CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.primaryRing})` }}>
            {user?.name?.split(' ').map(n => n[0]).join('') || 'R'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#05264E]">{user?.name}</h3>
            <p className="text-sm text-[#66789C]">Recruiter &bull; {profile.specialization || 'IT & Software'}</p>
          </div>
        </div>
        <Separator className="bg-[#F0F2F5]" />
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-4 bg-[#ECFEFF] rounded-xl">
            <p className="text-2xl font-bold text-[#06B6D4]">{profile.placementCount || 0}</p>
            <p className="text-xs text-[#66789C]">Placements</p>
          </div>
          <div className="text-center p-4 bg-[#FFFBEB] rounded-xl">
            <p className="text-2xl font-bold text-[#F59E0B]">{profile.rating || 0}</p>
            <p className="text-xs text-[#66789C]">Rating</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[#05264E] font-medium">Specialization</Label><Input value={profile.specialization || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" onChange={(e) => setProfile({...profile, specialization: e.target.value})} /></div>
          <div><Label className="text-[#05264E] font-medium">Years Experience</Label><Input value={profile.yearsExperience || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" onChange={(e) => setProfile({...profile, yearsExperience: e.target.value})} /></div>
        </div>
        <div><Label className="text-[#05264E] font-medium">Certifications</Label><Input value={profile.certifications || ''} className="mt-1 border-[#E4E8EC] focus:border-[var(--theme-primary)]" /></div>
        <Button className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-semibold rounded-lg h-10">Save Profile</Button>
      </CardContent></Card>
    </div>
  )
}
