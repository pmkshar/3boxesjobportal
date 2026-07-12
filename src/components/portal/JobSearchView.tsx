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
  LayoutGrid, List, MapPinned,
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

export function JobSearchView() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [experience, setExperience] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applying, setApplying] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => { loadJobs() }, [page, jobType])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search, page: String(page), limit: '12',
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

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed'
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`
    if (min && max) return `₹${fmt(min)} - ₹${fmt(max)} PA`
    return min ? `₹${fmt(min)}+ PA` : `Up to ₹${fmt(max!)} PA`
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

  const getCompanyInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : 'C'

  const companyColors = [
    'bg-[#16a34a]', 'bg-[#34a853]', 'bg-[#f9ab00]', 'bg-[#d93025]',
    'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
  ]

  const getCompanyColor = (name?: string) => {
    if (!name) return companyColors[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return companyColors[Math.abs(hash) % companyColors.length]
  }

  // Related jobs (filtered from current list)
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
            {/* Left - Main Content (col-lg-8 equivalent) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              {selectedJob.description && (
                <Card className="border-[#ecedf2]">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-[#202124] text-lg mb-4">Job Description</h3>
                    <div className="text-[#5f6368] text-[15px] leading-[26px] whitespace-pre-line">{selectedJob.description}</div>
                  </CardContent>
                </Card>
              )}

              {/* Key Responsibilities */}
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

              {/* Skills & Experience */}
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

              {/* Share This Job */}
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

            {/* Right Sidebar (col-lg-4 equivalent) */}
            <div className="space-y-6">
              {/* Widget: Job Overview */}
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

              {/* Widget: Job Skills */}
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

              {/* Widget: Company Info */}
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

              {/* Apply CTA Card */}
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

  // ========== MAIN SEARCH VIEW ==========
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="border-[#ecedf2] bg-[#f5f7fc]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input placeholder="Job title, keyword, or company" value={search}
                onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 bg-white border-[#ecedf2] focus:border-[#16a34a]"
                onKeyDown={(e) => e.key === 'Enter' && loadJobs()} />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f6368]" />
              <Input placeholder="City or location" value={location}
                onChange={(e) => setLocation(e.target.value)} className="pl-9 h-11 bg-white border-[#ecedf2] focus:border-[#16a34a]"
                onKeyDown={(e) => e.key === 'Enter' && loadJobs()} />
            </div>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="w-full sm:w-[150px] h-11 bg-white border-[#ecedf2]">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Fresher</SelectItem>
                <SelectItem value="1">1 Year</SelectItem>
                <SelectItem value="2">2 Years</SelectItem>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="7">7 Years</SelectItem>
                <SelectItem value="10">10+ Years</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadJobs} className="bg-[#16a34a] hover:bg-[#15803d] h-11 px-6 font-semibold shadow-sm">
              <Search className="h-4 w-4 mr-2" /> Find Jobs
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-[#ecedf2]">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={isRemote ? 'default' : 'outline'} size="sm"
              className={`h-8 text-xs ${isRemote ? 'bg-[#16a34a] hover:bg-[#15803d] text-white' : 'border-[#ecedf2] text-[#5f6368]'}`}
              onClick={() => setIsRemote(!isRemote)}>
              <Wifi className="h-3 w-3 mr-1" /> Remote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#5f6368]">
          {loading ? 'Searching...' : <>Showing <span className="font-semibold text-[#202124]">{jobs.length}</span> of <span className="font-semibold text-[#202124]">{totalJobs}</span> jobs</>}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#f5f7fc] rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#16a34a]' : 'text-[#5f6368] hover:text-[#202124]'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#16a34a]' : 'text-[#5f6368] hover:text-[#202124]'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5f6368]">
            <Filter className="h-3 w-3" /> Sort by: <span className="font-medium text-[#202124]">Relevance</span>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-[#ecedf2]"><CardContent className="p-5"><div className="h-24 bg-[#f5f7fc] rounded" /></CardContent></Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="h-16 w-16 mx-auto mb-4 text-[#ecedf2]" />
          <p className="text-xl font-semibold text-[#202124]">No jobs found</p>
          <p className="text-sm text-[#5f6368] mt-1">Try adjusting your search criteria</p>
          <Button variant="outline" className="mt-4 border-[#16a34a] text-[#16a34a]" onClick={() => { setSearch(''); setLocation(''); setJobType(''); setExperience(''); setIsRemote(false); loadJobs() }}>
            Clear all filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View - Card Tiles */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <Card key={job.id} className="hover:shadow-lg transition-all cursor-pointer group border-[#ecedf2] hover:border-[#16a34a]/30"
              onClick={() => setSelectedJob(job)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                    {getCompanyInitial(job.corporate?.companyName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#202124] text-sm leading-tight group-hover:text-[#16a34a] transition-colors line-clamp-2">{job.title}</h3>
                    <p className="text-xs text-[#5f6368] mt-0.5 truncate">{job.corporate?.companyName}</p>
                  </div>
                  <button onClick={(e) => toggleSave(job.id, e)} className="p-1.5 rounded-lg hover:bg-[#f5f7fc] transition-colors flex-shrink-0">
                    <Bookmark className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-[#16a34a] text-[#16a34a]' : 'text-[#ecedf2] hover:text-[#5f6368]'}`} />
                  </button>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                    <MapPin className="h-3 w-3 flex-shrink-0" /><span className="truncate">{job.location || 'Remote'}</span>
                    {job.isRemote && <Badge className="text-[10px] px-1.5 py-0 bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 rounded-full">WFH</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                    <IndianRupee className="h-3 w-3 flex-shrink-0" /><span className="font-medium text-[#16a34a]">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                  {job.experienceMin && (
                    <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                      <Briefcase className="h-3 w-3 flex-shrink-0" /><span>{job.experienceMin}-{job.experienceMax} Yrs</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                    <Clock className="h-3 w-3 flex-shrink-0" /><span>{job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.skills?.split(',').slice(0, 3).map((s: string) => (
                    <Badge key={s.trim()} className="text-[10px] px-2 py-0.5 bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 rounded-full">{s.trim()}</Badge>
                  ))}
                  {job.skills?.split(',').length > 3 && (
                    <Badge className="text-[10px] px-2 py-0.5 bg-[#f5f7fc] text-[#5f6368] border-0 rounded-full">+{job.skills.split(',').length - 3}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#ecedf2]">
                  <Badge className="bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 rounded-full text-[11px] px-3">{job.jobType || 'Full Time'}</Badge>
                  <span className="text-xs font-medium text-[#16a34a] flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                    View Details <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <Card key={job.id} className="hover:shadow-md transition-all cursor-pointer group border-[#ecedf2] hover:border-[#16a34a]/30"
              onClick={() => setSelectedJob(job)}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm`}>
                    {getCompanyInitial(job.corporate?.companyName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#202124] text-sm sm:text-base group-hover:text-[#16a34a] transition-colors truncate">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5f6368] mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.corporate?.companyName}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> <span className="font-medium text-[#16a34a]">{formatSalary(job.salaryMin, job.salaryMax)}</span></span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills?.split(',').slice(0, 4).map((s: string) => (
                        <Badge key={s.trim()} className="text-[10px] px-2 py-0.5 bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 rounded-full">{s.trim()}</Badge>
                      ))}
                      {job.skills?.split(',').length > 4 && <Badge className="text-[10px] px-2 py-0.5 bg-[#f5f7fc] text-[#5f6368] border-0 rounded-full">+{job.skills.split(',').length - 4}</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex gap-1.5">
                      <Badge className="bg-[rgba(22,163,74,0.15)] text-[#16a34a] border-0 rounded-full text-[11px] px-3">{job.jobType || 'Full Time'}</Badge>
                      {job.isRemote && <Badge className="bg-[rgba(52,168,83,0.15)] text-[#34a853] border-0 rounded-full text-[11px] px-3">Remote</Badge>}
                    </div>
                    <button onClick={(e) => toggleSave(job.id, e)} className="p-1.5 rounded-full hover:bg-[#f5f7fc] transition-colors">
                      <Bookmark className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-[#16a34a] text-[#16a34a]' : 'text-[#ecedf2]'}`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#ecedf2]">
          <p className="text-sm text-[#5f6368]">Showing page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-[#ecedf2] text-[#5f6368]">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm"
                  className={`w-9 h-9 ${page === pageNum ? 'bg-[#16a34a] hover:bg-[#15803d]' : 'border-[#ecedf2] text-[#5f6368]'}`}
                  onClick={() => setPage(pageNum)}>
                  {pageNum}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-[#ecedf2] text-[#5f6368]">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
