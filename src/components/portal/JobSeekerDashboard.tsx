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
} from 'lucide-react'

type View = 'dashboard' | 'jobs' | 'applications' | 'resume' | 'interview' | 'training' | 'analytics' | 'profile'

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Find Jobs', icon: Search },
  { id: 'applications', label: 'Applications', icon: FileCheck },
  { id: 'resume', label: 'Resume Builder', icon: FileText },
  { id: 'interview', label: 'AI Interview', icon: Brain },
  { id: 'training', label: 'Training Hub', icon: GraduationCap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
]

export function JobSeekerDashboard() {
  const { user } = useAuthStore()
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/analytics?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.summary)
      }
    } catch {}
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const init = async () => {
      try {
        const res = await fetch(`/api/analytics?userId=${user?.id}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setStats(data.summary)
        }
      } catch {}
    }
    init()
    return () => { cancelled = true }
  }, [user])

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardHome stats={stats} onNavigate={setActiveView} />
      case 'jobs': return <JobSearchView />
      case 'applications': return <ApplicationsView />
      case 'resume': return <ResumeBuilder />
      case 'interview': return <AiInterviewView />
      case 'training': return <TrainingView />
      case 'analytics': return <AnalyticsView />
      case 'profile': return <ProfileView />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} hidden lg:flex flex-col bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] transition-all`}>
          <div className="p-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full text-left text-xs text-gray-400 hover:text-gray-600">
              {sidebarOpen ? '◀ Collapse' : '▶'}
            </button>
          </div>
          <nav className="flex-1 px-2 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeView === item.id
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-xs ${
                  activeView === item.id ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                <item.icon className="h-4 w-4" />
                <span className="mt-0.5 truncate max-w-[60px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 max-w-6xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

function DashboardHome({ stats, onNavigate }: { stats: any; onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()

  const quickActions = [
    { label: 'Find Jobs', icon: Search, view: 'jobs' as View, color: 'emerald' },
    { label: 'Build Resume', icon: FileText, view: 'resume' as View, color: 'teal' },
    { label: 'AI Interview', icon: Brain, view: 'interview' as View, color: 'cyan' },
    { label: 'Start Training', icon: GraduationCap, view: 'training' as View, color: 'amber' },
  ]

  const statCards = [
    { label: 'Applications', value: stats?.totalApplications || 0, icon: FileCheck, color: 'emerald' },
    { label: 'Interviews', value: stats?.interviewsCompleted || 0, icon: Target, color: 'teal' },
    { label: 'Trainings Done', value: stats?.trainingsCompleted || 0, icon: Award, color: 'cyan' },
    { label: 'Profile Strength', value: `${stats?.profileStrength || 0}%`, icon: TrendingUp, color: 'amber' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-emerald-100 mt-1">Your AI-powered career assistant is ready to help.</p>
        {stats?.avgInterviewScore > 0 && (
          <Badge className="mt-3 bg-white/20 text-white border-0">
            AI Interview Score: {stats.avgInterviewScore}%
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            if (s.label === 'Applications') onNavigate('applications')
            else if (s.label === 'Interviews') onNavigate('interview')
            else if (s.label.includes('Training')) onNavigate('training')
          }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 text-${s.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Card key={action.label} className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => onNavigate(action.view)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-emerald-600" /> AI Career Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Complete your profile to increase visibility by <strong>80%</strong></li>
            <li>• Take the AI Mock Interview to boost your confidence score</li>
            <li>• Enroll in &quot;System Design for Senior Engineers&quot; to match 40% more job postings</li>
            <li>• Add AWS skills to your profile — 65% of current job postings require it</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
