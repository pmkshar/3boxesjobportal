'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HeroIllustration } from './Illustrations'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Briefcase, Brain, FileText, Users, BarChart3, GraduationCap,
  ArrowRight, Sparkles, Zap, Target, Award, CheckCircle2, MapPin,
  Search, Building2, TrendingUp, Clock, Code, PieChart, UserCheck,
  IndianRupee, Globe, ChevronDown, Layers, Box, Trophy, Rocket,
  PenTool, MessageSquare, Cpu, Lightbulb, Handshake, Wifi, X,
  Bookmark, LayoutGrid, Facebook, Linkedin, Twitter, ShieldCheck, Heart,
} from 'lucide-react'

// Job categories config
const jobCategoriesConfig = [
  { icon: Code, label: 'IT & Software', keywords: ['React', 'Node', 'Python', 'TypeScript', 'AWS', 'Docker'], color: 'bg-green-50 text-green-700 border-green-200' },
  { icon: IndianRupee, label: 'Banking & Finance', keywords: ['CA', 'CFA', 'Accounting', 'Banking', 'Investment'], color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { icon: Heart, label: 'Healthcare', keywords: ['Doctor', 'Nurse', 'Pharma', 'Medical', 'Clinical'], color: 'bg-red-50 text-red-700 border-red-200' },
  { icon: PenTool, label: 'Marketing', keywords: ['SEO', 'Content', 'Social Media', 'Brand', 'Growth'], color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { icon: GraduationCap, label: 'Education', keywords: ['Teacher', 'Professor', 'Trainer', 'Curriculum'], color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { icon: TrendingUp, label: 'Sales', keywords: ['B2B', 'B2C', 'Enterprise', 'SaaS', 'Revenue'], color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { icon: Building2, label: 'Engineering', keywords: ['Civil', 'Mechanical', 'Electrical', 'Project Mgmt'], color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { icon: Cpu, label: 'Data Science', keywords: ['ML', 'AI', 'Analytics', 'Python', 'Statistics'], color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]

// Company colors
const companyColors = [
  'bg-[#16a34a]', 'bg-[#34a853]', 'bg-[#f9ab00]', 'bg-[#d93025]',
  'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
]

const getCompanyInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : 'C'
const getCompanyColor = (name?: string) => {
  if (!name) return companyColors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return companyColors[Math.abs(hash) % companyColors.length]
}

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return 'Not disclosed'
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`
  if (min && max) return `₹${fmt(min)} - ₹${fmt(max)}/mo`
  return min ? `₹${fmt(min)}+/mo` : `Up to ₹${fmt(max!)}/mo`
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

export function HomePage() {
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchExp, setSearchExp] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    loadFeaturedJobs()
  }, [])

  const loadFeaturedJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs?limit=8&page=1')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
      }
    } catch {} finally { setLoading(false) }
  }

  const handleSearch = async () => {
    if (!searchSkill && !searchLocation && !searchExp) {
      toast.info('Enter a skill, location, or experience level to search')
      return
    }
    // Navigate to find-jobs page with search params
    const params = new URLSearchParams()
    if (searchSkill) params.set('search', searchSkill)
    if (searchLocation) params.set('location', searchLocation)
    window.location.href = `/find-jobs?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] pb-36 pt-10 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Hero illustration */}
        <div className="absolute right-0 bottom-0 w-80 lg:w-[420px] opacity-20 lg:opacity-30 pointer-events-none hidden md:block">
          <svg viewBox="0 0 420 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="120" r="60" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="300" cy="120" r="30" fill="white" opacity="0.1" />
            <rect x="180" y="200" width="160" height="100" rx="10" stroke="white" strokeWidth="2" opacity="0.3" />
            <rect x="200" y="220" width="120" height="10" rx="5" fill="white" opacity="0.15" />
            <rect x="200" y="240" width="80" height="10" rx="5" fill="white" opacity="0.1" />
            <rect x="200" y="260" width="100" height="10" rx="5" fill="white" opacity="0.1" />
            <path d="M260 160C260 160 280 200 280 200L340 200C340 200 320 160 260 160Z" fill="white" opacity="0.15" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <motion.div
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5"
            >
              <Sparkles className="h-4 w-4 text-green-300" />
              <span className="text-sm text-green-100 font-medium">India&apos;s #1 AI-Powered Job Portal</span>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-white leading-tight"
            >
              Find Your Dream Job with{' '}
              <span className="relative inline-block">
                <span className="text-green-300">AI-Powered</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 120 8" fill="none"><path d="M2 6C20 2 50 2 60 4C70 6 100 3 118 2" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/></svg>
              </span>{' '}
              Precision
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-4 text-base sm:text-lg text-green-100/80 max-w-2xl mx-auto"
            >
              Smart resumes, AI mock interviews, skill auto-updates & intelligent job matching — your complete career platform
            </motion.p>
          </div>

          {/* ===== SEARCH BAR ===== */}
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  <Input
                    placeholder="Skills, Designations, Companies"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-xl"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  <Input
                    placeholder="Location (City, State)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-xl"
                  />
                </div>
                <div className="sm:w-36 relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  <Input
                    placeholder="Experience"
                    value={searchExp}
                    onChange={(e) => setSearchExp(e.target.value)}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-xl"
                  />
                </div>
                <Button className="h-12 px-8 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-base rounded-xl whitespace-nowrap shadow-md"
                  onClick={handleSearch}>
                  <Search className="h-5 w-5 mr-2" /> Search
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {['React', 'Python', 'AWS', 'Data Science', 'DevOps', 'Product Manager'].map(tag => (
                <button key={tag} className="px-3 py-1 text-sm bg-white/15 text-white/90 rounded-full hover:bg-white/25 transition-colors"
                  onClick={() => { setSearchSkill(tag); setTimeout(() => handleSearch(), 100) }}>
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-14"
          >
            {[
              { label: 'Active Jobs', value: '10,000+', icon: Briefcase },
              { label: 'Companies', value: '5,000+', icon: Building2 },
              { label: 'Candidates', value: '50,000+', icon: Users },
              { label: 'AI Interviews', value: '1,000+', icon: Brain },
            ].map(stat => (
              <div key={stat.label} className="text-center flex flex-col items-center">
                <stat.icon className="h-5 w-5 text-green-300 mb-1" />
                <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-green-200/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 30C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== JOB CATEGORIES ===== */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Browse Jobs by Category</h2>
            <Link href="/find-jobs">
              <Button variant="ghost" className="text-[#16a34a] text-sm font-semibold">
                View All <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {jobCategoriesConfig.map((cat, i) => (
              <motion.div key={cat.label}
                initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              >
                <Link href={`/find-jobs?search=${cat.keywords[0]}`}>
                  <Card className={`border ${cat.color} hover:shadow-md transition-all cursor-pointer group h-full`}>
                    <CardContent className="p-4 text-center">
                      <cat.icon className="h-7 w-7 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-sm">{cat.label}</h3>
                      <p className="text-[10px] opacity-70 mt-1">{cat.keywords.slice(0, 3).join(', ')}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS (JobHub Card Style) ===== */}
      <section className="py-16 bg-[#f5f7fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Featured <span className="text-[#16a34a]">Jobs</span></h2>
              <p className="text-gray-500 text-sm mt-1">Hand-picked opportunities matched by AI</p>
            </div>
            <Link href="/find-jobs">
              <Button variant="outline" className="border-[#16a34a] text-[#16a34a] hover:bg-green-50 font-semibold text-sm rounded-xl">
                View All Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-sm">
                  <CardContent className="p-0">
                    <div className="h-[120px] bg-[#f5f7fc] rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-[#f5f7fc] rounded w-3/4" />
                      <div className="h-3 bg-[#f5f7fc] rounded w-1/2" />
                      <div className="h-3 bg-[#f5f7fc] rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="text-lg font-semibold text-gray-900">No jobs available yet</p>
              <p className="text-sm text-gray-500 mt-1">Check back soon for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {jobs.map((job, i) => (
                <Card key={job.id}
                  className="hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-0 shadow-sm hover:shadow-xl overflow-hidden"
                  onClick={() => { window.location.href = '/find-jobs' }}>
                  <CardContent className="p-0">
                    {/* Card Top - Company Color Banner */}
                    <div className={`relative h-[120px] ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                      <span className="text-4xl font-bold text-white/30 select-none">
                        {getCompanyInitial(job.corporate?.companyName)}
                      </span>
                      {job.isRemote && (
                        <label className="absolute top-3 left-3 bg-[#f9ab00] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm">Remote</label>
                      )}
                      {i < 3 && !job.isRemote && (
                        <label className="absolute top-3 left-3 bg-[#d93025] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide shadow-sm">Urgent</label>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm`}>
                            {getCompanyInitial(job.corporate?.companyName)}
                          </div>
                          <span className="text-xs text-gray-500 truncate font-medium">{job.corporate?.companyName || 'Company'}</span>
                        </div>
                        <Badge className="bg-gray-50 text-gray-500 border-0 text-[10px] rounded-md px-2 py-0.5 font-medium capitalize flex-shrink-0">
                          {job.jobType || 'Full Time'}
                        </Badge>
                      </div>
                      <h5 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#16a34a] transition-colors line-clamp-2 mb-2">
                        {job.title}
                      </h5>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#16a34a]" /> {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[#16a34a]" /> {job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-semibold text-[#16a34a] text-sm">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/find-jobs">
              <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-8 h-11 rounded-xl shadow-md">
                Browse All Jobs <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS TO OTHER PAGES ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Explore <span className="text-[#16a34a]">More</span></h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">Discover AI features, corporate partnerships, and training opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/corporate">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all group h-full cursor-pointer overflow-hidden">
                <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Building2 className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-lg">Corporate Partners</h3>
                </div>
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-500">See 500+ companies hiring through 3 Boxes and learn about AI-powered recruitment advantages.</p>
                  <span className="inline-flex items-center text-[#16a34a] font-semibold text-sm mt-3 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/ai-features">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all group h-full cursor-pointer overflow-hidden">
                <div className="bg-gradient-to-br from-[#f9ab00] to-[#e9a000] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Brain className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-lg">AI Features</h3>
                </div>
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-500">Discover built-in AI tools for resume building, job matching, mock interviews, and skill auto-updates.</p>
                  <span className="inline-flex items-center text-[#16a34a] font-semibold text-sm mt-3 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/training">
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all group h-full cursor-pointer overflow-hidden">
                <div className="bg-gradient-to-br from-[#15803d] to-[#166534] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <GraduationCap className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white text-lg">Training Hub</h3>
                </div>
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-gray-500">Upskill with industry-aligned courses that auto-update your profile and boost your match scores.</p>
                  <span className="inline-flex items-center text-[#16a34a] font-semibold text-sm mt-3 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
