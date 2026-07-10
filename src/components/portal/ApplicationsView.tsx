'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileCheck, Building2, MapPin, Clock, TrendingUp, BarChart3 } from 'lucide-react'

const statusColors: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  INTERVIEWED: 'bg-cyan-100 text-cyan-700',
  OFFERED: 'bg-emerald-100 text-emerald-700',
  HIRED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

export function ApplicationsView() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadApplications() }, [user, statusFilter])

  const loadApplications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/applications?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        let apps = data.applications || []
        if (statusFilter !== 'all') apps = apps.filter((a: any) => a.status === statusFilter)
        setApplications(apps)
      }
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="APPLIED">Applied</SelectItem>
            <SelectItem value="SCREENING">Screening</SelectItem>
            <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
            <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
            <SelectItem value="OFFERED">Offered</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-20 bg-gray-200 rounded" /></CardContent></Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm">Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</h3>
                      <p className="text-sm text-gray-500">{app.job?.corporate?.companyName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                        {app.aiMatchScore != null && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="h-3 w-3" /> AI Match: {app.aiMatchScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[app.status] || 'bg-gray-100 text-gray-600'}>
                    {app.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {app.aiFeedback && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                    AI: {app.aiFeedback}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
