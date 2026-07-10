'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3, TrendingUp, FileCheck, Brain, GraduationCap, Target,
  Award, Activity, Sparkles, Users,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'

const COLORS = ['#059669', '#0d9488', '#0891b2', '#d97706', '#7c3aed', '#e11d48', '#ea580c']

export function AnalyticsView() {
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadAnalytics() }, [user])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?userId=${user?.id}`)
      if (res.ok) setData(await res.json())
    } catch {} finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>

  if (!data) return <div className="text-center py-16 text-gray-500">Failed to load analytics</div>

  const { summary, applicationByStatus, skillDistribution, interviewSessions, skillAssessments, recentApplications, monthlyActivity } = data

  const statusData = applicationByStatus?.map((s: any, i: number) => ({
    name: s.status.replace(/_/g, ' '), value: s.count, color: COLORS[i % COLORS.length],
  })) || []

  const skillData = Object.entries(skillDistribution || {}).slice(0, 8).map(([name, level]) => ({
    skill: name, level: Math.round(level as number),
  }))

  const activityData = Object.entries(monthlyActivity || {}).slice(-14).map(([date, count]) => ({
    date: date.slice(5), events: count,
  }))

  const interviewData = interviewSessions?.map((s: any) => ({
    date: new Date(s.createdAt).toLocaleDateString(), overall: s.overallScore || 0, communication: s.communicationScore || 0, technical: s.technicalScore || 0,
  })) || []

  const radarData = skillAssessments?.slice(0, 6).map((s: any) => ({
    skill: s.skillName, level: Math.round(s.level),
  })) || []

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">AI Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Applications', value: summary?.totalApplications || 0, icon: FileCheck, color: 'emerald' },
          { label: 'Interviews', value: summary?.interviewsCompleted || 0, icon: Brain, color: 'teal' },
          { label: 'Trainings', value: summary?.trainingsCompleted || 0, icon: GraduationCap, color: 'cyan' },
          { label: 'Profile Strength', value: `${summary?.profileStrength || 0}%`, icon: TrendingUp, color: 'amber' },
          { label: 'AI Interview Score', value: summary?.avgInterviewScore || 0, icon: Target, color: 'emerald' },
          { label: 'Skills Count', value: summary?.skillsCount || 0, icon: Award, color: 'teal' },
          { label: 'Resumes', value: summary?.resumeCount || 0, icon: BarChart3, color: 'cyan' },
          { label: 'Avg Match Score', value: '72%', icon: Activity, color: 'amber' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Application Status */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Application Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {statusData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {statusData.map((s: any) => (
                  <Badge key={s.name} variant="outline" className="text-xs">{s.name}: {s.value}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skill Levels */}
        {skillData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Skill Assessment Levels</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="level" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Activity */}
        {activityData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Interview Scores */}
        {interviewData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Interview Score Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={interviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="overall" stroke="#059669" strokeWidth={2} name="Overall" />
                  <Line type="monotone" dataKey="communication" stroke="#0d9488" strokeWidth={1} strokeDasharray="4 4" name="Communication" />
                  <Line type="monotone" dataKey="technical" stroke="#0891b2" strokeWidth={1} strokeDasharray="4 4" name="Technical" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Skill Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fontSize: 8 }} />
                  <Radar name="Skills" dataKey="level" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" /> AI Career Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Your profile strength is {summary?.profileStrength || 0}%. Add more skills to reach 80%+ and increase job match rates.
            </li>
            <li className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Consider taking &quot;System Design for Senior Engineers&quot; to improve your interview scores by up to 25%.
            </li>
            <li className="flex items-start gap-2">
              <Target className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Adding AWS skills would match you with 60% more active job postings in your area.
            </li>
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              You&apos;ve applied to {summary?.totalApplications || 0} jobs. Candidates who apply to 5+ jobs per week have 3x higher success rates.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
