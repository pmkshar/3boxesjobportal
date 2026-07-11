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
  Filter, ChevronLeft, Wifi, X, ArrowRight,
} from 'lucide-react'

export function JobSearchView() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => { loadJobs() }, [page, jobType])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search, page: String(page), limit: '12',
        ...(jobType && { jobType }),
        ...(isRemote && { isRemote: 'true' }),
      })
      const res = await fetch(`/api/jobs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
        setTotalPages(data.totalPages || 1)
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
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Search criteria bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search jobs by title, skill, or company..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10"
            onKeyDown={(e) => e.key === 'Enter' && loadJobs()} />
        </div>
        <div className="flex gap-2">
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-[140px] h-10"><SelectValue placeholder="Job Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={isRemote ? 'default' : 'outline'} size="default"
            className={`h-10 ${isRemote ? 'bg-emerald-600' : ''}`} onClick={() => setIsRemote(!isRemote)}>
            <Wifi className="h-4 w-4" />
          </Button>
          <Button onClick={loadJobs} className="bg-emerald-600 hover:bg-emerald-700 h-10">
            <Filter className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>
      </div>

      {/* Jobs content - master-detail layout */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left - Job List */}
        <div className={`${selectedJob ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-gray-200 rounded" /></CardContent></Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No jobs found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className={`hover:shadow-md transition-all cursor-pointer group ${
                    selectedJob?.id === job.id ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500">{job.corporate?.companyName}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || 'Remote'}</span>
                        <span className="font-medium text-emerald-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-all flex-shrink-0 ${selectedJob?.id === job.id ? 'rotate-90' : ''}`} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 ml-13">
                      {job.skills?.split(',').slice(0, 3).map((skill: string) => (
                        <Badge key={skill.trim()} variant="outline" className="text-xs">{skill.trim()}</Badge>
                      ))}
                      {job.isRemote && <Badge variant="secondary" className="text-xs bg-teal-50 text-teal-700">Remote</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Job Detail (inline, no popup) */}
        {selectedJob && (
          <div className="lg:col-span-3">
            <Card className="border-emerald-100 sticky top-4">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div>
                  <button onClick={() => setSelectedJob(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3 lg:hidden">
                    <ArrowRight className="h-3 w-3 rotate-180" /> Back
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {selectedJob.corporate?.companyName}</span>
                    <span className="mx-1">•</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {selectedJob.location || 'Remote'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700">{selectedJob.jobType}</Badge>
                  {selectedJob.isRemote && <Badge className="bg-teal-100 text-teal-700">Remote Friendly</Badge>}
                  <Badge variant="outline">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</Badge>
                  {selectedJob.experienceMin && (
                    <Badge variant="outline">{selectedJob.experienceMin}-{selectedJob.experienceMax} yrs exp</Badge>
                  )}
                </div>

                {selectedJob.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Requirements</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.requirements}</p>
                  </div>
                )}

                {selectedJob.skills && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.split(',').map((s: string) => (
                        <Badge key={s.trim()} variant="secondary" className="bg-emerald-50 text-emerald-700">{s.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.benefits && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Benefits</h4>
                    <p className="text-sm text-gray-600">{selectedJob.benefits}</p>
                  </div>
                )}

                <Separator />

                <div className="flex gap-3">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={applying} onClick={() => handleApply(selectedJob.id)}>
                    {applying ? 'Applying...' : 'Apply Now'}
                  </Button>
                  <Button variant="outline">Save Job</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
