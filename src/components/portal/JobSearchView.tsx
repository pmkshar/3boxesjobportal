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
} from 'lucide-react'

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

  const getCompanyInitial = (name?: string) => {
    if (!name) return 'C'
    return name.charAt(0).toUpperCase()
  }

  // Naukri-style company colors
  const companyColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500',
    'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500', 'bg-amber-500',
  ]

  const getCompanyColor = (name?: string) => {
    if (!name) return companyColors[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return companyColors[Math.abs(hash) % companyColors.length]
  }

  // If a job is selected, show inline detail view (Naukri style)
  if (selectedJob) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => setSelectedJob(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to search results
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Main Job Detail */}
          <div className="lg:col-span-2 space-y-5">
            {/* Job Header Card */}
            <Card className="border-emerald-100">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${getCompanyColor(selectedJob.corporate?.companyName)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {getCompanyInitial(selectedJob.corporate?.companyName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedJob.title}</h1>
                    <p className="text-base text-gray-600 mt-0.5">{selectedJob.corporate?.companyName}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {selectedJob.location || 'Remote'}</span>
                      {selectedJob.experienceMin && (
                        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {selectedJob.experienceMin}-{selectedJob.experienceMax} Yrs</span>
                      )}
                      <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                      {selectedJob.postedDate && (
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeAgo(selectedJob.postedDate)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">{selectedJob.jobType}</Badge>
                  {selectedJob.isRemote && <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200">Remote Friendly</Badge>}
                  {selectedJob.openings && <Badge variant="outline" className="text-gray-600"><Users className="h-3 w-3 mr-1" />{selectedJob.openings} Openings</Badge>}
                </div>

                <div className="flex gap-3 mt-5">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-11 font-semibold"
                    disabled={applying} onClick={() => handleApply(selectedJob.id)}>
                    {applying ? 'Applying...' : 'Apply Now'}
                  </Button>
                  <Button variant="outline" className="h-11 px-4"
                    onClick={(e) => toggleSave(selectedJob.id, e)}>
                    <Bookmark className={`h-4 w-4 mr-1.5 ${savedJobs.has(selectedJob.id) ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                    {savedJobs.has(selectedJob.id) ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            {selectedJob.description && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-3">Job Description</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed space-y-2">
                    {selectedJob.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Skills */}
            {selectedJob.skills && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-3">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.split(',').map((s: string) => (
                      <Badge key={s.trim()} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1 text-sm">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {selectedJob.requirements && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-3">Requirements</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {selectedJob.requirements}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {selectedJob.responsibilities && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-3">Responsibilities</h3>
                  <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {selectedJob.responsibilities}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Quick Info Card */}
            <Card className="border-emerald-100">
              <CardContent className="p-5 space-y-4">
                <h4 className="font-semibold text-gray-900">Job Highlights</h4>
                {[
                  { icon: IndianRupee, label: 'Salary', value: formatSalary(selectedJob.salaryMin, selectedJob.salaryMax) },
                  { icon: Briefcase, label: 'Experience', value: selectedJob.experienceMin ? `${selectedJob.experienceMin}-${selectedJob.experienceMax} Years` : 'Not specified' },
                  { icon: MapPin, label: 'Location', value: selectedJob.location || 'Remote' },
                  { icon: Building2, label: 'Job Type', value: selectedJob.jobType || 'Full Time' },
                  { icon: Users, label: 'Openings', value: selectedJob.openings || '1' },
                  { icon: CalendarDays, label: 'Posted', value: selectedJob.postedDate ? timeAgo(selectedJob.postedDate) : 'Recently' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <item.icon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-500 min-w-[80px]">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Benefits */}
            {selectedJob.benefits && (
              <Card className="border-emerald-100">
                <CardContent className="p-5">
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits & Perks</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedJob.benefits}</p>
                </CardContent>
              </Card>
            )}

            {/* About Company */}
            <Card className="border-emerald-100">
              <CardContent className="p-5">
                <h4 className="font-semibold text-gray-900 mb-3">About the Company</h4>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${getCompanyColor(selectedJob.corporate?.companyName)} flex items-center justify-center text-white font-bold text-sm`}>
                    {getCompanyInitial(selectedJob.corporate?.companyName)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedJob.corporate?.companyName}</p>
                    <p className="text-xs text-gray-500">{selectedJob.location || 'India'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A leading organization in the {selectedJob.jobType === 'IT' ? 'technology' : 'industry'} sector,
                  offering great career growth opportunities and a dynamic work environment.
                </p>
              </CardContent>
            </Card>

            {/* Apply Again */}
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 font-semibold text-base"
              disabled={applying} onClick={() => handleApply(selectedJob.id)}>
              {applying ? 'Applying...' : 'Apply Now'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main search view with Naukri-style tiles
  return (
    <div className="space-y-4">
      {/* Search Bar - Naukri style with skill/location/experience */}
      <Card className="border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Skills, Designations, Companies" value={search}
                onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 bg-white border-gray-200"
                onKeyDown={(e) => e.key === 'Enter' && loadJobs()} />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Location" value={location}
                onChange={(e) => setLocation(e.target.value)} className="pl-9 h-11 bg-white border-gray-200"
                onKeyDown={(e) => e.key === 'Enter' && loadJobs()} />
            </div>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="w-full sm:w-[150px] h-11 bg-white border-gray-200">
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
            <Button onClick={loadJobs} className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 font-semibold">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-gray-200">
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
              className={`h-8 text-xs ${isRemote ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-200'}`}
              onClick={() => setIsRemote(!isRemote)}>
              <Wifi className="h-3 w-3 mr-1" /> Remote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Searching...' : <><span className="font-semibold text-gray-900">{totalJobs}</span> jobs found</>}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter className="h-3 w-3" /> Sort by: <span className="font-medium text-gray-700">Relevance</span>
        </div>
      </div>

      {/* Job Tiles Grid - Naukri style */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
                </div>
                <div className="space-y-2"><div className="h-3 bg-gray-200 rounded" /><div className="h-3 bg-gray-200 rounded w-5/6" /></div>
                <div className="flex gap-1.5 mt-3">{Array.from({length:3}).map((_,j)=><div key={j} className="h-5 w-14 bg-gray-200 rounded" />)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <p className="text-xl font-semibold text-gray-700">No jobs found</p>
          <p className="text-sm mt-1">Try adjusting your search criteria or filters</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setLocation(''); setJobType(''); setExperience(''); setIsRemote(false); loadJobs() }}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <Card
              key={job.id}
              className="hover:shadow-lg transition-all cursor-pointer group border-gray-100 hover:border-emerald-200"
              onClick={() => setSelectedJob(job)}
            >
              <CardContent className="p-4 sm:p-5">
                {/* Company Logo + Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {getCompanyInitial(job.corporate?.companyName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{job.corporate?.companyName}</p>
                  </div>
                  <button
                    onClick={(e) => toggleSave(job.id, e)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Bookmark className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-emerald-600 text-emerald-600' : 'text-gray-300 hover:text-gray-500'}`} />
                  </button>
                </div>

                {/* Key Details - Naukri style info rows */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{job.location || 'Remote'}</span>
                    {job.isRemote && <Badge className="text-[10px] px-1.5 py-0 bg-teal-50 text-teal-700 border-teal-100">WFH</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <IndianRupee className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-emerald-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                  {job.experienceMin && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span>{job.experienceMin}-{job.experienceMax} Yrs</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.skills?.split(',').slice(0, 3).map((s: string) => (
                    <Badge key={s.trim()} variant="secondary" className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-100">
                      {s.trim()}
                    </Badge>
                  ))}
                  {job.skills?.split(',').length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500">
                      +{job.skills.split(',').length - 3}
                    </Badge>
                  )}
                </div>

                {/* Bottom: Job Type + Apply CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
                    {job.jobType || 'Full Time'}
                  </Badge>
                  <span className="text-xs font-medium text-emerald-600 group-hover:text-emerald-700 flex items-center gap-0.5">
                    View Details <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Button key={pageNum} variant={page === pageNum ? 'default' : 'outline'} size="sm"
                  className={`w-9 h-9 ${page === pageNum ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  onClick={() => setPage(pageNum)}>
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
