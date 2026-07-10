'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from './Navbar'
import {
  LayoutDashboard, Search, Users, Calendar, BarChart3, UserCheck,
  Briefcase, Target, TrendingUp, Star, Clock,
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
  const [activeView, setActiveView] = useState<View>('dashboard')

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)]">
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeView === item.id ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 px-1 py-1">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-xs ${activeView === item.id ? 'text-cyan-600' : 'text-gray-400'}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </div>
        </div>
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 max-w-6xl mx-auto w-full">{renderContent()}</main>
      </div>
    </div>
  )
}

function RecruiterDashboardHome({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-cyan-100 mt-1">Source and manage top talent efficiently.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Placements', value: '12', icon: Target, color: 'cyan' },
          { label: 'Active Searches', value: '5', icon: Search, color: 'teal' },
          { label: 'In Pipeline', value: '28', icon: Users, color: 'emerald' },
          { label: 'Interviews', value: '8', icon: Calendar, color: 'amber' },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
              <div className={`w-10 h-10 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 text-${s.color}-600`} />
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start bg-cyan-600 hover:bg-cyan-700" onClick={() => onNavigate('search')}>
              <Search className="h-4 w-4 mr-2" /> Find Candidates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('pipeline')}>
              <Target className="h-4 w-4 mr-2" /> View Pipeline
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('interviews')}>
              <Calendar className="h-4 w-4 mr-2" /> Schedule Interview
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 3 new candidates matched for Senior Developer role</p>
              <p>• Interview scheduled with Priya M. for Data Scientist</p>
              <p>• 2 candidates moved to offer stage</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CandidateSearch() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Find Candidates</h2>
      <Card><CardContent className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs text-gray-500">Skills</label><input className="w-full border rounded-md px-2 py-1.5 text-sm mt-1" placeholder="React, Python..." /></div>
          <div><label className="text-xs text-gray-500">Experience</label><input className="w-full border rounded-md px-2 py-1.5 text-sm mt-1" placeholder="3+ years" /></div>
          <div><label className="text-xs text-gray-500">Location</label><input className="w-full border rounded-md px-2 py-1.5 text-sm mt-1" placeholder="Bangalore" /></div>
        </div>
        <Button className="mt-3 bg-cyan-600 hover:bg-cyan-700"><Search className="h-4 w-4 mr-2" /> Search Candidates</Button>
      </CardContent></Card>
      <div className="text-center py-12 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Search for candidates based on skills, experience, and location</p>
      </div>
    </div>
  )
}

function PipelineView() {
  const stages = ['Sourced', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired']
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pipeline</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stages.map((stage) => (
          <Card key={stage}>
            <CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium text-gray-500">{stage}</CardTitle></CardHeader>
            <CardContent className="p-3 pt-2">
              <p className="text-xs text-gray-400">No candidates in this stage</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function InterviewsView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Interviews</h2>
      <Card><CardContent className="p-6 text-center text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No interviews scheduled</p>
        <Button className="mt-3 bg-cyan-600 hover:bg-cyan-700">Schedule Interview</Button>
      </CardContent></Card>
    </div>
  )
}

function RecruiterAnalytics() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Placements', value: '150' },
          { label: 'This Month', value: '12' },
          { label: 'Avg Time to Hire', value: '14 days' },
          { label: 'Offer Accept Rate', value: '85%' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3"><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold">{s.value}</p></CardContent></Card>
        ))}
      </div>
    </div>
  )
}

function RecruiterProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    if (user) fetch(`/api/auth/me?userId=${user.id}`).then(r => r.json()).then(d => setProfile(d.recruiterProfile || {}))
  }, [user])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">My Profile</h2>
      <Card><CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-sm text-gray-500">Recruiter</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs">Specialization</label><Input value={profile.specialization || ''} className="mt-1" /></div>
          <div><label className="text-xs">Years Experience</label><Input value={profile.yearsExperience || ''} className="mt-1" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold">{profile.placementCount || 0}</p><p className="text-xs text-gray-500">Placements</p></div>
          <div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-2xl font-bold">{profile.rating || 0}</p><p className="text-xs text-gray-500">Rating</p></div>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">Save Profile</Button>
      </CardContent></Card>
    </div>
  )
}

function Input({ value, className, onChange, placeholder }: { value: string; className?: string; onChange?: (e: any) => void; placeholder?: string }) {
  return <input value={value} onChange={onChange} placeholder={placeholder} className={`border rounded-md px-2 py-1.5 text-sm ${className || ''}`} />
}
