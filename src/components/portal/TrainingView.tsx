'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  GraduationCap, Star, Clock, Users, BookOpen, Play, CheckCircle2,
  Sparkles, ChevronRight, Filter, ExternalLink, Mic, Video, FileCheck,
  Brain, Cpu, BarChart3, Zap, Trophy, Headphones, MessageSquare,
} from 'lucide-react'

const MARQAICOURSES_URL = 'https://marqaicourses.com'

const categoryColors: Record<string, string> = {
  Programming: 'from-emerald-500 to-teal-600',
  'Data Science': 'from-cyan-500 to-blue-600',
  'Cloud Computing': 'from-amber-500 to-orange-600',
  Marketing: 'from-rose-500 to-pink-600',
  Product: 'from-violet-500 to-purple-600',
  Design: 'from-fuchsia-500 to-pink-600',
  'Soft Skills': 'from-rose-400 to-pink-500',
}

const courseIcons: Record<string, any> = {
  'ai-machine-learning': Brain,
  'fullstack-java-development': Cpu,
  'dotnet-fullstack-development': BarChart3,
  'mobile-app-development': BookOpen,
  'flutter-development': Zap,
  'python-programming': Trophy,
  'soft-skills-communication': Users,
  '3boxes-developers-curated': Star,
}

export function TrainingView() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')

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
            <option value="Soft Skills">Soft Skills</option>
          </select>
        </div>
      </div>

      {/* MarqAI Courses Banner */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">Powered by MarqAI Courses</p>
            <p className="text-xs text-emerald-600 mt-0.5">AI voice tutoring in 5+ Indian languages, graded quizzes, video walkthroughs & verified certificates</p>
          </div>
          <a href={MARQAICOURSES_URL} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-lg text-xs">
              <ExternalLink className="h-3 w-3 mr-1" /> Visit Site
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* AI Skills Auto-Update Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">AI Skill Auto-Update</p>
            <p className="text-xs text-blue-600">When you complete a training course, your skills and resume are automatically updated across the platform.</p>
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
            const CourseIcon = courseIcons[course.id] || GraduationCap
            const isFree = course.price === 0 || course.price === '0'
            const priceDisplay = isFree ? 'FREE' : `₹${Number(course.price).toLocaleString('en-IN')}`

            return (
              <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full hover:shadow-md transition-shadow flex flex-col">
                  {/* Course thumbnail */}
                  <div className={`h-24 bg-gradient-to-br ${gradient} rounded-t-lg flex items-center justify-center relative`}>
                    <CourseIcon className="h-8 w-8 text-white/80" />
                    <div className="absolute top-2 right-2">
                      <Badge className={`text-[10px] px-2 py-0.5 ${isFree ? 'bg-emerald-500 text-white' : 'bg-white/90 text-gray-800'} border-0 rounded-full font-semibold`}>
                        {priceDisplay}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{course.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{course.level === 'all' ? 'All Levels' : course.level}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{course.description}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
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

                    {/* MarqAI Courses link */}
                    <a href={MARQAICOURSES_URL} target="_blank" rel="noopener noreferrer" className="mt-auto">
                      <Button size="sm" className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-lg text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" /> View on MarqAI Courses
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Bottom link to marqaicourses.com */}
      <div className="text-center pt-4">
        <a href={MARQAICOURSES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#16a34a] hover:text-[#15803d] font-semibold text-sm">
          <GraduationCap className="h-4 w-4" /> Browse all courses on marqaicourses.com <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
