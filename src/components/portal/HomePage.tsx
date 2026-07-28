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
} from 'lucide-react'

// Dark green color palette
const DG = {
  900: '#013b0b',
  800: '#024217',
  700: '#044d1a',
  600: '#03591e',
  500: '#046622',
  400: '#057326',
  300: '#0a8a30',
  200: '#22c55e',
  100: '#3a9a3a',
}

// Job categories config - dark green themed for dark sections
const jobCategoriesConfig = [
  { icon: Code, label: 'IT & Software', keywords: ['React', 'Node', 'Python', 'TypeScript', 'AWS', 'Docker'], color: 'bg-[#044d1a] text-[#86efac] border-[#0a8a30]' },
  { icon: IndianRupee, label: 'Banking & Finance', keywords: ['CA', 'CFA', 'Accounting', 'Banking', 'Investment'], color: 'bg-[#044d1a] text-amber-300 border-[#0a8a30]' },
  { icon: Heart, label: 'Healthcare', keywords: ['Doctor', 'Nurse', 'Pharma', 'Medical', 'Clinical'], color: 'bg-[#044d1a] text-red-300 border-[#0a8a30]' },
  { icon: PenTool, label: 'Marketing', keywords: ['SEO', 'Content', 'Social Media', 'Brand', 'Growth'], color: 'bg-[#044d1a] text-purple-300 border-[#0a8a30]' },
  { icon: GraduationCap, label: 'Education', keywords: ['Teacher', 'Professor', 'Trainer', 'Curriculum'], color: 'bg-[#044d1a] text-blue-300 border-[#0a8a30]' },
  { icon: TrendingUp, label: 'Sales', keywords: ['B2B', 'B2C', 'Enterprise', 'SaaS', 'Revenue'], color: 'bg-[#044d1a] text-orange-300 border-[#0a8a30]' },
  { icon: Building2, label: 'Engineering', keywords: ['Civil', 'Mechanical', 'Electrical', 'Project Mgmt'], color: 'bg-[#044d1a] text-teal-300 border-[#0a8a30]' },
  { icon: Cpu, label: 'Data Science', keywords: ['ML', 'AI', 'Analytics', 'Python', 'Statistics'], color: 'bg-[#044d1a] text-indigo-300 border-[#0a8a30]' },
]

// Company colors
const companyColors = [
  'bg-[#024217]', 'bg-[#34a853]', 'bg-[#f9ab00]', 'bg-[#d93025]',
  'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
]

const topCompanies = [
  { name: 'TCS', logo: 'TCS' },
  { name: 'Infosys', logo: 'INFY' },
  { name: 'Wipro', logo: 'WIP' },
  { name: 'HCL Tech', logo: 'HCL' },
  { name: 'Amazon', logo: 'AMZ' },
  { name: 'Google', logo: 'GOO' },
  { name: 'Microsoft', logo: 'MSF' },
  { name: 'Flipkart', logo: 'FLP' },
  { name: 'Reliance', logo: 'REL' },
  { name: 'HDFC Bank', logo: 'HDF' },
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

// Testimonials data
const testimonials = [
  { name: 'Priya M.', role: 'Software Engineer at Google', text: 'The AI mock interviews helped me land my dream job at a top tech company. The feedback was incredibly detailed and actionable!', rating: 5, avatar: 'PM' },
  { name: 'Rahul K.', role: 'Data Scientist at Amazon', text: 'Skill auto-update is a game changer. Every course I complete automatically enhances my resume and profile. No more manual updates!', rating: 5, avatar: 'RK' },
  { name: 'Sneha R.', role: 'HR Director at TCS', text: 'As a corporate user, the AI matching saves us hours. We find better candidates faster than any other platform we\'ve tried.', rating: 5, avatar: 'SR' },
  { name: 'Amit P.', role: 'Product Manager at Flipkart', text: 'The smart job matching is spot-on. I got matched with roles that perfectly aligned with my skills and career aspirations.', rating: 5, avatar: 'AP' },
]

// How it works steps
const howItWorksSteps = [
  { step: '01', icon: FileText, title: 'Create Your Profile', desc: 'Sign up and build your AI-powered resume. Our smart builder auto-suggests skills, formats, and keywords that recruiters search for most.', color: 'from-[#024217] to-[#044d1a]' },
  { step: '02', icon: Brain, title: 'AI Matches You to Jobs', desc: 'Our intelligent engine analyzes your skills, experience, and preferences to surface the most relevant opportunities — no endless scrolling needed.', color: 'from-[#044d1a] to-[#024217]' },
  { step: '03', icon: Target, title: 'Practice with AI Interviews', desc: 'Prepare with realistic AI mock interviews. Get instant feedback on communication, technical depth, and confidence before your real interview.', color: 'from-[#03591e] to-[#044d1a]' },
  { step: '04', icon: Trophy, title: 'Get Hired Faster', desc: 'With AI-enhanced resumes, verified skills, and interview readiness, you stand out to employers and land your dream job significantly faster.', color: 'from-[#044d1a] to-[#024217]' },
]

// Career journey steps
const careerJourneySteps = [
  { icon: BookOpen, title: 'Learn & Upskill', desc: 'Industry-aligned courses that auto-update your profile with verified skills and certifications', color: 'bg-[#024217]' },
  { icon: FileText, title: 'Build Smart Resume', desc: 'AI-powered resume builder that optimizes for ATS systems and highlights your strongest qualifications', color: 'bg-[#044d1a]' },
  { icon: Brain, title: 'Practice Interviews', desc: 'AI mock interviews with real-time feedback on communication, technical skills, and confidence levels', color: 'bg-[#03591e]' },
  { icon: Target, title: 'Get Matched', desc: 'Intelligent job matching based on your complete profile — skills, experience, and career preferences', color: 'bg-[#046622]' },
  { icon: Trophy, title: 'Land Your Dream Job', desc: 'Stand out with AI-verified skills, polished resumes, and interview-ready confidence to get hired faster', color: 'bg-[#024217]' },
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
    <div className="min-h-screen">
      {/* ===== 1. HERO SECTION — SPLIT LAYOUT WITH HR IMAGE (DARK GREEN) ===== */}
      <section className="relative bg-gradient-to-br from-[#024217] via-[#044d1a] to-[#024217] pb-20 sm:pb-28 pt-12 sm:pt-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-[#3a9a3a]/10 blur-sm" />
          <motion.div animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-32 right-[15%] w-16 h-16 rounded-2xl bg-[#3a9a3a]/10 rotate-45 blur-sm" />
          <motion.div animate={{ y: [0, -12, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-40 left-[20%] w-24 h-24 rounded-full bg-[#3a9a3a]/8 blur-md" />
          <motion.div animate={{ y: [0, 18, 0], rotate: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-60 right-[8%] w-14 h-14 rounded-xl bg-[#3a9a3a]/10 rotate-12 blur-sm" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text + Search */}
            <div>
              <div className="mb-8">
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6"
                >
                  <Sparkles className="h-4 w-4 text-[#3a9a3a]" />
                  <span className="text-sm text-[#d8ecd8] font-medium">India&apos;s #1 AI-Powered Job Portal</span>
                </motion.div>
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                  className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold text-white leading-tight"
                >
                  Find Your Dream Job with{' '}
                  <span className="relative inline-block">
                    <span className="text-[#3a9a3a]">AI-Powered</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 120 8" fill="none"><path d="M2 6C20 2 50 2 60 4C70 6 100 3 118 2" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/></svg>
                  </span>{' '}
                  Precision
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="mt-5 text-base sm:text-lg text-[#d8ecd8]/80 max-w-xl leading-relaxed"
                >
                  Smart resumes, AI mock interviews, skill auto-updates & intelligent job matching — your complete career platform
                </motion.p>
              </div>

              {/* Search Bar */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
                <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input placeholder="Skills, Designations, Companies" value={searchSkill}
                        onChange={(e) => setSearchSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-xl" />
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input placeholder="Location (City, State)" value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-xl" />
                    </div>
                    <div className="sm:w-36 relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input placeholder="Experience" value={searchExp}
                        onChange={(e) => setSearchExp(e.target.value)}
                        className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-xl" />
                    </div>
                    <Button className="h-12 px-8 bg-[#024217] hover:bg-[#044d1a] text-white font-semibold text-base rounded-xl whitespace-nowrap shadow-md"
                      onClick={handleSearch}>
                      <Search className="h-5 w-5 mr-2" /> Search
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                  {['React', 'Python', 'AWS', 'Data Science', 'DevOps', 'Product Manager', 'ML Engineer', 'Full Stack'].map(tag => (
                    <button key={tag} className="px-3 py-1.5 text-sm bg-white/15 text-white/90 rounded-full hover:bg-white/25 transition-colors border border-white/10"
                      onClick={() => { setSearchSkill(tag); setTimeout(() => handleSearch(), 100) }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 sm:gap-6"
              >
                {[
                  { label: 'Active Jobs', value: '10,000+', icon: Briefcase },
                  { label: 'Companies', value: '5,000+', icon: Building2 },
                  { label: 'Candidates', value: '50,000+', icon: Users },
                  { label: 'AI Interviews', value: '1,000+', icon: Brain },
                ].map(stat => (
                  <motion.div key={stat.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-center flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 min-w-[120px]"
                  >
                    <stat.icon className="h-5 w-5 text-[#3a9a3a] mb-1.5" />
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-[#b0d9b5]/80 mt-0.5">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right: HR Professional Image */}
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-[#3a9a3a]/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#f9ab00]/10 rounded-full blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">
                  <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=face"
                    alt="HR Professional" width={600} height={750}
                    className="object-cover w-full h-[500px] lg:h-[550px]" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#024217]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#024217] flex items-center justify-center flex-shrink-0">
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
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f9ab00]/15 flex items-center justify-center"><Trophy className="h-5 w-5 text-[#f9ab00]" /></div>
                    <div><p className="text-lg font-extrabold text-gray-900">94%</p><p className="text-[10px] text-gray-500">Placement Rate</p></div>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#024217]/15 flex items-center justify-center"><Brain className="h-5 w-5 text-[#024217]" /></div>
                    <div><p className="text-sm font-bold text-gray-900">AI Mock Interviews</p><p className="text-[10px] text-gray-500">Real-time feedback</p></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 2. TOP COMPANIES — WHITE ===== */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-10 right-0 w-72 h-72 bg-[#024217]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-[#3a9a3a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-[#024217]/10 text-[#024217] border-[#024217]/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">Trusted By Top Employers</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Top Companies <span className="text-[#024217]">Hiring</span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">From startups to Fortune 500s — top companies trust 3BOXESJOBS for AI-powered hiring</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-5">
                {topCompanies.map((company, i) => (
                  <motion.div key={company.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} viewport={{ once: true }} className="flex-shrink-0"
                  >
                    <Card className="border border-gray-200 hover:border-[#024217]/40 hover:shadow-lg hover:shadow-[#024217]/10 transition-all cursor-pointer group min-w-[160px] bg-white">
                      <CardContent className="p-5 flex flex-col items-center gap-3">
                        <div className={`w-14 h-14 rounded-xl ${getCompanyColor(company.name)} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform`}>
                          {company.logo}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{company.name}</span>
                        <Link href="/find-jobs" className="text-xs text-[#024217] font-semibold hover:underline flex items-center gap-1">
                          View Jobs <ArrowRight className="h-3 w-3" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. JOB CATEGORIES — DARK GREEN ===== */}
      <section className="py-16 sm:py-20 bg-[#024217] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #86efac 1px, transparent 0)', backgroundSize: '32px 32px'}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-white/10 text-[#86efac] border-white/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">Explore Opportunities</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Browse Jobs by <span className="text-[#3a9a3a]">Category</span></h2>
            <p className="text-[#d8ecd8]/60 mt-2 text-sm max-w-lg mx-auto">Find the perfect role in your field — from tech to finance, healthcare to marketing</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {jobCategoriesConfig.map((cat, i) => (
              <motion.div key={cat.label} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              >
                <Link href={`/find-jobs?search=${cat.keywords[0]}`}>
                  <Card className={`border ${cat.color} hover:shadow-lg hover:shadow-[#3a9a3a]/10 transition-all cursor-pointer group h-full hover:scale-[1.02]`}>
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 rounded-xl bg-[#024217]/60 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                        <cat.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-sm mb-2">{cat.label}</h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {cat.keywords.slice(0, 3).map(kw => (
                          <span key={kw} className="text-[10px] bg-[#024217]/60 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/find-jobs">
              <Button className="bg-white/10 text-[#86efac] hover:bg-white/20 font-semibold px-6 h-11 rounded-xl border border-white/20">
                View All Categories <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 4. HOW IT WORKS — WHITE ===== */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#024217]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3a9a3a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge className="bg-[#024217]/10 text-[#024217] border-[#024217]/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">Simple & Powerful</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How <span className="text-[#024217]">3BOXESJOBS</span> Works</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
              In just four simple steps, transform your job search into an AI-powered journey that delivers real results faster
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] z-0">
              <div className="w-full border-t-2 border-dashed border-[#024217]/15" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {howItWorksSteps.map((step, i) => (
                <motion.div key={step.step} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="relative"
                >
                  <Card className="border border-gray-200 bg-white hover:shadow-xl hover:shadow-[#024217]/10 transition-all h-full text-center group hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className={`w-[72px] h-[72px] rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-extrabold text-2xl shadow-lg group-hover:scale-110 transition-transform ring-4 ring-[#024217]/10`}>
                          {step.step}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#024217]/10 flex items-center justify-center mx-auto mb-3">
                        <step.icon className="h-6 w-6 text-[#024217]" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                  {i < 3 && (
                    <div className="hidden lg:flex absolute top-[52px] -right-5 z-20">
                      <div className="w-8 h-8 rounded-full bg-[#024217] shadow-md flex items-center justify-center border border-[#3a9a3a]/30">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. AI FEATURES SHOWCASE WITH IMAGES — DARK GREEN ===== */}
      <section className="py-16 sm:py-20 bg-[#024217] relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#044d1a]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-[#03591e]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="bg-white/10 text-[#86efac] border-white/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">AI-Powered Platform</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Powered by <span className="text-[#3a9a3a]">AI</span></h2>
            <p className="text-[#d8ecd8]/60 mt-2 text-sm max-w-lg mx-auto">Not just a job board — an intelligent career platform with AI tools designed for every user</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI Resume Builder */}
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} viewport={{ once: true }}>
              <Card className="border border-white/10 bg-[#044d1a]/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-[#3a9a3a]/10 transition-all h-full overflow-hidden group hover:-translate-y-2">
                <div className="relative h-[200px] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop"
                    alt="Resume Building" width={400} height={250}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#024217] via-[#024217]/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2"><FileText className="h-6 w-6 text-white" /></div>
                    <h3 className="text-xl font-bold text-white">AI Resume Builder</h3>
                    <p className="text-[#d8ecd8]/80 text-sm">Craft ATS-optimized resumes with AI</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-[#d8ecd8]/70 leading-relaxed mb-5">
                    Auto-generate polished resumes with AI. Skills update automatically when you complete training courses. Stand out to every recruiter.
                  </p>
                  <Link href="/ai-features">
                    <Button className="w-full bg-[#024217] hover:bg-[#044d1a] text-white font-semibold rounded-xl h-11 border border-[#3a9a3a]/30">
                      Try Resume Builder <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Mock Interviews */}
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} viewport={{ once: true }}>
              <Card className="border border-white/10 bg-[#044d1a]/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-[#3a9a3a]/10 transition-all h-full overflow-hidden group hover:-translate-y-2">
                <div className="relative h-[200px] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=250&fit=crop"
                    alt="AI Interview Practice" width={400} height={250}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03591e] via-[#03591e]/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2"><Brain className="h-6 w-6 text-white" /></div>
                    <h3 className="text-xl font-bold text-white">AI Mock Interviews</h3>
                    <p className="text-[#d8ecd8]/80 text-sm">Practice with real-time AI feedback</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-[#d8ecd8]/70 leading-relaxed mb-5">
                    Practice interviews with AI and get instant feedback on communication, technical depth, and confidence. Be interview-ready every time.
                  </p>
                  <Link href="/ai-features">
                    <Button className="w-full bg-[#03591e] hover:bg-[#044d1a] text-white font-semibold rounded-xl h-11 border border-[#3a9a3a]/30">
                      Start Practicing <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Smart Job Matching */}
            <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
              <Card className="border border-white/10 bg-[#044d1a]/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-[#3a9a3a]/10 transition-all h-full overflow-hidden group hover:-translate-y-2">
                <div className="relative h-[200px] overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop"
                    alt="Smart Job Matching" width={400} height={250}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#046622] via-[#046622]/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2"><Target className="h-6 w-6 text-white" /></div>
                    <h3 className="text-xl font-bold text-white">Smart Job Matching</h3>
                    <p className="text-[#d8ecd8]/80 text-sm">AI matches you to the perfect role</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-[#d8ecd8]/70 leading-relaxed mb-5">
                    AI calculates your match score with every job based on skills, experience, and career preferences. No more endless scrolling.
                  </p>
                  <Link href="/find-jobs">
                    <Button className="w-full bg-[#046622] hover:bg-[#03591e] text-white font-semibold rounded-xl h-11 border border-[#3a9a3a]/30">
                      Find Your Match <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 6. CAREER JOURNEY — WHITE ===== */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-[#024217]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-[#3a9a3a]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge className="bg-[#f9ab00]/10 text-[#f9ab00] border-[#f9ab00]/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">Your Complete Career Path</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Your Career <span className="text-[#024217]">Journey</span></h2>
            <p className="text-gray-500 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
              Every step is interconnected — training updates skills, skills enhance your resume, your resume drives job matches, and interviews seal the deal
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
            {careerJourneySteps.map((step, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="flex items-center"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center text-white shadow-lg ring-4 ring-[#024217]/10 group-hover:scale-110 transition-transform`}>
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#024217] shadow-md flex items-center justify-center border border-[#3a9a3a]/30">
                      <span className="text-[10px] font-bold text-white">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-500 max-w-[140px] leading-relaxed">{step.desc}</p>
                </div>
                {i < careerJourneySteps.length - 1 && (
                  <div className="hidden lg:flex items-center mx-3 flex-shrink-0">
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-[#024217]/20" />
                      <ArrowRight className="h-4 w-4 text-[#024217]/30" />
                    </div>
                  </div>
                )}
                {i < careerJourneySteps.length - 1 && (
                  <div className="lg:hidden flex flex-col items-center my-1">
                    <div className="w-0.5 h-4 bg-[#024217]/20" />
                    <ArrowRight className="h-4 w-4 text-[#024217]/30 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. FEATURED JOBS — DARK GREEN ===== */}
      <section className="py-16 sm:py-20 bg-[#024217] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#044d1a]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#03591e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-8">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              <Badge className="bg-white/10 text-[#86efac] border-white/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">Hand-Picked Opportunities</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured <span className="text-[#3a9a3a]">Jobs</span></h2>
              <p className="text-[#d8ecd8]/60 text-sm mt-1">AI-matched opportunities for you</p>
            </motion.div>
            <Link href="/find-jobs">
              <Button className="bg-white/10 text-[#86efac] hover:bg-white/20 font-semibold text-sm rounded-xl border border-white/20 hidden sm:flex">
                View All Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse border border-white/10 bg-[#044d1a]/40">
                  <CardContent className="p-0">
                    <div className="h-[120px] bg-[#044d1a]/60 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-[#044d1a]/60 rounded w-3/4" />
                      <div className="h-3 bg-[#044d1a]/60 rounded w-1/2" />
                      <div className="h-3 bg-[#044d1a]/60 rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayJobs.map((job: any, i: number) => (
                <motion.div key={job.id || i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                >
                  <Card className="hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-white/10 bg-[#044d1a]/40 backdrop-blur-sm hover:shadow-xl hover:shadow-[#3a9a3a]/10 overflow-hidden hover:border-l-4 hover:border-l-[#3a9a3a]"
                    onClick={() => { window.location.href = '/find-jobs' }}>
                    <CardContent className="p-0">
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
                            <span className="text-xs text-[#d8ecd8]/60 truncate font-medium">{job.corporate?.companyName || 'Company'}</span>
                          </div>
                          <Badge className="bg-[#024217]/60 text-[#d8ecd8]/60 border-0 text-[10px] rounded-md px-2 py-0.5 font-medium capitalize flex-shrink-0">
                            {job.jobType || 'Full Time'}
                          </Badge>
                        </div>
                        <h5 className="font-semibold text-white text-sm leading-snug group-hover:text-[#86efac] transition-colors line-clamp-2 mb-2">
                          {job.title}
                        </h5>
                        <div className="flex items-center gap-3 text-[11px] text-[#d8ecd8]/50 mb-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#3a9a3a]" /> {job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-[#3a9a3a]" /> {job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                          <span className="font-semibold text-[#86efac] text-sm">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          <Shield className="h-4 w-4 text-[#3a9a3a]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/find-jobs">
              <Button className="bg-[#3a9a3a] hover:bg-[#0a8a30] text-white font-semibold px-8 h-11 rounded-xl shadow-md">
                Browse All Jobs <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 8. TESTIMONIALS — WHITE ===== */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#024217]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#3a9a3a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="bg-[#f9ab00]/10 text-[#f9ab00] border-[#f9ab00]/20 rounded-full px-4 py-1 text-xs font-semibold mb-3">What People Say</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What Our <span className="text-[#024217]">Users</span> Say</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-lg mx-auto">Real stories from job seekers and employers who transformed their careers with 3BOXESJOBS</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="border border-gray-200 bg-white hover:shadow-lg hover:shadow-[#024217]/10 transition-all h-full hover:border-t-4 hover:border-t-[#f9ab00] group hover:-translate-y-1">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-3 right-4 select-none" aria-hidden="true">
                      <span className="text-6xl font-serif leading-none text-[#024217] opacity-10">&ldquo;</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-[#f9ab00] text-[#f9ab00]" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5 relative z-10">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#024217] via-[#3a9a3a] to-[#f9ab00] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-[#024217]/10">
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

      {/* ===== 9. CTA SECTION — DARK GREEN WITH HR IMAGE ===== */}
      <section className="py-16 sm:py-20 bg-[#024217] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-[#013b0b] via-[#044d1a] to-[#013b0b] rounded-3xl overflow-hidden relative border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left: CTA Text */}
                <div className="p-10 sm:p-14 relative z-10">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    <motion.div animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-10 right-10 w-12 h-12 rounded-full border-2 border-white/10" />
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  </div>
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5">
                      <Rocket className="h-4 w-4 text-[#3a9a3a]" />
                      <span className="text-sm text-[#d8ecd8] font-medium">Start Your Journey Today</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                      Ready to Start Your <br className="hidden sm:block" />Career Journey?
                    </h2>
                    <p className="text-[#d8ecd8]/80 text-base max-w-xl mb-8">
                      Join 50,000+ job seekers and 5,000+ companies already using 3BOXESJOBS. AI-powered resumes, smart matching, mock interviews, and skill auto-updates — all in one platform.
                    </p>
                    <div className="flex flex-wrap justify-start gap-4">
                      <Link href="/register">
                        <Button className="bg-white text-[#024217] hover:bg-gray-100 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                          <UserCheck className="h-5 w-5 mr-2" /> Register Free
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button className="bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                          <Briefcase className="h-5 w-5 mr-2" /> Login
                        </Button>
                      </Link>
                    </div>
                    <p className="text-xs text-[#d8ecd8]/40 mt-4">Free to join. No credit card required.</p>
                  </div>
                </div>

                {/* Right: HR Image */}
                <div className="relative hidden lg:block">
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#013b0b] z-10" />
                  <Image src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&h=600&fit=crop"
                    alt="Business Team" width={700} height={600}
                    className="object-cover w-full h-full min-h-[400px]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
