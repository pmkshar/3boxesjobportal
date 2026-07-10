'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Search, MapPin, Briefcase, Building2, Clock, DollarSign, Star,
  Filter, ChevronLeft, ChevronRight, CheckCircle2, Wifi, X,
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
        search, page: String(page), limit: '9',
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search jobs by title, skill, or company..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && loadJobs()} />
        </div>
        <div className="flex gap-2">
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Job Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={isRemote ? 'default' : 'outline'} size="icon"
            className={isRemote ? 'bg-emerald-600' : ''} onClick={() => setIsRemote(!isRemote)}>
            <Wifi className="h-4 w-4" />
          </Button>
          <Button onClick={loadJobs} className="bg-emerald-600 hover:bg-emerald-700">
            <Filter className="h-4 w-4 mr-1" /> Search
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-32 bg-gray-200 rounded" /></CardContent></Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedJob(job)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500">{job.corporate?.companyName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.jobType}</span>
                  {job.isRemote && <Badge variant="secondary" className="text-xs h-5">Remote</Badge>}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {job.skills?.split(',').slice(0, 4).map((skill: string) => (
                    <Badge key={skill.trim()} variant="outline" className="text-xs">{skill.trim()}</Badge>
                  ))}
                  {job.skills?.split(',').length > 4 && (
                    <Badge variant="outline" className="text-xs">+{job.skills.split(',').length - 4}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-600">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Building2 className="h-4 w-4" /> {selectedJob.corporate?.companyName}
                  <span className="mx-1">•</span>
                  <MapPin className="h-4 w-4" /> {selectedJob.location || 'Remote'}
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700">{selectedJob.jobType}</Badge>
                  {selectedJob.isRemote && <Badge className="bg-teal-100 text-teal-700">Remote Friendly</Badge>}
                  <Badge variant="outline">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</Badge>
                  {selectedJob.experienceMin && (
                    <Badge variant="outline">{selectedJob.experienceMin}-{selectedJob.experienceMax} yrs exp</Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                </div>

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
                        <Badge key={s.trim()} variant="secondary">{s.trim()}</Badge>
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
