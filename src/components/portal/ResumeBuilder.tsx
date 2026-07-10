'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  FileText, Plus, Trash2, Sparkles, Download, Eye, Edit3,
  Briefcase, GraduationCap, Award, Code, Globe, Star,
  ChevronDown, ChevronUp, Save, CheckCircle2, Clock,
} from 'lucide-react'

interface ResumeData {
  id?: string
  title: string
  summary: string
  experience: any[]
  education: any[]
  skills: any[]
  certifications: any[]
  projects: any[]
  languages: any[]
  achievements: string[]
  template: string
  isDefault: boolean
  lastAiUpdate?: string
}

const emptyResume: ResumeData = {
  title: 'My Resume',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  achievements: [],
  template: 'professional',
  isDefault: true,
}

export function ResumeBuilder() {
  const { user } = useAuthStore()
  const [resumes, setResumes] = useState<any[]>([])
  const [activeResume, setActiveResume] = useState<ResumeData>(emptyResume)
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showPreview, setShowPreview] = useState(true)
  const [aiUpdating, setAiUpdating] = useState(false)

  useEffect(() => { loadResumes() }, [user])

  const loadResumes = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/resumes?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        const rList = data.resumes || []
        setResumes(rList)
        if (rList.length > 0) {
          const defaultResume = rList.find((r: any) => r.isDefault) || rList[0]
          setActiveResumeId(defaultResume.id)
          setActiveResume(parseResume(defaultResume))
        }
      }
    } catch {} finally { setLoading(false) }
  }

  const parseResume = (r: any): ResumeData => ({
    id: r.id,
    title: r.title,
    summary: r.summary || '',
    experience: r.experience ? JSON.parse(r.experience) : [],
    education: r.education ? JSON.parse(r.education) : [],
    skills: r.skills ? JSON.parse(r.skills) : [],
    certifications: r.certifications ? JSON.parse(r.certifications) : [],
    projects: r.projects ? JSON.parse(r.projects) : [],
    languages: r.languages ? JSON.parse(r.languages) : [],
    achievements: r.achievements ? JSON.parse(r.achievements) : [],
    template: r.template || 'professional',
    isDefault: r.isDefault,
    lastAiUpdate: r.lastAiUpdate,
  })

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const body = { ...activeResume, userId: user.id, id: activeResumeId }
      if (activeResumeId) {
        const res = await fetch('/api/resumes', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (res.ok) toast.success('Resume saved successfully')
        else toast.error('Failed to save resume')
      } else {
        const res = await fetch('/api/resumes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        const data = await res.json()
        if (res.ok) {
          setActiveResumeId(data.resume.id)
          toast.success('Resume created successfully')
          loadResumes()
        }
        else toast.error('Failed to create resume')
      }
    } catch { toast.error('Network error') }
    finally { setSaving(false) }
  }

  const handleAiEnhance = (field: string) => {
    setAiUpdating(true)
    setTimeout(() => {
      const enhancements: Record<string, string> = {
        summary: `Results-driven professional with ${activeResume.experience?.length || 0}+ years of progressive experience delivering high-impact solutions. Proven track record of driving innovation, optimizing processes, and exceeding organizational goals. Combines strong technical acumen with exceptional collaboration skills to build scalable solutions that create measurable business value.`,
      }
      if (field === 'summary' && activeResume.summary) {
        setActiveResume({ ...activeResume, summary: enhancements.summary || activeResume.summary, lastAiUpdate: new Date().toISOString() })
      } else if (field === 'summary') {
        setActiveResume({ ...activeResume, summary: enhancements.summary, lastAiUpdate: new Date().toISOString() })
      }
      toast.success('AI enhanced your content!')
      setAiUpdating(false)
    }, 1500)
  }

  const addEntry = (field: keyof ResumeData) => {
    const templates: Record<string, any> = {
      experience: { company: '', role: '', duration: '', description: '' },
      education: { institution: '', degree: '', year: '', grade: '' },
      skills: { name: '', level: 'Intermediate', source: 'Self' },
      certifications: { name: '', year: '', issuer: '' },
      projects: { name: '', description: '', link: '' },
      languages: { name: '', proficiency: 'Professional' },
    }
    const template = templates[field]
    if (template) {
      setActiveResume({
        ...activeResume,
        [field]: [...(activeResume[field] as any[] || []), template],
      })
    }
  }

  const removeEntry = (field: keyof ResumeData, index: number) => {
    const arr = [...(activeResume[field] as any[] || [])]
    arr.splice(index, 1)
    setActiveResume({ ...activeResume, [field]: arr })
  }

  const updateEntry = (field: keyof ResumeData, index: number, key: string, value: string) => {
    const arr = [...(activeResume[field] as any[] || [])]
    arr[index] = { ...arr[index], [key]: value }
    setActiveResume({ ...activeResume, [field]: arr })
  }

  const toggleCollapse = (section: string) => setCollapsed({ ...collapsed, [section]: !collapsed[section] })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Resume Builder</h2>
          {activeResume.lastAiUpdate && (
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
              <Sparkles className="h-3 w-3 mr-1" /> AI Updated {new Date(activeResume.lastAiUpdate).toLocaleDateString()}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-1" /> {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Edit Panel */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-3">
              <Input value={activeResume.title} onChange={(e) => setActiveResume({ ...activeResume, title: e.target.value })}
                placeholder="Resume Title" className="font-medium" />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggleCollapse('summary')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Professional Summary</CardTitle>
                {collapsed.summary ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardHeader>
            {!collapsed.summary && (
              <CardContent className="px-3 pb-3">
                <Textarea value={activeResume.summary} rows={4}
                  onChange={(e) => setActiveResume({ ...activeResume, summary: e.target.value })}
                  placeholder="Write a professional summary..." />
                <Button variant="ghost" size="sm" className="mt-1 text-emerald-600" onClick={() => handleAiEnhance('summary')} disabled={aiUpdating}>
                  <Sparkles className="h-3 w-3 mr-1" /> {aiUpdating ? 'Enhancing...' : 'Enhance with AI'}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggleCollapse('experience')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" /> Experience ({activeResume.experience?.length || 0})</CardTitle>
                {collapsed.experience ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardHeader>
            {!collapsed.experience && (
              <CardContent className="px-3 pb-3 space-y-3">
                {activeResume.experience?.map((exp: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-gray-400"
                      onClick={() => removeEntry('experience', i)}><Trash2 className="h-3 w-3" /></Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Company" value={exp.company} onChange={(e) => updateEntry('experience', i, 'company', e.target.value)} />
                      <Input placeholder="Role" value={exp.role} onChange={(e) => updateEntry('experience', i, 'role', e.target.value)} />
                    </div>
                    <Input placeholder="Duration (e.g., 2022 - Present)" value={exp.duration} onChange={(e) => updateEntry('experience', i, 'duration', e.target.value)} />
                    <Textarea placeholder="Description of responsibilities and achievements..." value={exp.description}
                      onChange={(e) => updateEntry('experience', i, 'description', e.target.value)} rows={2} />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => addEntry('experience')}>
                  <Plus className="h-3 w-3 mr-1" /> Add Experience
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggleCollapse('education')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education ({activeResume.education?.length || 0})</CardTitle>
                {collapsed.education ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardHeader>
            {!collapsed.education && (
              <CardContent className="px-3 pb-3 space-y-3">
                {activeResume.education?.map((edu: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-gray-400"
                      onClick={() => removeEntry('education', i)}><Trash2 className="h-3 w-3" /></Button>
                    <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEntry('education', i, 'institution', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEntry('education', i, 'degree', e.target.value)} />
                      <Input placeholder="Year" value={edu.year} onChange={(e) => updateEntry('education', i, 'year', e.target.value)} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => addEntry('education')}>
                  <Plus className="h-3 w-3 mr-1" /> Add Education
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggleCollapse('skills')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4" /> Skills ({activeResume.skills?.length || 0})</CardTitle>
                {collapsed.skills ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardHeader>
            {!collapsed.skills && (
              <CardContent className="px-3 pb-3 space-y-3">
                {activeResume.skills?.map((skill: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="Skill" value={skill.name} className="flex-1"
                      onChange={(e) => updateEntry('skills', i, 'name', e.target.value)} />
                    <Select value={skill.level} onValueChange={(v) => updateEntry('skills', i, 'level', v)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeEntry('skills', i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => addEntry('skills')}>
                    <Plus className="h-3 w-3 mr-1" /> Add Skill
                  </Button>
                  <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => {
                    const suggestions = ['AWS', 'Docker', 'Kubernetes', 'GraphQL', 'System Design']
                    suggestions.forEach(s => {
                      if (!activeResume.skills?.some((sk: any) => sk.name === s)) {
                        setActiveResume(prev => ({ ...prev, skills: [...(prev.skills || []), { name: s, level: 'Intermediate', source: 'AI' }] }))
                      }
                    })
                    toast.success('AI suggested 5 skills based on market trends!')
                  }}>
                    <Sparkles className="h-3 w-3 mr-1" /> AI Suggest
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggleCollapse('projects')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4" /> Projects ({activeResume.projects?.length || 0})</CardTitle>
                {collapsed.projects ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardHeader>
            {!collapsed.projects && (
              <CardContent className="px-3 pb-3 space-y-3">
                {activeResume.projects?.map((proj: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-gray-400"
                      onClick={() => removeEntry('projects', i)}><Trash2 className="h-3 w-3" /></Button>
                    <Input placeholder="Project Name" value={proj.name} onChange={(e) => updateEntry('projects', i, 'name', e.target.value)} />
                    <Textarea placeholder="Description..." value={proj.description} onChange={(e) => updateEntry('projects', i, 'description', e.target.value)} rows={2} />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => addEntry('projects')}>
                  <Plus className="h-3 w-3 mr-1" /> Add Project
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Achievements & Languages */}
          <Card>
            <CardHeader className="p-3 cursor-pointer" onClick={() => toggleCollapse('other')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Achievements & Languages</CardTitle>
                {collapsed.other ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardHeader>
            {!collapsed.other && (
              <CardContent className="px-3 pb-3 space-y-3">
                <div>
                  <Label className="text-xs font-medium">Achievements</Label>
                  {activeResume.achievements?.map((ach: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center mt-1">
                      <Input value={ach} className="flex-1" onChange={(e) => {
                        const arr = [...activeResume.achievements]; arr[i] = e.target.value
                        setActiveResume({ ...activeResume, achievements: arr })
                      }} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEntry('achievements', i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-1" onClick={() => setActiveResume({ ...activeResume, achievements: [...(activeResume.achievements || []), ''] })}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                <div>
                  <Label className="text-xs font-medium">Languages</Label>
                  {activeResume.languages?.map((lang: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center mt-1">
                      <Input value={lang.name} placeholder="Language" className="flex-1"
                        onChange={(e) => updateEntry('languages', i, 'name', e.target.value)} />
                      <Select value={lang.proficiency} onValueChange={(v) => updateEntry('languages', i, 'proficiency', v)}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Native">Native</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Conversational">Conversational</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEntry('languages', i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-1" onClick={() => addEntry('languages')}>
                    <Plus className="h-3 w-3 mr-1" /> Add Language
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Template */}
          <Card>
            <CardContent className="p-3">
              <Label className="text-xs font-medium mb-2 block">Resume Template</Label>
              <div className="grid grid-cols-4 gap-2">
                {['professional', 'modern', 'creative', 'minimal'].map(t => (
                  <Button key={t} variant={activeResume.template === t ? 'default' : 'outline'} size="sm"
                    className={activeResume.template === t ? 'bg-emerald-600' : ''} onClick={() => setActiveResume({ ...activeResume, template: t })}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
                <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-xs text-gray-500">Resume Preview</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.info('PDF download coming soon!')}>
                    <Download className="h-3 w-3 mr-1" /> PDF
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="p-6" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                    {/* Resume Header */}
                    <div className="text-center mb-4">
                      <h1 className="text-lg font-bold text-gray-900">{user?.name || 'Your Name'}</h1>
                      <p className="text-emerald-700 font-medium text-xs mt-0.5">{activeResume.summary?.split('.')[0] || 'Professional Summary'}</p>
                      <div className="flex items-center justify-center gap-2 mt-1 text-gray-500">
                        {user?.email && <span>{user.email}</span>}
                        {user?.phone && <span>• {user.phone}</span>}
                        {user?.location && <span>• {user.location}</span>}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Summary */}
                    {activeResume.summary && (
                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Professional Summary</h2>
                        <p className="text-gray-700">{activeResume.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {activeResume.experience?.length > 0 && (
                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Experience</h2>
                        {activeResume.experience.map((exp: any, i: number) => (
                          <div key={i} className="mb-2">
                            <div className="flex justify-between items-baseline">
                              <span className="font-semibold text-gray-900">{exp.role}</span>
                              <span className="text-gray-500">{exp.duration}</span>
                            </div>
                            <span className="text-emerald-700">{exp.company}</span>
                            {exp.description && <p className="text-gray-600 mt-0.5">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {activeResume.education?.length > 0 && (
                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Education</h2>
                        {activeResume.education.map((edu: any, i: number) => (
                          <div key={i} className="mb-1">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">{edu.degree}</span>
                              <span className="text-gray-500">{edu.year}</span>
                            </div>
                            <span className="text-gray-600">{edu.institution}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {activeResume.skills?.length > 0 && (
                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Skills</h2>
                        <div className="flex flex-wrap gap-1">
                          {activeResume.skills.map((skill: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{skill.name} ({skill.level})</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {activeResume.projects?.length > 0 && (
                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Projects</h2>
                        {activeResume.projects.map((proj: any, i: number) => (
                          <div key={i} className="mb-1">
                            <span className="font-semibold text-gray-900">{proj.name}</span>
                            {proj.description && <p className="text-gray-600">{proj.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Achievements */}
                    {activeResume.achievements?.filter(Boolean).length > 0 && (
                      <div className="mb-3">
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Achievements</h2>
                        <ul className="list-disc pl-4 text-gray-700">
                          {activeResume.achievements.filter(Boolean).map((ach: string, i: number) => (
                            <li key={i}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Languages */}
                    {activeResume.languages?.length > 0 && (
                      <div>
                        <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Languages</h2>
                        <div className="flex flex-wrap gap-2">
                          {activeResume.languages.map((lang: any, i: number) => (
                            <span key={i} className="text-gray-700">{lang.name} ({lang.proficiency})</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
