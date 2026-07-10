'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  GraduationCap, Star, Clock, Users, BookOpen, Play, CheckCircle2,
  Sparkles, ChevronRight, Filter,
} from 'lucide-react'

const categoryColors: Record<string, string> = {
  Programming: 'from-emerald-500 to-teal-600',
  'Data Science': 'from-cyan-500 to-blue-600',
  'Cloud Computing': 'from-amber-500 to-orange-600',
  Marketing: 'from-rose-500 to-pink-600',
  Product: 'from-violet-500 to-purple-600',
  Design: 'from-fuchsia-500 to-pink-600',
}

export function TrainingView() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('catalog')

  useEffect(() => { loadData() }, [user, categoryFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (user) params.set('userId', user.id)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      const res = await fetch(`/api/training?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses || [])
      }
      if (user) {
        const enrollRes = await fetch(`/api/training?userId=${user.id}`)
        // handled in same response
      }
    } catch {} finally { setLoading(false) }
  }

  const handleEnroll = async (courseId: string) => {
    if (!user) { toast.error('Please login first'); return }
    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, courseId }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Enrolled successfully!')
        loadData()
      } else {
        toast.error(data.error || 'Failed to enroll')
      }
    } catch { toast.error('Network error') }
  }

  const handleComplete = async (enrollmentId: string, courseId: string, skills: string) => {
    if (!user) return
    try {
      const res = await fetch('/api/training', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          progress: 100,
          status: 'completed',
          score: 85,
          skillsAcquired: skills ? skills.split(',').map((s: string) => s.trim()) : [],
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Course completed! Your skills and resume have been auto-updated!', { duration: 5000 })
        loadData()
      }
    } catch { toast.error('Network error') }
  }

  const isEnrolled = (courseId: string) => courses.some((c: any) => c.enrollments?.length > 0 && c.id === courseId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-900">Training Hub</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1">
            <option value="all">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Data Science">Data Science</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Marketing">Marketing</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
          </select>
        </div>
      </div>

      {/* AI Skills Auto-Update Notice */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-3 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">AI Skill Auto-Update</p>
            <p className="text-xs text-emerald-600">When you complete a training course, your skills and resume are automatically updated across the platform.</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-48 bg-gray-200 rounded" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: any, i: number) => {
            const enrolled = course.enrollments?.length > 0
            const enrollment = course.enrollments?.[0]
            const gradient = categoryColors[course.category] || 'from-gray-500 to-gray-600'

            return (
              <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full hover:shadow-md transition-shadow flex flex-col">
                  {/* Course thumbnail */}
                  <div className={`h-24 bg-gradient-to-br ${gradient} rounded-t-lg flex items-center justify-center`}>
                    <GraduationCap className="h-8 w-8 text-white/80" />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <Badge variant="outline" className="text-xs mb-2 self-start">{course.category}</Badge>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}h</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollCount}</span>
                    </div>

                    {course.skills && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {course.skills.split(',').slice(0, 3).map((s: string) => (
                          <Badge key={s.trim()} variant="secondary" className="text-[10px]">{s.trim()}</Badge>
                        ))}
                      </div>
                    )}

                    {enrolled ? (
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-1.5" />
                        {enrollment.status === 'completed' ? (
                          <Badge className="w-full justify-center bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        ) : (
                          <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                              if (enrollment.progress >= 80) {
                                handleComplete(enrollment.id, course.id, course.skills)
                              } else {
                                handleComplete(enrollment.id, course.id, course.skills) // allow complete for demo
                              }
                            }}>
                            {enrollment.progress >= 80 ? 'Complete Course' : 'Continue'} <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button size="sm" className="mt-auto w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleEnroll(course.id)}>
                        <BookOpen className="h-3 w-3 mr-1" /> Enroll Free
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
