'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
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
} from 'lucide-react'

type View = 'dashboard' | 'post-job' | 'my-jobs' | 'applications' | 'profile' | 'analytics'

const navItems: { id: View; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'post-job', label: 'Post Job', icon: Plus },
  { id: 'my-jobs', label: 'My Jobs', icon: Briefcase },
  { id: 'applications', label: 'Applications', icon: FileCheck },
  { id: 'profile', label: 'Company Profile', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export function CorporateDashboard() {
  const { user } = useAuthStore()
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplications: 0, shortlisted: 0 })
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])

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

  const loadApplications = async () => {
    try {
      const res = await fetch(`/api/applications?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
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
      case 'profile': return <CompanyProfile />
      case 'analytics': return <CorpAnalytics stats={stats} jobs={jobs} />
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
                  activeView === item.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
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
                className={`flex flex-col items-center py-1 px-2 text-xs ${activeView === item.id ? 'text-teal-600' : 'text-gray-400'}`}>
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

function CorpDashboardHome({ stats, jobs, onNavigate }: { stats: any; jobs: any[]; onNavigate: (v: View) => void }) {
  const { user } = useAuthStore()
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-teal-100 mt-1">Manage your job postings and find top talent.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'teal' },
          { label: 'Active Jobs', value: stats.activeJobs, icon: Target, color: 'emerald' },
          { label: 'Applications', value: stats.totalApplications, icon: FileCheck, color: 'cyan' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: Users, color: 'amber' },
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
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Jobs</CardTitle></CardHeader>
          <CardContent>
            {jobs.length === 0 ? <p className="text-sm text-gray-500">No jobs posted yet</p> : (
              <div className="space-y-2">
                {jobs.slice(0, 3).map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.applications?.length || 0} applications</p>
                    </div>
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'} className={job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start bg-teal-600 hover:bg-teal-700" onClick={() => onNavigate('post-job')}>
              <Plus className="h-4 w-4 mr-2" /> Post New Job
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('applications')}>
              <FileCheck className="h-4 w-4 mr-2" /> Review Applications
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" /> View Analytics
            </Button>
          </CardContent>
        </Card>
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
    if (!user || !form.title || !form.description) {
      toast.error('Title and description are required')
      return
    }
    setLoading(true)
    try {
      // Get corporate profile ID
      const meRes = await fetch(`/api/auth/me?userId=${user.id}`)
      const meData = await meRes.json()
      if (!meData.corporateProfile) { toast.error('Corporate profile not found'); return }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          corporateId: meData.corporateProfile.id,
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
      <h2 className="text-xl font-semibold">Post New Job</h2>
      <Card><CardContent className="p-4 space-y-4">
        <div><Label>Title *</Label><Input placeholder="e.g., Senior React Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
        <div><Label>Description *</Label><Textarea placeholder="Describe the role..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="mt-1" /></div>
        <div><Label>Requirements</Label><Textarea placeholder="Required skills and qualifications..." value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="mt-1" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Min Salary (LPA)</Label><Input placeholder="12" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="mt-1" /></div>
          <div><Label>Max Salary (LPA)</Label><Input placeholder="20" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="mt-1" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Job Type</Label>
            <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm">
              <option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="contract">Contract</option><option value="remote">Remote</option>
            </select>
          </div>
          <div><Label>Min Exp (yrs)</Label><Input placeholder="3" value={form.experienceMin} onChange={(e) => setForm({ ...form, experienceMin: e.target.value })} className="mt-1" /></div>
          <div><Label>Max Exp (yrs)</Label><Input placeholder="7" value={form.experienceMax} onChange={(e) => setForm({ ...form, experienceMax: e.target.value })} className="mt-1" /></div>
        </div>
        <div><Label>Location</Label><Input placeholder="Bangalore, India" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" /></div>
        <div><Label>Required Skills (comma-separated)</Label><Input placeholder="React, TypeScript, Node.js" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="mt-1" /></div>
        <div><Label>Benefits</Label><Input placeholder="Health insurance, Stock options, Remote work" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} className="mt-1" /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} className="rounded" />
          <Label>Remote Friendly</Label>
        </div>
        <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </Button>
      </CardContent></Card>
    </div>
  )
}

function MyJobsList({ jobs, onRefresh }: { jobs: any[]; onRefresh: () => void }) {
  const [selectedJob, setSelectedJob] = useState<any>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Jobs ({jobs.length})</h2>
      {jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No jobs posted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(job.postedDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.applications?.length || 0} applications</span>
                  </div>
                </div>
                <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'} className={job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : ''}>
                  {job.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CorpApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadApplications() }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      // For demo, load all recent applications
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
      <h2 className="text-xl font-semibold">Applications</h2>
      {loading ? <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i)=><Card key={i}><CardContent className="p-4"><div className="h-16 bg-gray-200 rounded"/></CardContent></Card>)}</div> :
      applications.length === 0 ? <p className="text-gray-500 py-16 text-center">No applications yet</p> : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Card key={app.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{app.user?.name || 'Candidate'}</p>
                    <p className="text-xs text-gray-500">Match: {app.aiMatchScore || 'N/A'}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{app.status?.replace(/_/g, ' ')}</Badge>
                  <Button size="sm" variant="ghost" className="h-7 text-emerald-600" onClick={() => updateStatus(app.id, 'SHORTLISTED')}>
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-500" onClick={() => updateStatus(app.id, 'REJECTED')}>
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>({})

  useEffect(() => {
    if (user) {
      fetch(`/api/auth/me?userId=${user.id}`).then(r => r.json()).then(d => setProfile(d.corporateProfile || {}))
    }
  }, [user])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Company Profile</h2>
      <Card><CardContent className="p-4 space-y-4">
        <div><Label>Company Name</Label><Input value={profile.companyName || ''} className="mt-1" onChange={(e) => setProfile({...profile, companyName: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Industry</Label><Input value={profile.industry || ''} className="mt-1" onChange={(e) => setProfile({...profile, industry: e.target.value})} /></div>
          <div><Label>Company Size</Label><Input value={profile.companySize || ''} className="mt-1" onChange={(e) => setProfile({...profile, companySize: e.target.value})} /></div>
        </div>
        <div><Label>Website</Label><Input value={profile.website || ''} className="mt-1" /></div>
        <div><Label>Description</Label><Textarea value={profile.description || ''} rows={4} className="mt-1" onChange={(e) => setProfile({...profile, description: e.target.value})} /></div>
        <div><Label>Location</Label><Input value={profile.location || ''} className="mt-1" /></div>
        <Button className="bg-teal-600 hover:bg-teal-700">Save Profile</Button>
      </CardContent></Card>
    </div>
  )
}

function CorpAnalytics({ stats, jobs }: { stats: any; jobs: any[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Jobs', value: stats.totalJobs },
          { label: 'Active Jobs', value: stats.activeJobs },
          { label: 'Applications', value: stats.totalApplications },
          { label: 'Shortlisted', value: stats.shortlisted },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3"><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold">{s.value}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Job Performance</CardTitle></CardHeader>
        <CardContent>
          {jobs.length === 0 ? <p className="text-sm text-gray-500">No data available</p> : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{job.title}</span>
                  <span className="text-sm text-gray-500">{job.applications?.length || 0} apps</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
