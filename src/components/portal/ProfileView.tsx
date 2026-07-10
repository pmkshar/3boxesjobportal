'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Link2,
  Save, CheckCircle2, Plus, X, Star,
} from 'lucide-react'

export function ProfileView() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => { if (user) loadProfile() }, [user])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/me?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.jobSeekerProfile || {})
      }
    } catch {} finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      // Update profile - simplified for demo
      await new Promise(r => setTimeout(r, 800))
      toast.success('Profile updated successfully!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    const currentSkills = profile?.skills ? profile.skills.split(',').map((s: string) => s.trim()) : []
    if (!currentSkills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...currentSkills, newSkill.trim()].join(', ') })
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    const currentSkills = profile?.skills ? profile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== skill) : []
    setProfile({ ...profile, skills: currentSkills.join(', ') })
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>

  const skills = profile?.skills ? profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* Profile Completeness */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800">Profile Completeness</span>
            <span className="text-sm font-bold text-emerald-700">{profile?.profileComplete || 0}%</span>
          </div>
          <Progress value={profile?.profileComplete || 0} className="h-2" />
          <p className="text-xs text-emerald-600 mt-1">Complete your profile to increase visibility by up to 80%</p>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={user?.name || ''} readOnly className="mt-1 bg-gray-50" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={user?.email || ''} readOnly className="mt-1 bg-gray-50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Phone</Label>
              <Input placeholder="+91-9876543210" value={user?.phone || ''} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input placeholder="Mumbai, India" value={user?.location || ''} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" /> Professional Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Headline</Label>
            <Input placeholder="e.g., Senior Full-Stack Developer" value={profile?.headline || ''} className="mt-1"
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Current Role</Label>
              <Input placeholder="Software Engineer" value={profile?.currentRole || ''} className="mt-1"
                onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Current Company</Label>
              <Input placeholder="Company name" value={profile?.currentCompany || ''} className="mt-1"
                onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Experience (Years)</Label>
              <Input type="number" value={profile?.experienceYears || 0} className="mt-1"
                onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Expected Salary</Label>
              <Input placeholder="15-20 LPA" value={profile?.expectedSalary || ''} className="mt-1"
                onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Job Type</Label>
              <select value={profile?.jobType || 'full-time'} className="mt-1 w-full border rounded-md px-2 py-1.5 text-sm"
                onChange={(e) => setProfile({ ...profile, jobType: e.target.value })}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Education</Label>
            <Input placeholder="B.Tech Computer Science - IIT Mumbai" value={profile?.education || ''} className="mt-1"
              onChange={(e) => setProfile({ ...profile, education: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4" /> Skills
            <Badge variant="outline" className="ml-2">{skills.length} skills</Badge>
            {profile?.aiSkillScore > 0 && <Badge className="bg-emerald-100 text-emerald-700 ml-1">AI Score: {profile.aiSkillScore}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1 pr-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
            <Button size="sm" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Link2 className="h-4 w-4" /> Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">LinkedIn</Label>
            <Input placeholder="https://linkedin.com/in/yourname" value={profile?.linkedInUrl || ''} className="mt-1"
              onChange={(e) => setProfile({ ...profile, linkedInUrl: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">GitHub</Label>
            <Input placeholder="https://github.com/yourname" value={profile?.githubUrl || ''} className="mt-1"
              onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Portfolio</Label>
            <Input placeholder="https://yourportfolio.com" value={profile?.portfolioUrl || ''} className="mt-1"
              onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
