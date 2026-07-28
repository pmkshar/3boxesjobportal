'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Briefcase, Brain, FileText, Users, BarChart3, GraduationCap,
  ArrowRight, Sparkles, Zap, Target, Award, CheckCircle2, MapPin,
  Search, Building2, TrendingUp, Clock, Code, PieChart, UserCheck,
  IndianRupee, Globe, ChevronDown, Layers, Box, Trophy, Rocket,
  PenTool, MessageSquare, Cpu, Lightbulb, Handshake, Wifi, X,
  Bookmark, LayoutGrid, Shield, BookOpen, Star, Download,
  Heart, Bell, User, Smartphone, Share, Play, Eye, Phone,
  ChevronRight, Filter,
} from 'lucide-react'

// ===== Marqaitech.com Green Color Palette =====
const M = {
  900: '#0d5a0a',
  800: '#1f8f15',
  700: '#2d7a28',
  600: '#1a7a1a',
  500: '#328a32',
  400: '#49A842',
  300: '#5cb85c',
  200: '#7dd87d',
  100: '#a5d6a7',
  50: '#e8f5e9',
}

// Job categories config
const jobCategoriesConfig = [
  { icon: Code, label: 'IT & Software', count: '2,500+', keywords: ['React', 'Node', 'Python', 'AWS'], color: 'bg-[#1f8f15]' },
  { icon: IndianRupee, label: 'Banking & Finance', count: '1,800+', keywords: ['CA', 'CFA', 'Accounting', 'Banking'], color: 'bg-[#2d7a28]' },
  { icon: Heart, label: 'Healthcare', count: '950+', keywords: ['Doctor', 'Nurse', 'Pharma', 'Medical'], color: 'bg-[#1a7a1a]' },
  { icon: PenTool, label: 'Marketing', count: '1,200+', keywords: ['SEO', 'Content', 'Social Media', 'Brand'], color: 'bg-[#328a32]' },
  { icon: GraduationCap, label: 'Education', count: '780+', keywords: ['Teacher', 'Professor', 'Trainer', 'Curriculum'], color: 'bg-[#49A842]' },
  { icon: TrendingUp, label: 'Sales', count: '1,600+', keywords: ['B2B', 'B2C', 'Enterprise', 'SaaS'], color: 'bg-[#1f8f15]' },
  { icon: Building2, label: 'Engineering', count: '1,100+', keywords: ['Civil', 'Mechanical', 'Electrical', 'Project Mgmt'], color: 'bg-[#2d7a28]' },
  { icon: Cpu, label: 'Data Science', count: '900+', keywords: ['ML', 'AI', 'Analytics', 'Python'], color: 'bg-[#1a7a1a]' },
]

// Company colors
const companyColors = [
  'bg-[#1f8f15]', 'bg-[#49A842]', 'bg-[#f9ab00]', 'bg-[#d93025]',
  'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
]

const topCompanies = [
  { name: 'TCS', logo: 'TCS', openings: '3,200' },
  { name: 'Infosys', logo: 'INFY', openings: '2,800' },
  { name: 'Wipro', logo: 'WIP', openings: '1,900' },
  { name: 'HCL Tech', logo: 'HCL', openings: '1,500' },
  { name: 'Amazon', logo: 'AMZ', openings: '2,100' },
  { name: 'Google', logo: 'GOO', openings: '980' },
  { name: 'Microsoft', logo: 'MSF', openings: '1,200' },
  { name: 'Flipkart', logo: 'FLP', openings: '870' },
  { name: 'Reliance', logo: 'REL', openings: '2,400' },
  { name: 'HDFC Bank', logo: 'HDF', openings: '1,100' },
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

// Testimonials
const testimonials = [
  { name: 'Priya M.', role: 'Software Engineer at Google', text: 'The AI mock interviews helped me land my dream job at a top tech company. The feedback was incredibly detailed and actionable!', rating: 5, avatar: 'PM' },
  { name: 'Rahul K.', role: 'Data Scientist at Amazon', text: 'Skill auto-update is a game changer. Every course I complete automatically enhances my resume and profile.', rating: 5, avatar: 'RK' },
  { name: 'Sneha R.', role: 'HR Director at TCS', text: 'As a corporate user, the AI matching saves us hours. We find better candidates faster than any other platform.', rating: 5, avatar: 'SR' },
  { name: 'Amit P.', role: 'Product Manager at Flipkart', text: 'The smart job matching is spot-on. I got matched with roles that perfectly aligned with my skills and aspirations.', rating: 5, avatar: 'AP' },
]

// Trending searches
const trendingSearches = [
  'React Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer',
  'ML Engineer', 'UI/UX Designer', 'Full Stack', 'AWS Cloud',
]

// How it works steps
const howItWorksSteps = [
  { step: '01', icon: FileText, title: 'Create Profile', desc: 'Build your AI-powered resume with smart suggestions for skills, formats, and keywords recruiters search for.', color: 'from-[#1f8f15] to-[#2d7a28]' },
  { step: '02', icon: Brain, title: 'AI Matches Jobs', desc: 'Our intelligent engine analyzes your skills and preferences to surface the most relevant opportunities for you.', color: 'from-[#2d7a28] to-[#1f8f15]' },
  { step: '03', icon: Target, title: 'Practice Interviews', desc: 'Prepare with realistic AI mock interviews and get instant feedback on communication and technical depth.', color: 'from-[#1a7a1a] to-[#2d7a28]' },
  { step: '04', icon: Trophy, title: 'Get Hired Faster', desc: 'With AI-enhanced resumes, verified skills, and interview readiness, you stand out to employers.', color: 'from-[#2d7a28] to-[#1f8f15]' },
]

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
    const params = new URLSearchParams()
    if (searchSkill) params.set('search', searchSkill)
    if (searchLocation) params.set('location', searchLocation)
    window.location.href = `/find-jobs?${params.toString()}`
  }

  const placeholderJobs = [
    { id: 'p1', title: 'Senior React Developer', corporate: { companyName: 'Google' }, location: 'Bangalore', salaryMin: 200000, salaryMax: 400000, jobType: 'Full Time', isRemote: true, postedDate: new Date().toISOString() },
    { id: 'p2', title: 'Data Scientist', corporate: { companyName: 'Amazon' }, location: 'Hyderabad', salaryMin: 180000, salaryMax: 350000, jobType: 'Full Time', isRemote: false, postedDate: new Date().toISOString() },
    { id: 'p3', title: 'Product Manager', corporate: { companyName: 'Flipkart' }, location: 'Bangalore', salaryMin: 250000, salaryMax: 500000, jobType: 'Full Time', isRemote: false, postedDate: new Date().toISOString() },
    { id: 'p4', title: 'DevOps Engineer', corporate: { companyName: 'TCS' }, location: 'Mumbai', salaryMin: 150000, salaryMax: 300000, jobType: 'Full Time', isRemote: true, postedDate: new Date().toISOString() },
    { id: 'p5', title: 'ML Engineer', corporate: { companyName: 'Infosys' }, location: 'Pune', salaryMin: 200000, salaryMax: 380000, jobType: 'Full Time', isRemote: false, postedDate: new Date().toISOString() },
    { id: 'p6', title: 'UI/UX Designer', corporate: { companyName: 'Wipro' }, location: 'Chennai', salaryMin: 120000, salaryMax: 250000, jobType: 'Full Time', isRemote: false, postedDate: new Date().toISOString() },
    { id: 'p7', title: 'Backend Developer', corporate: { companyName: 'Microsoft' }, location: 'Noida', salaryMin: 220000, salaryMax: 450000, jobType: 'Full Time', isRemote: true, postedDate: new Date().toISOString() },
    { id: 'p8', title: 'Financial Analyst', corporate: { companyName: 'HDFC Bank' }, location: 'Mumbai', salaryMin: 100000, salaryMax: 200000, jobType: 'Full Time', isRemote: false, postedDate: new Date().toISOString() },
  ]

  const displayJobs = jobs.length > 0 ? jobs : placeholderJobs

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== 1. HERO — NAUKRI/INDEED STYLE ===== */}
      <section className="relative bg-gradient-to-br from-[#1f8f15] via-[#2d7a28] to-[#1f8f15] overflow-hidden">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-14 sm:pb-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text + Search */}
            <div>
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5"
              >
                <Sparkles className="h-4 w-4 text-[#7dd87d]" />
                <span className="text-sm text-white font-medium">India&apos;s #1 AI-Powered Job Portal</span>
              </motion.div>

              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4"
              >
                Find Your <span className="text-[#7dd87d]">Dream Job</span> with AI Precision
              </motion.h1>

              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-white/80 max-w-xl mb-8 leading-relaxed"
              >
                Smart resumes, AI mock interviews, skill auto-updates & intelligent job matching — your complete career platform
              </motion.p>

              {/* Search Bar — Naukri/Indeed style */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
                <div className="bg-white rounded-xl shadow-2xl p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input placeholder="Skills, Designations, Companies" value={searchSkill}
                        onChange={(e) => setSearchSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-lg" />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input placeholder="Location (City, State)" value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-lg" />
                    </div>
                    <Button className="h-12 px-8 bg-[#1f8f15] hover:bg-[#2d7a28] text-white font-semibold text-base rounded-lg whitespace-nowrap shadow-md"
                      onClick={handleSearch}>
                      <Search className="h-5 w-5 mr-2" /> Search
                    </Button>
                  </div>
                </div>

                {/* Trending searches */}
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-white/60 font-medium">Trending:</span>
                  {trendingSearches.map(tag => (
                    <button key={tag} className="px-3 py-1 text-xs bg-white/15 text-white/90 rounded-full hover:bg-white/25 transition-colors"
                      onClick={() => { setSearchSkill(tag); setTimeout(() => handleSearch(), 100) }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Stats row */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-6 sm:gap-10"
              >
                {[
                  { label: 'Active Jobs', value: '10,000+', icon: Briefcase },
                  { label: 'Companies', value: '5,000+', icon: Building2 },
                  { label: 'Candidates', value: '50,000+', icon: Users },
                  { label: 'AI Interviews', value: '1,000+', icon: Brain },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                      <stat.icon className="h-4 w-4 text-[#7dd87d]" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-white leading-tight">{stat.value}</div>
                      <div className="text-[11px] text-white/60">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Hero Image */}
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-[#49A842]/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#f9ab00]/10 rounded-full blur-3xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=face"
                    alt="HR Professional" width={600} height={750}
                    className="object-cover w-full h-[480px]" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f8f15]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1f8f15] flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">AI-Verified Candidates</p>
                          <p className="text-xs text-gray-500">Skills auto-verified through training & assessments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 -right-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#f9ab00]/15 flex items-center justify-center"><Trophy className="h-4 w-4 text-[#f9ab00]" /></div>
                    <div><p className="text-base font-extrabold text-gray-900">94%</p><p className="text-[9px] text-gray-500">Placement Rate</p></div>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-3 -left-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#1f8f15]/15 flex items-center justify-center"><Brain className="h-4 w-4 text-[#1f8f15]" /></div>
                    <div><p className="text-xs font-bold text-gray-900">AI Mock Interviews</p><p className="text-[9px] text-gray-500">Real-time feedback</p></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 2. TOP COMPANIES HIRING — WHITE ===== */}
      <section className="py-12 sm:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Companies <span className="text-[#1f8f15]">Hiring Now</span></h2>
              <p className="text-sm text-gray-500 mt-1">Explore opportunities at India&apos;s leading organizations</p>
            </div>
            <Link href="/find-jobs" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1f8f15] hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {topCompanies.map((company, i) => (
              <motion.div key={company.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              >
                <Card className="border border-gray-200 hover:border-[#49A842]/40 hover:shadow-md transition-all cursor-pointer group bg-white hover:-translate-y-0.5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-lg ${getCompanyColor(company.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform flex-shrink-0`}>
                      {company.logo}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{company.name}</p>
                      <p className="text-xs text-[#49A842] font-medium">{company.openings} jobs</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="sm:hidden text-center mt-5">
            <Link href="/find-jobs" className="text-sm font-semibold text-[#1f8f15] hover:underline">
              View All Companies <ArrowRight className="h-4 w-4 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 3. JOB CATEGORIES — LIGHT GREEN ===== */}
      <section className="py-12 sm:py-16 bg-[#e8f5e9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="bg-[#1f8f15]/15 text-[#1f8f15] border-0 rounded-full px-3 py-1 text-xs font-semibold mb-2">Explore Opportunities</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Browse Jobs by <span className="text-[#1f8f15]">Category</span></h2>
              <p className="text-sm text-gray-600 mt-1">Find the perfect role in your field</p>
            </div>
            <Link href="/find-jobs" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1f8f15] hover:underline">
              All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {jobCategoriesConfig.map((cat, i) => (
              <motion.div key={cat.label} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }} viewport={{ once: true }}
              >
                <Link href={`/find-jobs?search=${cat.keywords[0]}`}>
                  <Card className="border border-[#49A842]/20 bg-white hover:shadow-md hover:border-[#49A842]/40 transition-all cursor-pointer group h-full hover:-translate-y-0.5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-lg ${cat.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform flex-shrink-0`}>
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">{cat.label}</h3>
                        <p className="text-xs text-[#49A842] font-medium">{cat.count} jobs</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. FEATURED JOBS — WHITE ===== */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="bg-[#1f8f15]/15 text-[#1f8f15] border-0 rounded-full px-3 py-1 text-xs font-semibold mb-2">Hand-Picked Opportunities</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured <span className="text-[#1f8f15]">Jobs</span></h2>
              <p className="text-sm text-gray-600 mt-1">AI-matched opportunities for you</p>
            </div>
            <Link href="/find-jobs">
              <Button className="hidden sm:flex bg-[#1f8f15] hover:bg-[#2d7a28] text-white font-semibold text-sm rounded-lg h-10 px-5">
                View All Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse border border-gray-200">
                  <CardContent className="p-0">
                    <div className="h-[100px] bg-gray-200 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayJobs.map((job: any, i: number) => (
                <motion.div key={job.id || i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                >
                  <Card className="hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-gray-200 bg-white hover:shadow-lg hover:border-[#49A842]/30 overflow-hidden"
                    onClick={() => { window.location.href = '/find-jobs' }}>
                    <CardContent className="p-0">
                      <div className={`relative h-[100px] ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center`}>
                        <span className="text-4xl font-bold text-white/30 select-none">
                          {getCompanyInitial(job.corporate?.companyName)}
                        </span>
                        {job.isRemote && (
                          <label className="absolute top-3 left-3 bg-[#f9ab00] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">Remote</label>
                        )}
                        {i < 3 && !job.isRemote && (
                          <label className="absolute top-3 left-3 bg-[#d93025] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">Urgent</label>
                        )}
                        <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
                          <Bookmark className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-7 h-7 rounded ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 shadow-sm`}>
                            {getCompanyInitial(job.corporate?.companyName)}
                          </div>
                          <span className="text-xs text-gray-500 truncate font-medium">{job.corporate?.companyName || 'Company'}</span>
                          <Badge className="bg-[#1f8f15]/10 text-[#1f8f15] border-0 text-[10px] rounded-md px-2 py-0.5 font-medium capitalize flex-shrink-0 ml-auto">
                            {job.jobType || 'Full Time'}
                          </Badge>
                        </div>
                        <h5 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#1f8f15] transition-colors line-clamp-2 mb-2">
                          {job.title}
                        </h5>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                          <span className="font-semibold text-[#1f8f15] text-sm">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          <Shield className="h-3.5 w-3.5 text-[#49A842]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-6 sm:hidden">
            <Link href="/find-jobs">
              <Button className="bg-[#1f8f15] hover:bg-[#2d7a28] text-white font-semibold px-8 h-10 rounded-lg">
                Browse All Jobs <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 5. HOW IT WORKS — GREEN ===== */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-[#1f8f15] via-[#2d7a28] to-[#1f8f15] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-white/15 text-[#7dd87d] border-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-2">Simple & Powerful</Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-white">How <span className="text-[#7dd87d]">3BOXESJOBS</span> Works</h2>
            <p className="text-white/60 mt-2 text-sm max-w-2xl mx-auto">Four simple steps to transform your job search into an AI-powered journey</p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-[40px] left-[15%] right-[15%] z-0">
              <div className="w-full border-t-2 border-dashed border-white/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {howItWorksSteps.map((step, i) => (
                <motion.div key={step.step} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.12 }} viewport={{ once: true }} className="relative"
                >
                  <Card className="border border-white/10 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all h-full text-center group hover:-translate-y-1">
                    <CardContent className="p-5">
                      <div className="flex justify-center mb-3">
                        <div className={`w-[60px] h-[60px] rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-extrabold text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                          {step.step}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                        <step.icon className="h-5 w-5 text-[#7dd87d]" />
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1.5">{step.title}</h4>
                      <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                  {i < 3 && (
                    <div className="hidden lg:flex absolute top-[40px] -right-4 z-20">
                      <div className="w-6 h-6 rounded-full bg-[#1f8f15] shadow-md flex items-center justify-center border border-white/20">
                        <ArrowRight className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. AI FEATURES — WHITE ===== */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-[#1f8f15]/15 text-[#1f8f15] border-0 rounded-full px-3 py-1 text-xs font-semibold mb-2">AI-Powered Platform</Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Powered by <span className="text-[#1f8f15]">AI</span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Not just a job board — an intelligent career platform with AI tools designed for every user</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Resume Builder */}
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} viewport={{ once: true }}>
              <Card className="border border-gray-200 bg-white hover:shadow-xl transition-all h-full overflow-hidden group hover:-translate-y-1">
                <div className="relative h-[180px] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop"
                    alt="Resume Building" width={400} height={250}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1f8f15]/90 flex items-center justify-center mb-2"><FileText className="h-5 w-5 text-white" /></div>
                    <h3 className="text-lg font-bold text-white">AI Resume Builder</h3>
                    <p className="text-white/80 text-xs">Craft ATS-optimized resumes with AI</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    Auto-generate polished resumes with AI. Skills update automatically when you complete training courses. Stand out to every recruiter.
                  </p>
                  <Link href="/ai-features">
                    <Button className="w-full bg-[#1f8f15] hover:bg-[#2d7a28] text-white font-semibold rounded-lg h-10 text-sm">
                      Try Resume Builder <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Mock Interviews */}
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
              <Card className="border border-gray-200 bg-white hover:shadow-xl transition-all h-full overflow-hidden group hover:-translate-y-1">
                <div className="relative h-[180px] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=250&fit=crop"
                    alt="AI Interview Practice" width={400} height={250}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1f8f15]/90 flex items-center justify-center mb-2"><Brain className="h-5 w-5 text-white" /></div>
                    <h3 className="text-lg font-bold text-white">AI Mock Interviews</h3>
                    <p className="text-white/80 text-xs">Practice with real-time AI feedback</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    Practice interviews with AI and get instant feedback on communication, technical depth, and confidence. Be interview-ready every time.
                  </p>
                  <Link href="/ai-features">
                    <Button className="w-full bg-[#1f8f15] hover:bg-[#2d7a28] text-white font-semibold rounded-lg h-10 text-sm">
                      Start Practicing <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Smart Job Matching */}
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
              <Card className="border border-gray-200 bg-white hover:shadow-xl transition-all h-full overflow-hidden group hover:-translate-y-1">
                <div className="relative h-[180px] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop"
                    alt="Smart Job Matching" width={400} height={250}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-10 h-10 rounded-lg bg-[#1f8f15]/90 flex items-center justify-center mb-2"><Target className="h-5 w-5 text-white" /></div>
                    <h3 className="text-lg font-bold text-white">Smart Job Matching</h3>
                    <p className="text-white/80 text-xs">AI matches you to the perfect role</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    AI calculates your match score with every job based on skills, experience, and career preferences. No more endless scrolling.
                  </p>
                  <Link href="/find-jobs">
                    <Button className="w-full bg-[#1f8f15] hover:bg-[#2d7a28] text-white font-semibold rounded-lg h-10 text-sm">
                      Find Your Match <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 7. TESTIMONIALS — LIGHT GREEN ===== */}
      <section className="py-12 sm:py-16 bg-[#e8f5e9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-[#f9ab00]/15 text-[#f9ab00] border-0 rounded-full px-3 py-1 text-xs font-semibold mb-2">What People Say</Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What Our <span className="text-[#1f8f15]">Users</span> Say</h2>
            <p className="text-gray-600 mt-2 text-sm max-w-lg mx-auto">Real stories from job seekers and employers who transformed their careers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="border border-[#49A842]/20 bg-white hover:shadow-lg transition-all h-full hover:border-t-4 hover:border-t-[#f9ab00] group hover:-translate-y-1">
                  <CardContent className="p-5 relative">
                    <div className="absolute top-3 right-4 select-none" aria-hidden="true">
                      <span className="text-5xl font-serif leading-none text-[#1f8f15] opacity-10">&ldquo;</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-[#f9ab00] text-[#f9ab00]" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 relative z-10">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1f8f15] via-[#49A842] to-[#f9ab00] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. CTA SECTION — GREEN ===== */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-[#1f8f15] via-[#2d7a28] to-[#1f8f15] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-[#0d5a0a] via-[#1f8f15] to-[#0d5a0a] rounded-2xl overflow-hidden relative border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: CTA Text */}
                <div className="p-8 sm:p-12 relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                    <Rocket className="h-4 w-4 text-[#7dd87d]" />
                    <span className="text-sm text-white font-medium">Start Your Journey Today</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
                    Ready to Start Your <br className="hidden sm:block" />Career Journey?
                  </h2>
                  <p className="text-white/80 text-base max-w-xl mb-6">
                    Join 50,000+ job seekers and 5,000+ companies already using 3BOXESJOBS. AI-powered resumes, smart matching, mock interviews, and skill auto-updates — all in one platform.
                  </p>
                  <div className="flex flex-wrap justify-start gap-3">
                    <Link href="/register">
                      <Button className="bg-white text-[#1f8f15] hover:bg-gray-100 font-bold px-7 h-11 text-sm rounded-lg shadow-lg">
                        <UserCheck className="h-4 w-4 mr-2" /> Register Free
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button className="bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-bold px-7 h-11 text-sm rounded-lg shadow-lg">
                        <Briefcase className="h-4 w-4 mr-2" /> Login
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-white/40 mt-3">Free to join. No credit card required.</p>
                </div>

                {/* Right: HR Image */}
                <div className="relative hidden lg:block">
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0d5a0a] z-10" />
                  <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&h=600&fit=crop"
                    alt="Business Team" width={700} height={600}
                    className="object-cover w-full h-full min-h-[350px]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
