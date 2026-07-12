'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTheme } from '@/lib/theme'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  FileCheck, Building2, Clock, Calendar, ChevronRight, ChevronLeft,
  Plus, Download, Filter, BarChart3, TrendingUp, Target,
  Phone, MessageSquare, Award, XCircle, CheckCircle2, ArrowRight,
  Briefcase, MapPin, DollarSign, ExternalLink, FileSpreadsheet,
  Kanban, List, LayoutGrid,
} from 'lucide-react'

// Application statuses in Kanban order
const kanbanColumns = [
  { id: 'saved', label: 'Saved', icon: Bookmark, color: '#6B7280' },
  { id: 'applied', label: 'Applied', icon: FileCheck, color: '#3B82F6' },
  { id: 'phone_screen', label: 'Phone Screen', icon: Phone, color: '#8B5CF6' },
  { id: 'interview', label: 'Interview', icon: MessageSquare, color: '#F59E0B' },
  { id: 'offer', label: 'Offer', icon: Award, color: '#10B981' },
  { id: 'rejected', label: 'Rejected', icon: XCircle, color: '#EF4444' },
] as const

type AppStatus = typeof kanbanColumns[number]['id']

interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  salary: string
  appliedDate: string
  status: AppStatus
  nextAction: string
  notes: string
  url: string
  contactPerson: string
}

// Demo applications
const initialApplications: Application[] = [
  {
    id: '1', jobTitle: 'Senior Frontend Engineer', company: 'Google', location: 'Mountain View, CA',
    salary: '$180K - $250K', appliedDate: '2025-02-15', status: 'interview',
    nextAction: 'Technical round on Mar 5', notes: 'Prep for system design', url: '', contactPerson: 'Sarah Chen',
  },
  {
    id: '2', jobTitle: 'Full-Stack Developer', company: 'Stripe', location: 'Remote',
    salary: '$160K - $200K', appliedDate: '2025-02-20', status: 'phone_screen',
    nextAction: 'HR call scheduled for Feb 28', notes: '', url: '', contactPerson: '',
  },
  {
    id: '3', jobTitle: 'React Developer', company: 'Meta', location: 'Menlo Park, CA',
    salary: '$170K - $230K', appliedDate: '2025-01-10', status: 'rejected',
    nextAction: 'Follow up for feedback', notes: 'Interview went well, uncertain about rejection reason', url: '', contactPerson: 'John Smith',
  },
  {
    id: '4', jobTitle: 'Frontend Lead', company: 'Airbnb', location: 'San Francisco, CA',
    salary: '$190K - $260K', appliedDate: '2025-02-25', status: 'applied',
    nextAction: 'Awaiting screening', notes: 'Referral from Jake', url: '', contactPerson: 'Jake P.',
  },
  {
    id: '5', jobTitle: 'Principal Engineer', company: 'Netflix', location: 'Los Gatos, CA',
    salary: '$220K - $320K', appliedDate: '2025-02-18', status: 'offer',
    nextAction: 'Review offer details by Mar 1', notes: 'Great compensation package, good team', url: '', contactPerson: 'Lisa Wang',
  },
  {
    id: '6', jobTitle: 'Software Engineer III', company: 'Amazon', location: 'Seattle, WA',
    salary: '$160K - $220K', appliedDate: '2025-02-28', status: 'saved',
    nextAction: 'Prepare and apply', notes: 'Interesting team, leadership principles prep needed', url: '', contactPerson: '',
  },
  {
    id: '7', jobTitle: 'Staff Engineer', company: 'Shopify', location: 'Remote',
    salary: '$175K - $240K', appliedDate: '2025-02-22', status: 'applied',
    nextAction: 'Follow up after 1 week', notes: 'Remote-first culture', url: '', contactPerson: '',
  },
  {
    id: '8', jobTitle: 'Tech Lead', company: 'Spotify', location: 'Stockholm, SE',
    salary: '€80K - €110K', appliedDate: '2025-02-12', status: 'phone_screen',
    nextAction: 'Technical phone screen on Mar 3', notes: 'Relocation needed', url: '', contactPerson: 'Anna K.',
  },
  {
    id: '9', jobTitle: 'Senior DevOps Engineer', company: 'Datadog', location: 'New York, NY',
    salary: '$170K - $230K', appliedDate: '2025-02-10', status: 'interview',
    nextAction: 'On-site interview Mar 7', notes: 'Strong infrastructure team', url: '', contactPerson: 'Mike R.',
  },
  {
    id: '10', jobTitle: 'Platform Engineer', company: 'Vercel', location: 'Remote',
    salary: '$150K - $210K', appliedDate: '2025-02-26', status: 'saved',
    nextAction: 'Tailor resume and apply', notes: 'Great product, fan of Next.js', url: '', contactPerson: '',
  },
]

function Bookmark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
  )
}

function statusBadgeClass(status: AppStatus): string {
  switch (status) {
    case 'saved': return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'applied': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'phone_screen': return 'bg-violet-100 text-violet-700 border-violet-200'
    case 'interview': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'offer': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
  }
}

function statusLabel(status: AppStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function ApplicationTracker() {
  const { theme } = useTheme()
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline'>('kanban')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newApp, setNewApp] = useState<Partial<Application>>({
    status: 'saved',
    jobTitle: '',
    company: '',
    location: '',
    salary: '',
    nextAction: '',
    notes: '',
  })

  // Filtered applications
  const filteredApps = useMemo(() => {
    let apps = applications
    if (filterStatus !== 'all') apps = apps.filter(a => a.status === filterStatus)
    if (filterCompany !== 'all') apps = apps.filter(a => a.company === filterCompany)
    return apps
  }, [applications, filterStatus, filterCompany])

  // Unique companies for filter
  const companies = useMemo(() => [...new Set(applications.map(a => a.company))].sort(), [applications])

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length
    const applied = applications.filter(a => a.status !== 'saved').length
    const responded = applications.filter(a => ['phone_screen', 'interview', 'offer', 'rejected'].includes(a.status)).length
    const interviews = applications.filter(a => a.status === 'interview').length
    const offers = applications.filter(a => a.status === 'offer').length
    const rejected = applications.filter(a => a.status === 'rejected').length
    return {
      total,
      applied,
      responded,
      interviews,
      offers,
      rejected,
      responseRate: applied > 0 ? Math.round((responded / applied) * 100) : 0,
      interviewRate: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
      offerRate: applied > 0 ? Math.round((offers / applied) * 100) : 0,
    }
  }, [applications])

  // Move application to next/previous status
  const moveApp = useCallback((appId: string, direction: 'next' | 'prev') => {
    const columnIds = kanbanColumns.map(c => c.id)
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app
      const currentIndex = columnIds.indexOf(app.status)
      if (direction === 'next' && currentIndex < columnIds.length - 1) {
        const newStatus = columnIds[currentIndex + 1]
        toast.success(`Moved "${app.jobTitle}" to ${statusLabel(newStatus)}`)
        return { ...app, status: newStatus }
      }
      if (direction === 'prev' && currentIndex > 0) {
        const newStatus = columnIds[currentIndex - 1]
        toast.info(`Moved "${app.jobTitle}" back to ${statusLabel(newStatus)}`)
        return { ...app, status: newStatus }
      }
      return app
    }))
  }, [])

  // Move to specific status
  const moveToStatus = useCallback((appId: string, status: AppStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app
      return { ...app, status }
    }))
    toast.success(`Moved to ${statusLabel(status)}`)
  }, [])

  // Add new application
  const addApplication = useCallback(() => {
    if (!newApp.jobTitle || !newApp.company) {
      toast.error('Job title and company are required')
      return
    }
    const app: Application = {
      id: Date.now().toString(),
      jobTitle: newApp.jobTitle!,
      company: newApp.company!,
      location: newApp.location || '',
      salary: newApp.salary || '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: (newApp.status as AppStatus) || 'saved',
      nextAction: newApp.nextAction || '',
      notes: newApp.notes || '',
      url: newApp.url || '',
      contactPerson: newApp.contactPerson || '',
    }
    setApplications(prev => [app, ...prev])
    setAddDialogOpen(false)
    setNewApp({ status: 'saved', jobTitle: '', company: '', location: '', salary: '', nextAction: '', notes: '' })
    toast.success(`Added "${app.jobTitle}" at ${app.company}`)
  }, [newApp])

  // Export to CSV
  const exportCSV = useCallback(() => {
    const headers = ['Job Title', 'Company', 'Location', 'Salary', 'Status', 'Applied Date', 'Next Action', 'Contact', 'Notes']
    const rows = applications.map(app => [
      app.jobTitle, app.company, app.location, app.salary,
      statusLabel(app.status), app.appliedDate, app.nextAction,
      app.contactPerson, app.notes,
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Applications exported to CSV')
  }, [applications])

  // Delete application
  const deleteApp = useCallback((appId: string) => {
    setApplications(prev => prev.filter(a => a.id !== appId))
    toast.info('Application removed')
  }, [])

  // Render an application card
  const renderAppCard = (app: Application, compact = false) => {
    const columnIndex = kanbanColumns.findIndex(c => c.id === app.status)
    const canMovePrev = columnIndex > 0
    const canMoveNext = columnIndex < kanbanColumns.length - 1

    return (
      <div
        key={app.id}
        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{app.jobTitle}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" /> {app.company}
            </p>
          </div>
          <Badge className={`text-[9px] border ml-1 flex-shrink-0 ${statusBadgeClass(app.status)}`}>
            {statusLabel(app.status)}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400 mb-2">
          {app.location && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{app.location}</span>}
          {app.salary && <span className="flex items-center gap-0.5"><DollarSign className="h-2.5 w-2.5" />{app.salary}</span>}
          <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{app.appliedDate}</span>
        </div>

        {app.nextAction && (
          <div className="text-[10px] bg-amber-50 text-amber-700 rounded px-2 py-1 mb-2 border border-amber-100 flex items-center gap-1">
            <Target className="h-2.5 w-2.5 flex-shrink-0" />
            {app.nextAction}
          </div>
        )}

        {!compact && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {canMovePrev && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2"
                onClick={() => moveApp(app.id, 'prev')}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            )}
            {canMoveNext && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2"
                style={{ borderColor: theme.primaryMedium, color: theme.primary }}
                onClick={() => moveApp(app.id, 'next')}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
            <div className="flex-1" />
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] px-2 text-red-400 hover:text-red-600"
              onClick={() => deleteApp(app.id)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Kanban className="h-5 w-5" style={{ color: theme.primary }} />
            Application Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage all your job applications in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={exportCSV}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="text-white text-xs"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Job Title *</Label>
                  <Input
                    placeholder="e.g., Senior Frontend Engineer"
                    value={newApp.jobTitle || ''}
                    onChange={(e) => setNewApp({ ...newApp, jobTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Company *</Label>
                  <Input
                    placeholder="e.g., Google"
                    value={newApp.company || ''}
                    onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Location</Label>
                    <Input
                      placeholder="Remote"
                      value={newApp.location || ''}
                      onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Salary Range</Label>
                    <Input
                      placeholder="$150K - $200K"
                      value={newApp.salary || ''}
                      onChange={(e) => setNewApp({ ...newApp, salary: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={newApp.status || 'saved'} onValueChange={(v) => setNewApp({ ...newApp, status: v as AppStatus })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {kanbanColumns.map(col => (
                        <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Next Action</Label>
                  <Input
                    placeholder="e.g., Prepare for technical interview"
                    value={newApp.nextAction || ''}
                    onChange={(e) => setNewApp({ ...newApp, nextAction: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Input
                    placeholder="Any additional notes..."
                    value={newApp.notes || ''}
                    onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHover }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.primary }}
                  onClick={addApplication}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Tracked', value: stats.total, icon: Briefcase, color: theme.primary },
          { label: 'Applied', value: stats.applied, icon: FileCheck, color: '#3B82F6' },
          { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: '#8B5CF6' },
          { label: 'Interview Rate', value: `${stats.interviewRate}%`, icon: MessageSquare, color: '#F59E0B' },
          { label: 'Offers', value: stats.offers, icon: Award, color: '#10B981' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#EF4444' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.color + '15' }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + View Switch */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {kanbanColumns.map(col => (
                <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <Button
            size="sm"
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            className="h-7 text-xs px-3"
            style={viewMode === 'kanban' ? { backgroundColor: theme.primary } : {}}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-3 w-3 mr-1" /> Kanban
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            className="h-7 text-xs px-3"
            style={viewMode === 'timeline' ? { backgroundColor: theme.primary } : {}}
            onClick={() => setViewMode('timeline')}
          >
            <List className="h-3 w-3 mr-1" /> Timeline
          </Button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {kanbanColumns.map(column => {
              const columnApps = filteredApps.filter(a => a.status === column.id)
              return (
                <div key={column.id} className="w-[280px] flex-shrink-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="text-sm font-semibold text-gray-700">{column.label}</h3>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">{columnApps.length}</Badge>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[120px] bg-gray-50/50 rounded-lg p-2 border border-dashed border-gray-200">
                    {columnApps.length === 0 ? (
                      <div className="flex items-center justify-center h-20 text-xs text-gray-400">
                        No applications
                      </div>
                    ) : (
                      columnApps.map(app => renderAppCard(app))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <Card>
          <CardContent className="p-4">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileCheck className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-4">
                  {[...filteredApps]
                    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
                    .map(app => {
                      const column = kanbanColumns.find(c => c.id === app.status)!
                      return (
                        <div key={app.id} className="relative flex gap-4 pl-1">
                          {/* Timeline dot */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm"
                            style={{ backgroundColor: column.color + '20' }}
                          >
                            <column.icon className="h-4 w-4" style={{ color: column.color }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{app.jobTitle}</h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Building2 className="h-3 w-3" /> {app.company}
                                  {app.location && <> · <MapPin className="h-3 w-3" /> {app.location}</>}
                                </p>
                              </div>
                              <Badge className={`text-[10px] border ${statusBadgeClass(app.status)}`}>
                                {statusLabel(app.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Applied {app.appliedDate}
                              </span>
                              {app.salary && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" /> {app.salary}
                                </span>
                              )}
                            </div>
                            {app.nextAction && (
                              <div className="mt-2 text-xs bg-amber-50 text-amber-700 rounded px-2 py-1 border border-amber-100 flex items-center gap-1">
                                <Target className="h-3 w-3 flex-shrink-0" /> {app.nextAction}
                              </div>
                            )}
                            {app.notes && (
                              <p className="text-xs text-gray-400 mt-1 italic">{app.notes}</p>
                            )}
                            <div className="flex items-center gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                onClick={() => moveApp(app.id, 'prev')}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                style={{ borderColor: theme.primaryMedium, color: theme.primary }}
                                onClick={() => moveApp(app.id, 'next')}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                              <div className="flex-1" />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[10px] px-2 text-red-400 hover:text-red-600"
                                onClick={() => deleteApp(app.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Funnel Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" style={{ color: theme.primary }} />
            Application Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {kanbanColumns.map(column => {
              const count = applications.filter(a => a.status === column.id).length
              const maxCount = Math.max(...kanbanColumns.map(c => applications.filter(a => a.status === c.id).length), 1)
              const heightPct = (count / maxCount) * 100
              return (
                <div key={column.id} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-700 mb-1">{count}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(4, heightPct)}%`,
                      backgroundColor: column.color,
                      opacity: 0.8,
                    }}
                  />
                  <span className="text-[9px] text-gray-500 mt-2 text-center leading-tight">{column.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
