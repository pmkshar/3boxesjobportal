'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Search, MapPin, Briefcase, Building2, Clock, ChevronRight,
  Filter, ChevronLeft, Wifi, X, ArrowLeft, Bookmark, Share2,
  CalendarDays, Users, IndianRupee, Star, TrendingUp, Award,
  CheckCircle2, Globe, Phone, Mail, Linkedin, Facebook, Twitter,
  LayoutGrid, List, MapPinned, SlidersHorizontal, ChevronDown,
  Home, ShieldCheck, Heart, Zap,
} from 'lucide-react'

// Green color palette (3 Boxes brand)
const S = {
  primary: '#16a34a',
  primaryHover: '#15803d',
  accent: '#f9ab00',
  success: '#34a853',
  danger: '#d93025',
  textPrimary: '#202124',
  textSecondary: '#5f6368',
  border: '#ecedf2',
  bgLight: '#f5f7fc',
  bgCard: '#ffffff',
}

// Company color palette for avatars
const companyColors = [
  'bg-[#16a34a]', 'bg-[#34a853]', 'bg-[#f9ab00]', 'bg-[#d93025]',
  'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
]

const getCompanyInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : 'C'

const getCompanyColor = (name?: string) => {
  if (!name) return companyColors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return companyColors[Math.abs(hash) % companyColors.length]
}

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return 'Not disclosed'
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`
  if (min && max) return `₹${fmt(min)} - ₹${fmt(max)}/mo`
  return min ? `₹${fmt(min)}+/mo` : `Up to ₹${fmt(max!)}/mo`
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

// Category filter options
const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'IT & Software', label: 'IT & Software' },
  { value: 'Finance', label: 'Banking & Finance' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Education', label: 'Education' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Engineering', label: 'Engineering' },
]

const jobLevelOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Team Lead' },
  { value: 'manager', label: 'Manager' },
]

export function JobSearchView() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [experience, setExperience] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [category, setCategory] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [jobLevel, setJobLevel] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applying, setApplying] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  // Search tags
  const [searchTags, setSearchTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  useEffect(() => { loadJobs() }, [page, jobType])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search, page: String(page), limit: '9',
        ...(jobType && jobType !== 'all' && { jobType }),
        ...(isRemote && { isRemote: 'true' }),
        ...(location && { location }),
        ...(experience && { experienceMin: experience }),
      })
      const res = await fetch(`/api/jobs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
        setTotalPages(data.totalPages || 1)
        setTotalJobs(data.total || (data.jobs || []).length)
      }
    } catch {} finally { setLoading(false) }
  }

  const handleApply = async (jobId: string) => {
    if (!user) { toast.error('Please login first'); return }
    setApplying(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, userId: user.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Application submitted! AI Match: ${data.aiMatchScore}%`)
      } else {
        toast.error(data.error || 'Failed to apply')
      }
    } catch { toast.error('Network error') }
    finally { setApplying(false) }
  }

  const toggleSave = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedJobs(prev => {
      const next = new Set(prev)
      if (next.has(jobId)) { next.delete(jobId); toast.info('Job removed from saved') }
      else { next.add(jobId); toast.success('Job saved!') }
      return next
    })
  }

  const clearFilters = () => {
    setSearch(''); setLocation(''); setJobType(''); setExperience(''); setIsRemote(false)
    setCategory(''); setSalaryRange(''); setJobLevel(''); setSearchTags([]); setPage(1); loadJobs()
  }

  const hasActiveFilters = search || location || (jobType && jobType !== 'all') || experience || isRemote || category || salaryRange || jobLevel || searchTags.length > 0

  // Add search tag
  const addSearchTag = (tag: string) => {
    const t = tag.trim()
    if (t && !searchTags.includes(t)) {
      setSearchTags(prev => [...prev, t])
      setSearch(prev => prev ? `${prev} ${t}` : t)
    }
  }

  const removeSearchTag = (tag: string) => {
    setSearchTags(prev => prev.filter(t => t !== tag))
    setSearch(prev => prev.replace(tag, '').replace(/\s+/g, ' ').trim())
  }

  // Related jobs
  const relatedJobs = jobs.filter(j => j.id !== selectedJob?.id).slice(0, 4)

  // ========== FULL-PAGE JOB DETAIL VIEW ==========
  if (selectedJob) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        {/* Sticky top action bar */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#16a34a] to-[#15803d] py-3 px-4 sm:px-6 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button onClick={() => { setSelectedJob(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex items-center gap-2 text-white/90 hover:text-white text-sm transition-colors group bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
            </button>
            <div className="flex-1" />
            <Button className="bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-semibold h-9 px-5 shadow-md" disabled={applying} onClick={() => handleApply(selectedJob.id)}>
              {applying ? 'Applying...' : 'Apply Now'}
            </Button>
            <Button variant="outline" className="h-9 px-3 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={(e) => toggleSave(selectedJob.id, e)}>
              <Bookmark className={`h-4 w-4 ${savedJobs.has(selectedJob.id) ? 'fill-white' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Job Header - Green banner */}
        <div className="relative bg-gradient-to-r from-[#16a34a] to-[#15803d] pb-8 pt-4 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${getCompanyColor(selectedJob.corporate?.companyName)} flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0 shadow-lg ring-2 ring-white/30`}>
                {getCompanyInitial(selectedJob.corporate?.companyName)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{selectedJob.title}</h1>
                <p className="text-white/80 mt-0.5 text-sm sm:text-base">{selectedJob.corporate?.companyName}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/70 mt-2">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {selectedJob.location || 'Remote'}</span>
                  {selectedJob.experienceMin && (
                    <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {selectedJob.experienceMin}-{selectedJob.experienceMax} Yrs</span>
                  )}
                  <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4" /> {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                  {selectedJob.postedDate && (
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {timeAgo(selectedJob.postedDate)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-[rgba(22,163,74,0.3)] text-white border-0 rounded-full px-4 py-1">{selectedJob.jobType}</Badge>
              {selectedJob.isRemote && <Badge className="bg-[rgba(52,168,83,0.3)] text-white border-0 rounded-full px-4 py-1">Remote Friendly</Badge>}
              {selectedJob.openings && <Badge className="bg-[rgba(249,171,0,0.3)] text-white border-0 rounded-full px-4 py-1"><Users className="h-3 w-3 mr-1" />{selectedJob.openings} Openings</Badge>}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedJob.description && (
                <Card className="border-[#ecedf2]">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-[#202124] text-lg mb-4">Job Description</h3>
                    <div className="text-[#5f6368] text-[15px] leading-[26px] whitespace-pre-line">{selectedJob.description}</div>
                  </CardContent>
                </Card>
              )}

              {selectedJob.responsibilities && (
                <Card className="border-[#ecedf2]">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-[#202124] text-lg mb-4">Key Responsibilities</h3>
                    <ul className="space-y-2.5">
                      {selectedJob.responsibilities.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-[#5f6368] text-[15px] leading-[22px]">
                          <CheckCircle2 className="h-5 w-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                          <span>{line.replace(/^[-•*]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {selectedJob.requirements && (
                <Card className="border-[#ecedf2]">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-[#202124] text-lg mb-4">Skills & Experience</h3>
                    <ul className="space-y-2.5">
                      {selectedJob.requirements.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-[#5f6368] text-[15px] leading-[22px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] flex-shrink-0 mt-2" />
                          <span>{line.replace(/^[-•*]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="border-[#ecedf2]">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[#202124] text-lg mb-4">Share This Job</h3>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16a34a] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                      <Facebook className="h-4 w-4" /> Facebook
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#15803d] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                      <Twitter className="h-4 w-4" /> Twitter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22c55e] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#202124] text-lg">Related Jobs</h3>
                    <span className="text-sm text-[#5f6368]">{jobs.length} jobs live</span>
                  </div>
                  <div className="space-y-3">
                    {relatedJobs.map((job) => (
                      <Card key={job.id} className="border-[#ecedf2] hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => { setSelectedJob(job); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                              {getCompanyInitial(job.corporate?.companyName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[#202124] text-sm group-hover:text-[#16a34a] transition-colors truncate">{job.title}</h4>
                              <div className="flex items-center gap-3 text-xs text-[#5f6368] mt-0.5">
                                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.corporate?.companyName}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</span>
                                <span className="font-medium text-[#16a34a]">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 flex-shrink-0">
                              <Badge className="bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 text-[11px] rounded-full px-3">{job.jobType}</Badge>
                              {job.isRemote && <Badge className="bg-[rgba(52,168,83,0.15)] text-[#34a853] border-0 text-[11px] rounded-full px-3">Remote</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Card className="border-[#ecedf2]">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-[#202124] mb-4">Job Overview</h4>
                  <div className="space-y-4">
                    {[
                      { icon: CalendarDays, label: 'Date Posted', value: selectedJob.postedDate ? timeAgo(selectedJob.postedDate) : 'Recently', color: 'text-[#16a34a]' },
                      { icon: Clock, label: 'Expiration', value: selectedJob.closingDate ? timeAgo(selectedJob.closingDate) : '30 days left', color: 'text-[#d93025]' },
                      { icon: MapPin, label: 'Location', value: selectedJob.location || 'Remote', color: 'text-[#34a853]' },
                      { icon: Briefcase, label: 'Job Title', value: selectedJob.title, color: 'text-[#16a34a]' },
                      { icon: Clock, label: 'Hours', value: selectedJob.jobType === 'part-time' ? 'Part Time' : 'Full Time', color: 'text-[#f9ab00]' },
                      { icon: Star, label: 'Rate', value: selectedJob.jobType || 'Full Time', color: 'text-[#16a34a]' },
                      { icon: IndianRupee, label: 'Salary', value: formatSalary(selectedJob.salaryMin, selectedJob.salaryMax), color: 'text-[#34a853]' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#f5f7fc] flex items-center justify-center flex-shrink-0">
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-[#5f6368]">{item.label}</p>
                          <p className="text-sm font-medium text-[#202124] truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedJob.skills && (
                <Card className="border-[#ecedf2]">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-[#202124] mb-4">Job Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.split(',').map((s: string) => (
                        <Badge key={s.trim()} className="bg-[#f5f7fc] text-[#5f6368] border border-[#ecedf2] hover:bg-green-50 hover:text-[#16a34a] rounded-md px-3 py-1.5 text-sm font-normal transition-colors cursor-pointer">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-[#ecedf2]">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-[#202124] mb-4">Company Info</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl ${getCompanyColor(selectedJob.corporate?.companyName)} flex items-center justify-center text-white font-bold text-xl`}>
                      {getCompanyInitial(selectedJob.corporate?.companyName)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#202124]">{selectedJob.corporate?.companyName}</p>
                      <button className="text-sm text-[#16a34a] hover:underline">View company profile</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: Building2, label: 'Primary Industry', value: 'Technology' },
                      { icon: Users, label: 'Company Size', value: '1,000 - 5,000' },
                      { icon: CalendarDays, label: 'Founded In', value: '2010' },
                      { icon: Phone, label: 'Phone', value: '+91 123 456 7890' },
                      { icon: Mail, label: 'Email', value: 'hr@company.com' },
                      { icon: MapPin, label: 'Location', value: selectedJob.location || 'India' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <item.icon className="h-4 w-4 text-[#5f6368] flex-shrink-0" />
                        <span className="text-[#5f6368] min-w-[110px]">{item.label}:</span>
                        <span className="font-medium text-[#202124]">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                      <button className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Facebook className="h-3.5 w-3.5" /></button>
                      <button className="w-8 h-8 rounded-full bg-[#15803d] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Twitter className="h-3.5 w-3.5" /></button>
                      <button className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Linkedin className="h-3.5 w-3.5" /></button>
                      <button className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Globe className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#ecedf2] bg-gradient-to-br from-[#16a34a] to-[#15803d]">
                <CardContent className="p-5 text-center">
                  <h4 className="font-semibold text-white mb-2">Interested in this job?</h4>
                  <p className="text-white/70 text-sm mb-4">Apply now and get a response within 48 hours</p>
                  <Button className="w-full bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-semibold h-11 shadow-md" disabled={applying} onClick={() => handleApply(selectedJob.id)}>
                    {applying ? 'Applying...' : 'Apply For This Job'}
                  </Button>
                  <Button variant="outline" className="w-full mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20 h-10" onClick={(e) => toggleSave(selectedJob.id, e)}>
                    <Bookmark className={`h-4 w-4 mr-2 ${savedJobs.has(selectedJob.id) ? 'fill-white' : ''}`} />
                    {savedJobs.has(selectedJob.id) ? 'Saved' : 'Save Job'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== MAIN JOB GRID VIEW (JobHub-style) ==========
  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      {/* ===== TOP BANNER (JobHub style) ===== */}
      <div className="bg-gradient-to-r from-[#16a34a] to-[#15803d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 22v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0z\' fill=\'%23ffffff\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          {/* Heading */}
          <h4 className="text-2xl sm:text-[28px] font-bold text-white leading-tight mb-1.5">
            There Are <span className="text-[#f9ab00]">{totalJobs}</span> Jobs<br className="sm:hidden" /> Here For You!
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <p className="text-white/60 text-sm">Discover your next career move, freelance gig, or internship</p>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/80">Jobs listing</span>
            </div>
          </div>

          {/* ===== SEARCH BOX (embedded in banner, JobHub style) ===== */}
          <div className="bg-white rounded-[15px] shadow-xl p-4 sm:p-5 -mb-20 relative z-10">
            <div className="flex flex-col lg:flex-row gap-3 items-end">
              {/* Search Input + Tags */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
                  <Input
                    placeholder="Job title, keyword, or company"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 bg-[#f5f7fc] border-[#ecedf2] focus:border-[#16a34a] focus:bg-white text-sm rounded-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (search.trim()) addSearchTag(search.trim())
                        loadJobs()
                      }
                    }}
                  />
                </div>
                {/* Search tags row */}
                {searchTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {searchTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] text-xs font-medium px-2.5 py-1 rounded-md">
                        {tag}
                        <button onClick={() => removeSearchTag(tag)} className="hover:text-[#d93025] transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Type Dropdown */}
              <div className="w-full lg:w-[160px]">
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-full h-11 bg-[#f5f7fc] border-[#ecedf2] text-sm rounded-lg">
                    <Briefcase className="h-4 w-4 mr-2 text-[#5f6368]" />
                    <SelectValue placeholder="Full time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Dropdown */}
              <div className="w-full lg:w-[180px]">
                <Select value={location || 'all'} onValueChange={(v) => setLocation(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full h-11 bg-[#f5f7fc] border-[#ecedf2] text-sm rounded-lg">
                    <MapPin className="h-4 w-4 mr-2 text-[#5f6368]" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range Dropdown */}
              <div className="w-full lg:w-[160px]">
                <Select value={salaryRange} onValueChange={setSalaryRange}>
                  <SelectTrigger className="w-full h-11 bg-[#f5f7fc] border-[#ecedf2] text-sm rounded-lg">
                    <IndianRupee className="h-4 w-4 mr-2 text-[#5f6368]" />
                    <SelectValue placeholder="Salary Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="0-3">₹0 - ₹3L PA</SelectItem>
                    <SelectItem value="3-6">₹3L - ₹6L PA</SelectItem>
                    <SelectItem value="6-10">₹6L - ₹10L PA</SelectItem>
                    <SelectItem value="10-15">₹10L - ₹15L PA</SelectItem>
                    <SelectItem value="15-25">₹15L - ₹25L PA</SelectItem>
                    <SelectItem value="25+">₹25L+ PA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Find Now Button */}
              <div className="w-full lg:w-auto">
                <Button onClick={() => { if (search.trim()) addSearchTag(search.trim()); loadJobs() }} className="w-full lg:w-auto bg-[#16a34a] hover:bg-[#15803d] h-11 px-8 font-semibold shadow-md rounded-lg">
                  Find Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ===== LEFT SIDEBAR (Filters - JobHub style) ===== */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 order-2 lg:order-1">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden w-full flex items-center justify-between bg-white rounded-xl p-4 shadow-sm mb-4"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#16a34a]" />
                <span className="font-medium text-sm text-[#202124]">Filters</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-[#5f6368] transition-transform ${showMobileFilter ? 'rotate-180' : ''}`} />
            </button>

            <div className={`space-y-5 ${showMobileFilter ? 'block' : 'hidden'} lg:block lg:sticky lg:top-24`}>

              {/* Job Reminder Widget */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-[#16a34a] to-[#15803d]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-[#f9ab00]" />
                    <h5 className="font-semibold text-white">Set Job Reminder</h5>
                  </div>
                  <p className="text-white/70 text-xs mb-4">Enter your email and get notified when new jobs are posted.</p>
                  <div className="space-y-2">
                    <Input placeholder="Enter email address" className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm focus:bg-white/20 rounded-lg" />
                    <Button className="w-full bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-semibold h-9 text-sm rounded-lg">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Location Filter */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h5 className="font-semibold text-[#202124] text-sm mb-3">Location</h5>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
                    <Input
                      placeholder="City, state, or country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9 h-9 bg-[#f5f7fc] border-[#ecedf2] text-sm focus:border-[#16a34a] rounded-lg"
                      onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Filter */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h5 className="font-semibold text-[#202124] text-sm mb-3">Category</h5>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full h-9 bg-[#f5f7fc] border-[#ecedf2] text-sm rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Job Level Filter */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h5 className="font-semibold text-[#202124] text-sm mb-3">Job Level</h5>
                  <Select value={jobLevel} onValueChange={setJobLevel}>
                    <SelectTrigger className="w-full h-9 bg-[#f5f7fc] border-[#ecedf2] text-sm rounded-lg">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobLevelOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Job Type Filter (Radio) */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h5 className="font-semibold text-[#202124] text-sm mb-3">Job Type</h5>
                  <div className="space-y-2.5">
                    {[
                      { value: 'all', label: 'All Types', count: totalJobs },
                      { value: 'full-time', label: 'Full Time', count: Math.floor(totalJobs * 0.5) },
                      { value: 'part-time', label: 'Part Time', count: Math.floor(totalJobs * 0.2) },
                      { value: 'contract', label: 'Contract', count: Math.floor(totalJobs * 0.15) },
                      { value: 'remote', label: 'Remote', count: Math.floor(totalJobs * 0.25) },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="jobType"
                            checked={jobType === type.value || (!jobType && type.value === 'all')}
                            onChange={() => setJobType(type.value)}
                            className="w-4 h-4 accent-[#16a34a]"
                          />
                          <span className="text-sm text-[#5f6368] group-hover:text-[#202124] transition-colors">{type.label}</span>
                        </div>
                        <Badge className="text-[10px] bg-[#f5f7fc] text-[#5f6368] border-0 rounded-full px-2">{type.count}</Badge>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Filter (Radio) */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h5 className="font-semibold text-[#202124] text-sm mb-3">Experience</h5>
                  <div className="space-y-2.5">
                    {[
                      { value: '', label: 'All Experience' },
                      { value: '0', label: 'Fresher' },
                      { value: '1', label: '1+ Years' },
                      { value: '3', label: '3+ Years' },
                      { value: '5', label: '5+ Years' },
                      { value: '10', label: '10+ Years' },
                    ].map((exp) => (
                      <label key={exp.value} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="experience"
                          checked={experience === exp.value}
                          onChange={() => setExperience(exp.value)}
                          className="w-4 h-4 accent-[#16a34a]"
                        />
                        <span className="text-sm text-[#5f6368] group-hover:text-[#202124] transition-colors">{exp.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tags Cloud */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h5 className="font-semibold text-[#202124] text-sm mb-3">Popular Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'Python', 'AWS', 'Java', 'SQL', 'TypeScript', 'Docker', 'Kubernetes', 'ML', 'Data Science', 'DevOps'].map(tag => (
                      <Badge key={tag} onClick={() => { addSearchTag(tag); setSearch(prev => prev ? `${prev} ${tag}` : tag) }}
                        className="text-xs bg-[#f5f7fc] text-[#5f6368] border border-[#ecedf2] hover:bg-green-50 hover:text-[#16a34a] hover:border-[#16a34a]/30 rounded-lg px-2.5 py-1 cursor-pointer transition-all font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </aside>

          {/* ===== RIGHT MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0 order-1 lg:order-2">

            {/* Results Header Bar - Sort + View Toggle (JobHub style) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 bg-white rounded-xl p-3.5 shadow-sm">
              <div>
                {loading ? (
                  <span className="text-sm text-[#5f6368]">Searching...</span>
                ) : (
                  <span className="text-sm text-[#5f6368]">
                    Showing <strong className="text-[#202124]">{jobs.length}</strong> of <strong className="text-[#202124]">{totalJobs}</strong> jobs
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5f6368]">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[130px] h-8 text-xs bg-[#f5f7fc] border-[#ecedf2] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest Post</SelectItem>
                      <SelectItem value="oldest">Oldest Post</SelectItem>
                      <SelectItem value="salary-high">Highest Salary</SelectItem>
                      <SelectItem value="salary-low">Lowest Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* View Toggle (Grid / List) */}
                <div className="flex items-center bg-[#f5f7fc] rounded-lg p-0.5">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#16a34a]' : 'text-[#5f6368] hover:text-[#202124]'}`}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#16a34a]' : 'text-[#5f6368] hover:text-[#202124]'}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ===== JOB CARDS ===== */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-sm">
                    <CardContent className="p-0">
                      <div className="h-[140px] bg-[#f5f7fc] rounded-t-xl" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-[#f5f7fc] rounded w-3/4" />
                        <div className="h-3 bg-[#f5f7fc] rounded w-1/2" />
                        <div className="h-3 bg-[#f5f7fc] rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-[#ecedf2]" />
                <p className="text-xl font-semibold text-[#202124]">No jobs found</p>
                <p className="text-sm text-[#5f6368] mt-1">Try adjusting your search criteria</p>
                <Button variant="outline" className="mt-4 border-[#16a34a] text-[#16a34a] hover:bg-green-50" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ===== GRID VIEW - JobHub Card Style ===== */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job, i) => (
                  <Card key={job.id}
                    className="hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-0 shadow-sm hover:shadow-xl overflow-hidden"
                    onClick={() => setSelectedJob(job)}>
                    <CardContent className="p-0">
                      {/* Card Top - Company Color Banner (JobHub style) */}
                      <div className={`relative h-[140px] ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center overflow-hidden`}>
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />

                        {/* Company Initial large background */}
                        <span className="text-5xl font-bold text-white/30 select-none">
                          {getCompanyInitial(job.corporate?.companyName)}
                        </span>

                        {/* Urgent label */}
                        {i < 3 && (
                          <label className="absolute top-3 left-3 bg-[#d93025] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm">
                            Urgent
                          </label>
                        )}

                        {/* Remote label */}
                        {job.isRemote && (
                          <label className="absolute top-3 left-3 bg-[#f9ab00] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm" style={i < 3 ? { left: '80px' } : {}}>
                            Remote
                          </label>
                        )}

                        {/* Bookmark button */}
                        <button
                          onClick={(e) => toggleSave(job.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                          <Bookmark className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        {/* Company row with small logo + name + job type badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-9 h-9 rounded-lg ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                              {getCompanyInitial(job.corporate?.companyName)}
                            </div>
                            <span className="text-sm text-[#5f6368] truncate font-medium">{job.corporate?.companyName || 'Company'}</span>
                          </div>
                          <Badge className="bg-[#f5f7fc] text-[#5f6368] border-0 text-[11px] rounded-md px-2.5 py-0.5 font-medium capitalize flex-shrink-0">
                            {job.jobType || 'Full Time'}
                          </Badge>
                        </div>

                        {/* Job Title */}
                        <h5 className="font-semibold text-[#202124] text-[15px] leading-snug group-hover:text-[#16a34a] transition-colors line-clamp-2 mb-2.5">
                          {job.title}
                        </h5>

                        {/* Time + Location row */}
                        <div className="flex items-center gap-3 text-xs text-[#5f6368] mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#16a34a]" />
                            {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#16a34a]" />
                            {job.location || 'Remote'}
                          </span>
                        </div>

                        {/* Bottom: Salary + Shield + Chevron (JobHub style) */}
                        <div className="flex items-center justify-between pt-3.5 border-t border-[#ecedf2]">
                          <span className="font-semibold text-[#16a34a] text-sm">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
                            <ChevronRight className="h-4 w-4 text-[#5f6368] group-hover:text-[#16a34a] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* ===== LIST VIEW ===== */
              <div className="space-y-4">
                {jobs.map((job, i) => (
                  <Card key={job.id}
                    className="hover:shadow-md transition-all cursor-pointer group border-0 shadow-sm overflow-hidden"
                    onClick={() => setSelectedJob(job)}>
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Left color stripe */}
                        <div className={`w-full sm:w-[140px] h-[100px] sm:h-auto ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center relative flex-shrink-0`}>
                          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                          <span className="text-3xl font-bold text-white/30 select-none">
                            {getCompanyInitial(job.corporate?.companyName)}
                          </span>
                          {i < 3 && (
                            <label className="absolute top-2 left-2 bg-[#d93025] text-white text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">
                              Urgent
                            </label>
                          )}
                          {job.isRemote && (
                            <label className="absolute top-2 right-2 bg-[#f9ab00] text-white text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">
                              Remote
                            </label>
                          )}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-4 sm:p-5 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-[#f5f7fc] text-[#5f6368] border-0 text-[10px] rounded-md px-2 py-0 font-medium capitalize">
                                  {job.jobType || 'Full Time'}
                                </Badge>
                                {job.isRemote && (
                                  <Badge className="bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 text-[10px] rounded-md px-2 py-0">
                                    Remote
                                  </Badge>
                                )}
                              </div>
                              <h5 className="font-semibold text-[#202124] text-[15px] group-hover:text-[#16a34a] transition-colors truncate">
                                {job.title}
                              </h5>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5f6368] mt-1.5">
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" /> {job.corporate?.companyName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {job.location || 'Remote'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}
                                </span>
                                {job.experienceMin && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" /> {job.experienceMin}-{job.experienceMax} Yrs
                                  </span>
                                )}
                              </div>
                              {/* Skills */}
                              {job.skills && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                  {job.skills.split(',').slice(0, 4).map((s: string) => (
                                    <Badge key={s.trim()} className="text-[10px] px-2 py-0.5 bg-[rgba(22,163,74,0.1)] text-[#16a34a] border-0 rounded-md font-normal">{s.trim()}</Badge>
                                  ))}
                                  {job.skills.split(',').length > 4 && (
                                    <Badge className="text-[10px] px-2 py-0.5 bg-[#f5f7fc] text-[#5f6368] border-0 rounded-md font-normal">+{job.skills.split(',').length - 4}</Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right side: Salary + actions */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className="font-semibold text-[#16a34a] text-sm whitespace-nowrap">
                                {formatSalary(job.salaryMin, job.salaryMax)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
                                <button onClick={(e) => toggleSave(job.id, e)} className="p-1 rounded-md hover:bg-[#f5f7fc] transition-colors">
                                  <Bookmark className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-[#16a34a] text-[#16a34a]' : 'text-[#ecedf2]'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* ===== PAGINATION (JobHub style) ===== */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#5f6368]">
                  Showing page <strong className="text-[#202124]">{page}</strong> of <strong className="text-[#202124]">{totalPages}</strong>
                </p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}
                    className="border-[#ecedf2] text-[#5f6368] hover:text-[#202124] h-9 w-9 p-0 rounded-lg">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm"
                        className={`w-9 h-9 rounded-lg ${page === pageNum ? 'bg-[#16a34a] hover:bg-[#15803d] text-white' : 'border-[#ecedf2] text-[#5f6368] hover:text-[#202124]'}`}
                        onClick={() => setPage(pageNum)}>
                        {pageNum}
                      </Button>
                    )
                  })}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                    className="border-[#ecedf2] text-[#5f6368] hover:text-[#202124] h-9 w-9 p-0 rounded-lg">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
