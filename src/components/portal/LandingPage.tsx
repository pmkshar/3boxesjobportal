'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { AuthDialog } from './AuthDialog'
import { HeroIllustration, JobMatchIllustration, ResumeIllustration, InterviewIllustration, SkillsIllustration, GrowthIllustration, CollabIllustration } from './Illustrations'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Briefcase, Brain, FileText, Users, BarChart3, GraduationCap,
  ArrowRight, Star, ChevronRight, Sparkles, Zap, Target, Award,
  CheckCircle2, MapPin, Search, Building2, TrendingUp, Laptop,
  Heart, Shield, Clock, BookOpen, Code, PieChart, UserCheck,
  IndianRupee, Globe, ChevronDown, Layers, Box, Trophy, Rocket,
  PenTool, MessageSquare, Cpu, Lightbulb, Handshake, Wifi, X
} from 'lucide-react'

// Company Green Color Palette
const CG = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  dark: '#0d3320',
}

const jobCategoriesConfig = [
  { icon: Code, label: 'IT & Software', keywords: ['React', 'Node', 'Python', 'TypeScript', 'AWS', 'Docker', 'Software', 'Developer', 'Engineer'], color: 'bg-green-50 text-green-700 border-green-200' },
  { icon: Briefcase, label: 'Banking & Finance', keywords: ['Finance', 'Banking', 'Account'], color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { icon: Heart, label: 'Healthcare', keywords: ['Health', 'Medical', 'Pharma'], color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { icon: GraduationCap, label: 'Education', keywords: ['Education', 'Teaching', 'Training'], color: 'bg-lime-50 text-lime-700 border-lime-200' },
  { icon: Laptop, label: 'Marketing', keywords: ['Marketing', 'SEO', 'Content', 'Digital'], color: 'bg-green-50 text-green-700 border-green-200' },
  { icon: Building2, label: 'Manufacturing', keywords: ['Manufacturing', 'Production', 'Supply'], color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { icon: Globe, label: 'BPO & Call Centre', keywords: ['BPO', 'Call Centre', 'Support'], color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { icon: TrendingUp, label: 'Sales', keywords: ['Sales', 'Business Development'], color: 'bg-lime-50 text-lime-700 border-lime-200' },
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

const featuredJobs: any[] = [] // Will be populated from API

const aiFeatures = [
  { icon: FileText, title: 'AI Resume Builder', desc: 'Auto-generate and enhance your resume with AI. Skills auto-update when you complete training courses.' },
  { icon: Target, title: 'Smart Job Matching', desc: 'AI-powered matching scores based on your skills, experience, and career preferences.' },
  { icon: Brain, title: 'AI Mock Interviews', desc: 'Practice with AI interviews and get real-time feedback on communication and technical skills.' },
  { icon: Zap, title: 'Skill Auto-Update', desc: 'Complete training and your skills are automatically updated across your profile and all resumes.' },
  { icon: BarChart3, title: 'AI Analytics', desc: 'Comprehensive analytics dashboard with AI-driven career insights and recommendations.' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Curated courses to upskill. AI recommends courses based on your career goals and market trends.' },
]

const testimonials = [
  { name: 'Priya M.', role: 'Software Engineer at Google', text: 'The AI mock interviews helped me land my dream job at a top tech company. The feedback was incredibly detailed!', rating: 5 },
  { name: 'Rahul K.', role: 'Data Scientist at Amazon', text: 'Skill auto-update is a game changer. Every course I complete automatically enhances my resume and profile.', rating: 5 },
  { name: 'Sneha R.', role: 'HR Director at TCS', text: 'As a corporate user, the AI matching saves us hours. We find better candidates faster than any other platform.', rating: 5 },
]

export function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register')
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchExp, setSearchExp] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const { user, isAuthenticated } = useAuthStore()

  const openRegister = () => { setAuthTab('register'); setAuthOpen(true) }
  const openLogin = () => { setAuthTab('login'); setAuthOpen(true) }

  // Fetch featured jobs and courses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, coursesRes] = await Promise.all([
          fetch('/api/jobs?limit=8'),
          fetch('/api/training?limit=4'),
        ])
        if (jobsRes.ok) {
          const data = await jobsRes.json()
          setJobs(data.jobs || [])
        }
        if (coursesRes.ok) {
          const data = await coursesRes.json()
          setCourses(data.courses || [])
        }
      } catch (e) {
        console.error('Fetch error:', e)
      }
    }
    fetchData()
  }, [])

  // Handle search
  const handleSearch = async () => {
    setSearching(true)
    setShowSearchResults(true)
    try {
      const params = new URLSearchParams()
      if (searchSkill) params.set('search', searchSkill)
      if (searchLocation) params.set('location', searchLocation)
      params.set('limit', '12')
      if (searchExp) params.set('experienceMin', searchExp)
      const res = await fetch(`/api/jobs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.jobs || [])
        if (data.jobs?.length === 0) {
          toast.info('No jobs found. Try different keywords.')
        }
      } else {
        toast.error('Search failed. Please try again.')
      }
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed'
    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`
    if (min && max) return `₹${fmt(min)} - ₹${fmt(max)} PA`
    return min ? `₹${fmt(min)}+ PA` : `Up to ₹${fmt(max!)} PA`
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-[#166534] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <ThreeBoxesLogo3D size={44} />
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-white leading-tight tracking-tight">3 Boxes <span className="text-green-300">Jobs</span></span>
                  <span className="text-[10px] text-green-200/70 leading-tight tracking-wider uppercase font-medium">Skills · Resume · Career</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-5 text-sm text-green-100/90">
                <a href="#jobs" className="hover:text-white font-medium transition-colors">Find Jobs</a>
                <a href="#companies" className="hover:text-white font-medium transition-colors">Companies</a>
                <a href="#ai-features" className="hover:text-white font-medium transition-colors">AI Features</a>
                <a href="#training" className="hover:text-white font-medium transition-colors">Training</a>
                <a href="#meaning" className="hover:text-white font-medium transition-colors">Why 3 Boxes?</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-green-100 hover:text-white hover:bg-white/10" onClick={openLogin}>
                Login
              </Button>
              <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold shadow-md" onClick={openRegister}>
                Register Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] pb-36 pt-10 overflow-hidden">
        {/* Floating infographic shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape className="top-[8%] left-[5%]" icon="resume" delay={0} />
          <FloatingShape className="top-[15%] right-[8%]" icon="interview" delay={1.5} />
          <FloatingShape className="bottom-[25%] left-[10%]" icon="skills" delay={0.8} />
          <FloatingShape className="bottom-[30%] right-[5%]" icon="job" delay={2} />
          <FloatingShape className="top-[40%] left-[2%]" icon="chart" delay={1.2} />
          <FloatingShape className="top-[35%] right-[3%]" icon="trophy" delay={0.5} />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Hero illustration - person working on laptop */}
        <div className="absolute right-0 bottom-0 w-80 lg:w-[420px] opacity-20 lg:opacity-30 pointer-events-none hidden md:block">
          <svg viewBox="0 0 420 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="120" r="60" stroke="white" strokeWidth="2" opacity="0.3" />
            <circle cx="300" cy="120" r="30" fill="white" opacity="0.1" />
            <rect x="180" y="200" width="160" height="100" rx="10" stroke="white" strokeWidth="2" opacity="0.3" />
            <rect x="200" y="220" width="120" height="10" rx="5" fill="white" opacity="0.15" />
            <rect x="200" y="240" width="80" height="10" rx="5" fill="white" opacity="0.1" />
            <rect x="200" y="260" width="100" height="10" rx="5" fill="white" opacity="0.1" />
            <path d="M260 160C260 160 280 200 280 200L340 200C340 200 320 160 260 160Z" fill="white" opacity="0.15" />
            <circle cx="100" cy="280" r="40" stroke="white" strokeWidth="1.5" opacity="0.2" />
            <path d="M80 280L100 260L120 280" stroke="white" strokeWidth="1.5" opacity="0.2" />
            <path d="M70 300L100 310L130 300" stroke="white" strokeWidth="1.5" opacity="0.15" />
            <rect x="40" y="320" width="50" height="6" rx="3" fill="white" opacity="0.1" />
            <rect x="110" y="320" width="50" height="6" rx="3" fill="white" opacity="0.1" />
            {/* Floating documents */}
            <rect x="50" y="100" width="60" height="80" rx="5" stroke="white" strokeWidth="1.5" opacity="0.2" transform="rotate(-10 80 140)" />
            <line x1="60" y1="120" x2="100" y2="120" stroke="white" strokeWidth="1" opacity="0.15" />
            <line x1="60" y1="135" x2="95" y2="135" stroke="white" strokeWidth="1" opacity="0.15" />
            <line x1="60" y1="150" x2="90" y2="150" stroke="white" strokeWidth="1" opacity="0.15" />
            {/* Checkmark */}
            <circle cx="370" cy="250" r="20" stroke="white" strokeWidth="2" opacity="0.2" />
            <path d="M362 250L368 256L378 244" stroke="white" strokeWidth="2" opacity="0.25" />
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
                  <Search className="h-5 w-5 mr-2" /> {searching ? 'Searching...' : 'Search'}
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

        {/* Hero Illustration - visible on large screens */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-72 opacity-20 pointer-events-none">
          <HeroIllustration />
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 30C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== MEANING OF 3 BOXES ===== */}
      <section id="meaning" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }} className="text-center mb-12"
          >
            <Badge className="bg-green-100 text-green-800 mb-3 text-sm px-4 py-1 border border-green-200">Our Philosophy</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why <span className="text-[#16a34a]">3 Boxes</span>?</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              The three boxes represent the three essential pillars of every successful career journey. Each box builds upon the previous, creating a powerful cycle of growth and achievement.
            </p>
          </motion.div>

          {/* 3D Box Infographic */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                boxNum: 1,
                title: 'Skills & Training',
                subtitle: 'The Foundation Box',
                icon: BookOpen,
                color: '#22c55e',
                gradient: 'from-green-400 to-green-600',
                description: 'Every career begins with skills. The first box represents continuous learning and upskilling. Our AI-powered training hub curates courses aligned with market demands, and when you complete training, your skills are automatically updated across your entire profile.',
                infographic: 'skills'
              },
              {
                boxNum: 2,
                title: 'Resume & Profile',
                subtitle: 'The Presentation Box',
                icon: FileText,
                color: '#16a34a',
                gradient: 'from-green-500 to-green-700',
                description: 'Your skills deserve the best showcase. The second box represents your professional identity — the AI-crafted resume that dynamically highlights your strengths. Skills from Box 1 automatically flow here, keeping your resume always current and competitive.',
                infographic: 'resume'
              },
              {
                boxNum: 3,
                title: 'Jobs & Career',
                subtitle: 'The Achievement Box',
                icon: Rocket,
                color: '#15803d',
                gradient: 'from-green-600 to-green-800',
                description: 'The ultimate goal of every career journey. The third box represents landing your dream job. AI matches your Box 2 profile with the best opportunities, while AI mock interviews ensure you ace every conversation. This box completes the cycle.',
                infographic: 'career'
              },
            ].map((box, i) => (
              <motion.div
                key={box.boxNum}
                initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-green-100 overflow-hidden group-hover:-translate-y-1">
                  {/* 3D Box visual at top */}
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100/50 flex items-center justify-center overflow-hidden">
                    <Box3DVisual boxNum={box.boxNum} color={box.color} />
                    {/* Floating particles */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(6)].map((_, j) => (
                        <motion.div
                          key={j}
                          className="absolute w-2 h-2 rounded-full bg-green-400"
                          style={{ left: `${15 + j * 15}%`, top: `${20 + (j % 3) * 20}%` }}
                          animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2 + j * 0.3, repeat: Infinity, delay: j * 0.4 }}
                        />
                      ))}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <box.icon className="h-4 w-4 text-green-700" />
                      </div>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Box {box.boxNum}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900 mt-2">{box.title}</h3>
                    <p className="text-xs font-semibold text-green-600 mb-2">{box.subtitle}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{box.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Flow diagram */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-green-50 rounded-2xl px-6 py-4 border border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center"><BookOpen className="h-5 w-5 text-green-700" /></div>
                <span className="text-sm font-bold text-green-800">Train</span>
              </div>
              <ArrowRight className="h-5 w-5 text-green-400" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-300 flex items-center justify-center"><FileText className="h-5 w-5 text-green-800" /></div>
                <span className="text-sm font-bold text-green-800">Resume</span>
              </div>
              <ArrowRight className="h-5 w-5 text-green-400" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-400 flex items-center justify-center"><Rocket className="h-5 w-5 text-green-900" /></div>
                <span className="text-sm font-bold text-green-800">Get Hired</span>
              </div>
              <div className="ml-2 text-green-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <span className="text-xs text-green-600 font-medium">Repeat & Grow</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== JOB CATEGORIES ===== */}
      <section id="jobs" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Browse Jobs by Category</h2>
            <Button variant="ghost" className="text-[#16a34a] text-sm font-semibold">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {jobCategoriesConfig.map((cat, i) => {
              const count = jobs.filter(j => 
                cat.keywords.some(k => 
                  (j.title + ' ' + (j.skills || '')).toLowerCase().includes(k.toLowerCase())
                )
              ).length
              return (
                <motion.div
                  key={cat.label}
                  initial={{ y: 15, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                >
                  <Card className={`cursor-pointer hover:shadow-md transition-all border ${cat.color} group`}
                    onClick={() => { setSearchSkill(cat.keywords[0]); handleSearch() }}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <cat.icon className="h-5 w-5 text-[#16a34a]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{cat.label}</p>
                        <p className="text-xs text-gray-500">{count > 0 ? count : 'Many'} jobs</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== SEARCH RESULTS (shown after search) ===== */}
      {showSearchResults && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Search Results {searchResults.length > 0 && <span className="text-[#16a34a]">({searchResults.length})</span>}
              </h2>
              <Button variant="ghost" className="text-gray-500 text-sm" onClick={() => setShowSearchResults(false)}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            {searching ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-32 bg-gray-200 rounded" /></CardContent></Card>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-sm">Try different keywords or location</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((job: any, i: number) => (
                  <motion.div key={job.id} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-gray-200 h-full group" onClick={() => setSelectedJob(job)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base group-hover:text-[#16a34a] transition-colors">{job.title}</h3>
                            <p className="text-sm text-gray-600 mt-0.5">{job.corporate?.companyName}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</span>
                              <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(job.postedDate)}</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                            <Building2 className="h-6 w-6 text-[#16a34a]" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills?.split(',').slice(0, 4).map((s: string) => (
                            <Badge key={s.trim()} variant="secondary" className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-100">{s.trim()}</Badge>
                          ))}
                          {job.skills?.split(',').length > 4 && (
                            <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-500">+{job.skills.split(',').length - 4}</Badge>
                          )}
                        </div>
                        {job.isRemote && <Badge className="mt-2 bg-teal-50 text-teal-700 border-teal-100">Remote Friendly</Badge>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== FEATURED JOBS (dynamic from API) ===== */}
      <section id="jobs" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Featured Jobs</h2>
            <Button variant="ghost" className="text-[#16a34a] text-sm font-semibold" onClick={isAuthenticated ? undefined : openLogin}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {jobs.length === 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-32 bg-gray-200 rounded" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {jobs.slice(0, 8).map((job: any, i: number) => (
                <motion.div
                  key={job.id}
                  initial={{ y: 15, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-gray-200 h-full group" onClick={() => setSelectedJob(job)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-[#16a34a] transition-colors">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{job.corporate?.companyName}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location || 'Remote'}</span>
                            <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(job.postedDate)}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                          <Building2 className="h-6 w-6 text-[#16a34a]" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills?.split(',').slice(0, 4).map((s: string) => (
                          <Badge key={s.trim()} variant="secondary" className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-100">{s.trim()}</Badge>
                        ))}
                        {job.skills?.split(',').length > 4 && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-500">+{job.skills.split(',').length - 4}</Badge>
                        )}
                      </div>
                      {job.isRemote && <Badge className="mt-2 bg-teal-50 text-teal-700 border-teal-100">Remote Friendly</Badge>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== JOB DETAIL DIALOG ===== */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Building2 className="h-4 w-4" /> {selectedJob.corporate?.companyName}
                  <span className="mx-1">•</span>
                  <MapPin className="h-4 w-4" /> {selectedJob.location || 'Remote'}
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700">{selectedJob.jobType}</Badge>
                  {selectedJob.isRemote && <Badge className="bg-teal-100 text-teal-700">Remote Friendly</Badge>}
                  <Badge variant="outline">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</Badge>
                  {selectedJob.experienceMin && (
                    <Badge variant="outline">{selectedJob.experienceMin}-{selectedJob.experienceMax} yrs exp</Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                </div>
                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Requirements</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.requirements}</p>
                  </div>
                )}
                {selectedJob.responsibilities && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Responsibilities</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.responsibilities}</p>
                  </div>
                )}
                {selectedJob.skills && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.split(',').map((s: string) => (
                        <Badge key={s.trim()} variant="secondary">{s.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedJob.benefits && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Benefits</h4>
                    <p className="text-sm text-gray-600">{selectedJob.benefits}</p>
                  </div>
                )}
                <Separator />
                <div className="flex gap-3">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                    if (!isAuthenticated) { openLogin() } else { toast.success('Application feature available in dashboard') }
                  }}>
                    Apply Now
                  </Button>
                  <Button variant="outline">Save Job</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== TOP COMPANIES HIRING ===== */}
      <section id="companies" className="py-12 bg-green-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Top Companies Hiring Now</h2>
            <p className="text-sm text-gray-500 mt-1">More than 5,000 companies trust 3 Boxes Jobs</p>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {topCompanies.map((company, i) => (
              <motion.div
                key={company.name}
                initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group bg-white">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-xs font-bold text-[#16a34a] group-hover:bg-green-100 transition-colors">
                    {company.logo}
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight">{company.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI-POWERED FEATURES with infographic icons ===== */}
      <section id="ai-features" className="py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-green-100 text-green-800 mb-3 text-sm px-4 py-1 border border-green-200">AI-Powered</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What Makes 3 Boxes Jobs Different</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm sm:text-base">Our AI doesn&apos;t just help you find jobs — it actively builds your career with smart skill updates, interview training, and personalized insights.</p>
          </div>

          {/* Top row with illustrations */}
          <div className="grid md:grid-cols-3 gap-8 mb-8 items-center">
            <div className="hidden md:flex justify-center">
              <ResumeIllustration className="w-48" />
            </div>
            <div className="hidden md:flex justify-center">
              <JobMatchIllustration className="w-48" />
            </div>
            <div className="hidden md:flex justify-center">
              <InterviewIllustration className="w-48" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-green-100 group cursor-pointer group-hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <feature.icon className="h-7 w-7 text-[#16a34a]" />
                    </div>
                    <h3 className="font-extrabold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INFOGRAPHIC: Career Journey ===== */}
      <section className="py-14 bg-gradient-to-b from-green-50/60 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Your Career Journey, Visualized</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">From learning to earning — every step powered by AI</p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Central timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-green-200 via-green-400 to-green-600 rounded-full" />

            {/* Illustrations on the side */}
            <div className="hidden lg:flex absolute -left-48 top-10 opacity-40">
              <SkillsIllustration className="w-40" />
            </div>
            <div className="hidden lg:flex absolute -right-48 bottom-10 opacity-40">
              <GrowthIllustration className="w-40" />
            </div>

            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-8">
              {[
                { step: 1, title: 'Create Your Profile', desc: 'Sign up and build your AI-powered profile. Tell us your skills, experience, and career goals.', icon: UserCheck, side: 'left', emoji: '👤' },
                { step: 2, title: 'Train & Upskill', desc: 'Enroll in AI-recommended courses. Complete training and watch your skills auto-update everywhere.', icon: BookOpen, side: 'right', emoji: '📚' },
                { step: 3, title: 'AI Builds Your Resume', desc: 'Our AI crafts a perfect resume from your profile, skills, and training — always up to date.', icon: PenTool, side: 'left', emoji: '📄' },
                { step: 4, title: 'Practice AI Interviews', desc: 'Sharpen your interview skills with AI-powered mock sessions and get real-time feedback.', icon: MessageSquare, side: 'right', emoji: '🎙️' },
                { step: 5, title: 'Get AI-Matched Jobs', desc: 'AI matches your enhanced profile with the best job opportunities across 5,000+ companies.', icon: Target, side: 'left', emoji: '🎯' },
                { step: 6, title: 'Land Your Dream Job!', desc: 'Apply with confidence, ace interviews, and start your next career chapter.', icon: Trophy, side: 'right', emoji: '🏆' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ x: item.side === 'left' ? -30 : 30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className={`flex gap-4 ${item.side === 'right' ? 'md:mt-16 md:flex-row-reverse md:text-right' : ''}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg text-white font-extrabold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <Card className="flex-1 border-green-100 hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-5 w-5 text-[#16a34a]" />
                        <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Job Seekers */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 sm:p-8 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#16a34a] flex items-center justify-center shadow-md">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">For Job Seekers</h3>
                  <p className="text-xs text-green-700 font-medium">3 Boxes approach to career success</p>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { step: '1', title: 'Create Profile & AI Resume', desc: 'Build your AI-powered resume and complete your profile with skills and experience.' },
                  { step: '2', title: 'Train & Skills Auto-Update', desc: 'Take training courses to upskill. AI automatically updates your resume and profile skills.' },
                  { step: '3', title: 'AI Interview & Get Hired', desc: 'Practice with AI mock interviews, apply with confidence, and land your dream job.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-sm font-bold shadow-md">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-md" onClick={openRegister}>
                Register as Job Seeker <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Employers */}
            <div className="bg-gradient-to-br from-green-100/50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#15803d] flex items-center justify-center shadow-md">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">For Employers</h3>
                  <p className="text-xs text-green-700 font-medium">AI-powered recruitment solution</p>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { step: '1', title: 'Post Jobs with AI', desc: 'Create job postings with AI-optimized descriptions. Reach the right candidates faster.' },
                  { step: '2', title: 'Review AI-Matched Candidates', desc: 'Get AI-scored candidate matches. Filter by skills, experience, and AI match percentage.' },
                  { step: '3', title: 'Hire the Best Talent', desc: 'Schedule interviews, track applications, and hire top talent with AI-driven insights.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#15803d] text-white flex items-center justify-center text-sm font-bold shadow-md">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold shadow-md" onClick={openRegister}>
                Register as Employer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRAINING SECTION ===== */}
      <section id="training" className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Upskill with AI Training</h2>
              <p className="text-sm text-gray-500 mt-1">Complete courses and your skills are automatically updated on your resume</p>
            </div>
            <Button variant="ghost" className="text-[#16a34a] text-sm font-semibold hidden sm:flex">
              View All Courses <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(courses.length > 0 ? courses.slice(0, 4) : [
              { title: 'React Advanced Patterns', level: 'advanced', duration: 24, skills: 'React, TypeScript, Redux', rating: 4.9, enrollCount: 2500 },
              { title: 'Machine Learning with Python', level: 'intermediate', duration: 40, skills: 'Python, TensorFlow, NLP', rating: 4.8, enrollCount: 3200 },
              { title: 'AWS Solutions Architect', level: 'intermediate', duration: 36, skills: 'AWS, EC2, Lambda, S3', rating: 4.7, enrollCount: 1800 },
              { title: 'System Design for Engineers', level: 'advanced', duration: 20, skills: 'System Design, Scalability', rating: 4.9, enrollCount: 2100 },
            ]).map((course: any, i: number) => (
              <motion.div
                key={course.title}
                initial={{ y: 15, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-green-100 group group-hover:-translate-y-1"
                  onClick={isAuthenticated ? undefined : openLogin}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${course.level === 'advanced' ? 'bg-green-100 text-green-800' : 'bg-emerald-50 text-emerald-700'}`}>
                        {course.level}
                      </Badge>
                      <span className="text-xs text-gray-400">{course.duration} hrs</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{course.skills}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-green-50">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">{course.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">{course.enrollCount?.toLocaleString() || course.enrolled} enrolled</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What Our Users Say</h2>
            <p className="text-gray-500 mt-2 text-sm">Trusted by 50,000+ professionals across India</p>
          </div>
          <div className="hidden md:flex justify-center mb-8">
            <CollabIllustration className="w-64" />
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="h-full border-green-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#16a34a]">{t.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="bg-gradient-to-r from-[#166534] via-[#15803d] to-[#16a34a] py-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <InfographicPattern />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Accelerate Your Career?</h2>
              <p className="text-green-100/80 mt-2 text-sm sm:text-base">Join 50,000+ professionals. Register free and let AI power your job search.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-green-400 hover:bg-green-300 text-green-900 font-bold text-base px-8 h-12 shadow-lg"
                onClick={openRegister}>
                Register Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-6 h-12"
                onClick={openLogin}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0d3320] text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <ThreeBoxesLogo3D size={36} />
                <div>
                  <span className="text-lg font-extrabold text-white">3 Boxes <span className="text-green-400">Jobs</span></span>
                  <p className="text-[10px] text-green-400/60 uppercase tracking-wider">Skills · Resume · Career</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">India&apos;s first AI-powered career platform with smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching. The three boxes represent the complete career journey.</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Shield className="h-3.5 w-3.5" /> Your data is secure and private
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">AI Resume Builder</li>
                <li className="hover:text-white cursor-pointer transition-colors">Smart Job Search</li>
                <li className="hover:text-white cursor-pointer transition-colors">AI Mock Interviews</li>
                <li className="hover:text-white cursor-pointer transition-colors">Training Hub</li>
                <li className="hover:text-white cursor-pointer transition-colors">Skill Auto-Update</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Post Jobs</li>
                <li className="hover:text-white cursor-pointer transition-colors">AI Candidate Matching</li>
                <li className="hover:text-white cursor-pointer transition-colors">Recruiter Tools</li>
                <li className="hover:text-white cursor-pointer transition-colors">Analytics Dashboard</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing Plans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>&copy; 2025 3 Boxes Jobs. All rights reserved. Powered by AI.</span>
            <span>Demo: seeker@3boxes.com / demo123</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ===== 3D LOGO COMPONENT =====
export function ThreeBoxesLogo3D({ size = 44, className = '' }: { size?: number; className?: string }) {
  const scale = size / 60
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 60 42"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 8px rgba(22, 163, 74, 0.3))' }}
    >
      <defs>
        {/* 3D gradients for each box */}
        <linearGradient id="box1Top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="box1Side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="box2Top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="box2Side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="box3Top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="box3Side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        {/* Shine effect */}
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="50%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Box 1 - Left (Skills & Training) - slightly elevated */}
      <g transform="translate(2, 2)">
        {/* Right face (shadow) */}
        <path d="M12 8 L18 5 L18 22 L12 25 Z" fill="url(#box1Side)" />
        {/* Front face */}
        <path d="M0 11 L12 8 L12 25 L0 28 Z" fill="url(#box1Top)" />
        {/* Top face */}
        <path d="M0 11 L6 8 L18 5 L12 8 Z" fill="#86efac" />
        {/* Shine */}
        <path d="M0 11 L6 8 L12 8 L0 11 Z" fill="url(#shine)" />
        {/* Number */}
        <text x="6" y="20" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui" textAnchor="middle">1</text>
      </g>

      {/* Box 2 - Center (Resume & Profile) - highest */}
      <g transform="translate(16, 0)">
        {/* Right face */}
        <path d="M12 6 L18 3 L18 24 L12 27 Z" fill="url(#box2Side)" />
        {/* Front face */}
        <path d="M0 9 L12 6 L12 27 L0 30 Z" fill="url(#box2Top)" />
        {/* Top face */}
        <path d="M0 9 L6 6 L18 3 L12 6 Z" fill="#6ee7b7" />
        {/* Shine */}
        <path d="M0 9 L6 6 L12 6 L0 9 Z" fill="url(#shine)" />
        {/* Number */}
        <text x="6" y="22" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui" textAnchor="middle">2</text>
      </g>

      {/* Box 3 - Right (Jobs & Career) - medium height */}
      <g transform="translate(30, 3)">
        {/* Right face */}
        <path d="M12 7 L18 4 L18 22 L12 25 Z" fill="url(#box3Side)" />
        {/* Front face */}
        <path d="M0 10 L12 7 L12 25 L0 28 Z" fill="url(#box3Top)" />
        {/* Top face */}
        <path d="M0 10 L6 7 L18 4 L12 7 Z" fill="#a7f3d0" />
        {/* Shine */}
        <path d="M0 10 L6 7 L12 7 L0 10 Z" fill="url(#shine)" />
        {/* Number */}
        <text x="6" y="21" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui" textAnchor="middle">3</text>
      </g>

      {/* Connecting arrows between boxes */}
      <g opacity="0.5">
        <path d="M14 16 C16 14 16 14 18 16" stroke="white" strokeWidth="1" fill="none" />
        <path d="M28 16 C30 14 30 14 32 16" stroke="white" strokeWidth="1" fill="none" />
      </g>
    </svg>
  )
}

// ===== 3D BOX VISUAL FOR MEANING SECTION =====
function Box3DVisual({ boxNum, color }: { boxNum: number; color: string }) {
  const heights = [28, 35, 32]
  const h = heights[boxNum - 1]
  const y = 48 - h

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-lg">
      <defs>
        <linearGradient id={`box${boxNum}Front`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`box${boxNum}Right`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`box${boxNum}Top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="60" cy="90" rx="35" ry="8" fill="black" opacity="0.08" />

      {/* Right face */}
      <path d={`M70 ${y + 10} L90 ${y} L90 ${y + h - 5} L70 ${y + h + 5} Z`} fill={`url(#box${boxNum}Right)`} />
      {/* Front face */}
      <path d={`M30 ${y + 15} L70 ${y + 10} L70 ${y + h + 5} L30 ${y + h + 10} Z`} fill={`url(#box${boxNum}Front)`} />
      {/* Top face */}
      <path d={`M30 ${y + 15} L50 ${y + 5} L90 ${y} L70 ${y + 10} Z`} fill={`url(#box${boxNum}Top)`} />

      {/* Shine on front */}
      <path d={`M30 ${y + 15} L50 ${y + 10} L50 ${y + h} L30 ${y + h + 10} Z`} fill="white" opacity="0.1" />

      {/* Number on front face */}
      <text
        x="50"
        y={y + h / 2 + 8}
        fill="white"
        fontSize="18"
        fontWeight="bold"
        fontFamily="system-ui"
        textAnchor="middle"
        opacity="0.9"
      >
        {boxNum}
      </text>
    </svg>
  )
}

// ===== FLOATING INFOGRAPHIC SHAPES =====
function FloatingShape({ className, icon, delay }: { className: string; icon: string; delay: number }) {
  const icons: Record<string, JSX.Element> = {
    resume: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="4" width="32" height="40" rx="3" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <line x1="14" y1="14" x2="34" y2="14" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <line x1="14" y1="20" x2="30" y2="20" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <line x1="14" y1="26" x2="28" y2="26" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <circle cx="18" cy="8" r="2" fill="white" opacity="0.2" />
      </svg>
    ),
    interview: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="8" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <path d="M12 38C12 30 18 26 24 26C30 26 36 30 36 38" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <path d="M32 12L38 8M38 8L36 14M38 8L44 10" stroke="white" strokeWidth="1.5" opacity="0.2" />
      </svg>
    ),
    skills: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 4L30 16L44 18L34 28L36 42L24 36L12 42L14 28L4 18L18 16Z" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <circle cx="24" cy="22" r="4" fill="white" opacity="0.15" />
      </svg>
    ),
    job: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="14" width="36" height="28" rx="3" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <path d="M18 14V10C18 7.8 19.8 6 22 6H26C28.2 6 30 7.8 30 10V14" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <line x1="6" y1="24" x2="42" y2="24" stroke="white" strokeWidth="1.5" opacity="0.15" />
      </svg>
    ),
    chart: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="28" width="8" height="14" rx="1" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <rect x="20" y="18" width="8" height="24" rx="1" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <rect x="34" y="8" width="8" height="34" rx="1" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <path d="M10 26L24 16L38 6" stroke="white" strokeWidth="1.5" opacity="0.15" strokeDasharray="3 2" />
      </svg>
    ),
    trophy: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M16 6H32V20C32 26 28 30 24 30C20 30 16 26 16 20V6Z" stroke="white" strokeWidth="1.5" opacity="0.2" />
        <path d="M16 10H10C10 16 12 18 16 18" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <path d="M32 10H38C38 16 36 18 32 18" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <line x1="24" y1="30" x2="24" y2="36" stroke="white" strokeWidth="1.5" opacity="0.15" />
        <line x1="16" y1="36" x2="32" y2="36" stroke="white" strokeWidth="1.5" opacity="0.15" />
      </svg>
    ),
  }

  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {icons[icon] || null}
    </motion.div>
  )
}

// ===== INFOGRAPHIC PATTERN FOR CTA SECTION =====
function InfographicPattern() {
  return (
    <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      {/* Decorative curves */}
      <path d="M0 100 Q200 50 400 100 T800 100" stroke="white" strokeWidth="1" fill="none" opacity="0.1" />
      <path d="M0 200 Q300 150 600 200 T1200 200" stroke="white" strokeWidth="1" fill="none" opacity="0.08" />
      {/* Small box shapes scattered */}
      <rect x="50" y="30" width="12" height="12" rx="2" fill="white" opacity="0.05" transform="rotate(15 56 36)" />
      <rect x="350" y="60" width="10" height="10" rx="2" fill="white" opacity="0.05" transform="rotate(-10 355 65)" />
      <rect x="700" y="20" width="14" height="14" rx="2" fill="white" opacity="0.04" transform="rotate(8 707 27)" />
    </svg>
  )
}

// ===== OLD LOGO KEPT FOR BACKWARD COMPAT =====
export function ThreeBoxesLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <ThreeBoxesLogo3D size={size} className={className} />
}
