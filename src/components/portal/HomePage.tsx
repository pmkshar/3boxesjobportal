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
  Bookmark, LayoutGrid, Shield, BookOpen, Star, Download,
  Heart, Bell, User, Smartphone, Share,
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
  { step: '01', icon: FileText, title: 'Create Your Profile', desc: 'Sign up and build your AI-powered resume. Our smart builder auto-suggests skills, formats, and keywords that recruiters search for most.', color: 'from-[#16a34a] to-[#15803d]' },
  { step: '02', icon: Brain, title: 'AI Matches You to Jobs', desc: 'Our intelligent engine analyzes your skills, experience, and preferences to surface the most relevant opportunities — no endless scrolling needed.', color: 'from-[#34a853] to-[#16a34a]' },
  { step: '03', icon: Target, title: 'Practice with AI Interviews', desc: 'Prepare with realistic AI mock interviews. Get instant feedback on communication, technical depth, and confidence before your real interview.', color: 'from-[#f9ab00] to-[#e9a000]' },
  { step: '04', icon: Trophy, title: 'Get Hired Faster', desc: 'With AI-enhanced resumes, verified skills, and interview readiness, you stand out to employers and land your dream job significantly faster.', color: 'from-[#15803d] to-[#166534]' },
]

// Career journey steps
const careerJourneySteps = [
  { icon: BookOpen, title: 'Learn & Upskill', desc: 'Industry-aligned courses that auto-update your profile with verified skills and certifications', color: 'bg-[#16a34a]' },
  { icon: FileText, title: 'Build Smart Resume', desc: 'AI-powered resume builder that optimizes for ATS systems and highlights your strongest qualifications', color: 'bg-[#34a853]' },
  { icon: Brain, title: 'Practice Interviews', desc: 'AI mock interviews with real-time feedback on communication, technical skills, and confidence levels', color: 'bg-[#f9ab00]' },
  { icon: Target, title: 'Get Matched', desc: 'Intelligent job matching based on your complete profile — skills, experience, and career preferences', color: 'bg-[#15803d]' },
  { icon: Trophy, title: 'Land Your Dream Job', desc: 'Stand out with AI-verified skills, polished resumes, and interview-ready confidence to get hired faster', color: 'bg-[#166534]' },
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

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-[#166534] via-[#15803d] via-40% to-[#22c55e] pb-36 pt-10 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          {/* Floating colorful shapes */}
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-green-300/10 blur-sm" />
          <motion.div animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-32 right-[15%] w-16 h-16 rounded-2xl bg-emerald-300/10 rotate-45 blur-sm" />
          <motion.div animate={{ y: [0, -12, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-40 left-[20%] w-24 h-24 rounded-full bg-teal-300/8 blur-md" />
          <motion.div animate={{ y: [0, 18, 0], rotate: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-60 right-[8%] w-14 h-14 rounded-xl bg-lime-300/10 rotate-12 blur-sm" />
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-16 left-[45%] w-10 h-10 rounded-lg bg-yellow-300/10 rotate-[30deg] blur-sm" />
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
            className="mt-10 flex flex-wrap justify-center gap-4 sm:gap-6"
          >
            {[
              { label: 'Active Jobs', value: '10,000+', icon: Briefcase, bg: 'bg-white/10 backdrop-blur-sm border border-white/20' },
              { label: 'Companies', value: '5,000+', icon: Building2, bg: 'bg-white/10 backdrop-blur-sm border border-white/20' },
              { label: 'Candidates', value: '50,000+', icon: Users, bg: 'bg-white/10 backdrop-blur-sm border border-white/20' },
              { label: 'AI Interviews', value: '1,000+', icon: Brain, bg: 'bg-white/10 backdrop-blur-sm border border-white/20' },
            ].map(stat => (
              <div key={stat.label} className={`text-center flex flex-col items-center ${stat.bg} rounded-2xl px-5 py-3 min-w-[120px]`}>
                <stat.icon className="h-5 w-5 text-green-300 mb-1" />
                <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-green-200/80">{stat.label}</div>
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

      {/* ===== WHY 3 BOXES / MEANING SECTION ===== */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50/30 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-10 right-0 w-72 h-72 bg-green-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-amber-100/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">The Meaning Behind Our Name</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why <span className="bg-gradient-to-r from-[#16a34a] to-[#34a853] bg-clip-text text-transparent">3 Boxes</span>?</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
              The three boxes represent the three pillars of a successful career journey — Skills, Resume, and Career. Each box builds upon the previous one, creating a complete ecosystem where every action you take strengthens your path to your dream job.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting SVG illustration between cards (desktop) */}
            <div className="hidden md:block absolute top-1/3 left-0 right-0 pointer-events-none z-0">
              <svg className="w-full h-16" viewBox="0 0 900 64" fill="none" preserveAspectRatio="xMidYMid meet">
                {/* Arrow from Box 1 to Box 2 */}
                <path d="M180 32 C220 32, 240 20, 280 20 C320 20, 340 32, 380 32" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="8 4" fill="none" opacity="0.4" />
                <polygon points="378,26 390,32 378,38" fill="#16a34a" opacity="0.4" />
                {/* Arrow from Box 2 to Box 3 */}
                <path d="M480 32 C520 32, 540 44, 580 44 C620 44, 640 32, 680 32" stroke="#34a853" strokeWidth="2.5" strokeDasharray="8 4" fill="none" opacity="0.4" />
                <polygon points="678,26 690,32 678,38" fill="#34a853" opacity="0.4" />
              </svg>
            </div>

            {[
              {
                icon: BookOpen,
                title: 'Box 1: Skills & Training',
                desc: 'The foundation of your career. Our integrated training portal offers industry-aligned courses that automatically update your skill profile. Every course completed, every certificate earned, instantly reflects across your entire 3 Boxes presence.',
                color: 'from-[#16a34a] to-[#15803d]',
                tag: 'Foundation',
                items: ['Industry-aligned courses', 'Auto-updating skill profiles', 'Verified certificates'],
                glowColor: 'shadow-green-200/50',
              },
              {
                icon: FileText,
                title: 'Box 2: Smart Resume',
                desc: 'Your professional identity, powered by AI. Our AI Resume Builder crafts ATS-optimized resumes that highlight your strongest qualifications. Skills auto-populate from training completions, ensuring your resume is always current and competitive.',
                color: 'from-[#34a853] to-[#16a34a]',
                tag: 'Identity',
                items: ['AI-powered resume builder', 'ATS-optimized formatting', 'Auto-populated skills'],
                glowColor: 'shadow-emerald-200/50',
              },
              {
                icon: Trophy,
                title: 'Box 3: Career & Jobs',
                desc: 'The destination — your dream career. AI-powered job matching connects your complete profile (skills + resume + interview readiness) with the perfect opportunities. Practice with AI mock interviews, get matched, and land your dream job faster.',
                color: 'from-[#15803d] to-[#166534]',
                tag: 'Destination',
                items: ['Smart job matching', 'AI mock interviews', 'Higher visibility to employers'],
                glowColor: 'shadow-teal-200/50',
              },
            ].map((box, i) => (
              <motion.div key={i}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                className="relative z-10"
              >
                <Card className={`border-0 shadow-sm hover:shadow-xl ${box.glowColor} transition-all h-full group overflow-hidden hover:border-t-4 hover:border-t-[#16a34a]`}>
                  <div className={`bg-gradient-to-br ${box.color} p-6 text-center relative`}>
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                    <Badge className="bg-white/20 text-white border-0 text-[10px] rounded-full px-3 py-0.5 font-semibold mb-3">{box.tag}</Badge>
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <box.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{box.title}</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{box.desc}</p>
                    <div className="space-y-2">
                      {box.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#16a34a] flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Connecting flow - Enhanced infographic */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10 text-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 via-white to-amber-50 rounded-full px-8 py-4 border border-green-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#16a34a] flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-[#16a34a]">Skills</span>
              </div>
              <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                <path d="M0 8 L12 8 L16 4 L20 8 L24 4 L28 8 L40 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <polygon points="36,4 42,8 36,12" fill="#16a34a" opacity="0.5" />
              </svg>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#34a853] flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-[#34a853]">Resume</span>
              </div>
              <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                <path d="M0 8 L12 8 L16 4 L20 8 L24 4 L28 8 L40 8" stroke="#34a853" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <polygon points="36,4 42,8 36,12" fill="#34a853" opacity="0.5" />
              </svg>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#15803d] flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-[#15803d]">Career</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="relative -mt-1">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0 C240 35 480 35 720 20 C960 5 1200 5 1440 30 V40 H0 Z" fill="#f9fafb" />
        </svg>
      </div>

      {/* ===== JOB CATEGORIES ===== */}
      <section className="py-12 bg-[#f9fafb] relative">
        {/* Decorative dots pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #16a34a 1px, transparent 0)', backgroundSize: '32px 32px'}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Browse Jobs by <span className="bg-gradient-to-r from-[#16a34a] to-[#34a853] bg-clip-text text-transparent">Category</span></h2>
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
      <section className="py-16 bg-gradient-to-b from-[#f5f7fc] to-[#eef2f9] relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-green-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Featured <span className="bg-gradient-to-r from-[#16a34a] to-[#34a853] bg-clip-text text-transparent">Jobs</span></h2>
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
                  className="hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-0 shadow-sm hover:shadow-xl overflow-hidden hover:border-l-4 hover:border-l-[#16a34a]"
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
                        <Shield className="h-4 w-4 text-[#16a34a]" />
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

      {/* ===== TOP COMPANIES HIRING ===== */}
      <section className="py-16 bg-gradient-to-b from-white to-amber-50/20 overflow-hidden relative">
        {/* Decorative pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-0 w-60 h-60 bg-green-100/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-48 h-48 bg-amber-100/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Trusted By Top Employers</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Companies That <span className="relative inline-block">Hire Through Us<span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#16a34a] to-[#f9ab00] rounded-full"></span></span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">From startups to Fortune 500s — corporates trust 3 Boxes for AI-powered hiring that delivers better candidates faster.</p>
          </motion.div>

          {/* Scrolling Company Logos - Infinite Marquee */}
          <div className="relative mb-12">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden">
              <div className="flex gap-6 animate-marquee whitespace-nowrap">
                {[...topCompanies, ...topCompanies, ...topCompanies].map((c, i) => (
                  <div key={`${c.name}-${i}`} className="flex-shrink-0 w-[130px] h-[70px] flex items-center justify-center rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm hover:border-[#16a34a]/30 hover:bg-green-50 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${getCompanyColor(c.name)} flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform`}>
                        {c.logo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Corporate Advantages */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Why Corporates Choose <span className="relative inline-block"><span className="bg-gradient-to-r from-[#16a34a] to-[#34a853] bg-clip-text text-transparent">3 Boxes</span><span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#16a34a] to-[#34a853] rounded-full"></span></span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', icon: Building2, title: 'Post Jobs Instantly', desc: 'Create job postings in minutes with AI-assisted job description generation. Reach thousands of qualified candidates immediately.', color: 'from-[#16a34a] to-[#15803d]' },
                { step: '02', icon: Target, title: 'AI Smart Matching', desc: 'Our AI engine analyzes skills, experience, and cultural fit to match you with the most relevant candidates — no sifting through irrelevant resumes.', color: 'from-[#34a853] to-[#16a34a]' },
                { step: '03', icon: Brain, title: 'AI Interview Insights', desc: 'Get AI-generated interview summaries, skill ratings, and culture-fit analysis before you even meet the candidate. Save 70% of screening time.', color: 'from-[#f9ab00] to-[#e9a000]' },
                { step: '04', icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time hiring analytics — track application funnels, time-to-hire, candidate quality scores, and ROI with actionable insights.', color: 'from-[#15803d] to-[#166534]' },
              ].map((item, i) => (
                <motion.div key={item.step}
                  initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                  className="relative"
                >
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6">
                      <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                        <path d="M0 6L8 6L12 2L16 6L24 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                        <circle cx="24" cy="6" r="2" fill="#16a34a" opacity="0.3" />
                      </svg>
                    </div>
                  )}
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full group hover:border-t-4 hover:border-t-[#16a34a]">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                        {item.step}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-[#16a34a]" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/corporate">
                <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-8 h-12 text-base rounded-xl shadow-md">
                  <Building2 className="h-5 w-5 mr-2" /> Register Your Company
                </Button>
              </Link>
              <p className="text-xs text-gray-400 mt-2">Free to post. Pay only when you hire.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AI-POWERED FEATURES ===== */}
      <section className="py-16 bg-gradient-to-b from-[#f5f7fc] to-[#eef0fa] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-purple-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-green-100/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">AI-Powered Platform</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Built-In <span className="bg-gradient-to-r from-[#16a34a] to-[#f9ab00] bg-clip-text text-transparent">AI Features</span> for Every User</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Not just a job board — 3 Boxes is an intelligent career platform with AI tools designed for job seekers, recruiters, HR managers, and interviewers.</p>
          </motion.div>

          {/* Features by User Type */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Seekers */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full overflow-hidden hover:shadow-xl hover:shadow-green-100/50 transition-all hover:border-t-4 hover:border-t-[#16a34a]">
                <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] p-6 text-center relative">
                  {/* Subtle glow effect */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-300/20 rounded-full blur-2xl" />
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Users className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">For Job Seekers</h3>
                  <p className="text-green-100/80 text-xs mt-1">Smart tools to land your dream job</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { icon: FileText, title: 'AI Resume Builder', desc: 'Auto-generate polished resumes with AI. Skills update automatically when you complete training courses.' },
                    { icon: Brain, title: 'AI Mock Interviews', desc: 'Practice interviews with AI and get real-time feedback on communication, technical depth, and confidence.' },
                    { icon: Target, title: 'Smart Job Matching', desc: 'AI calculates your match score with every job based on skills, experience, and career preferences.' },
                    { icon: Zap, title: 'Skill Auto-Update', desc: 'Complete a training course and your skills automatically update across your profile and all resumes.' },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-[#16a34a]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Corporates & Recruiters */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full overflow-hidden hover:shadow-xl hover:shadow-amber-100/50 transition-all hover:border-t-4 hover:border-t-[#f9ab00]">
                <div className="bg-gradient-to-br from-[#f9ab00] to-[#e9a000] p-6 text-center relative">
                  {/* Subtle glow effect */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Building2 className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">For Corporates & Recruiters</h3>
                  <p className="text-amber-100/80 text-xs mt-1">Hire smarter, faster with AI</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { icon: Target, title: 'AI Candidate Matching', desc: 'AI ranks candidates by skill match, experience relevance, and cultural fit — shortlist in seconds, not days.' },
                    { icon: Brain, title: 'AI Interview Insights', desc: 'Get AI-generated summaries and skill ratings from mock interviews before scheduling real interviews.' },
                    { icon: BarChart3, title: 'Hiring Analytics', desc: 'Real-time dashboards with application funnels, time-to-hire, source quality, and AI-driven hiring predictions.' },
                    { icon: Users, title: 'Team Collaboration', desc: 'Recruiters, HR managers, and interviewers collaborate on a shared pipeline with role-based access and notes.' },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-[#f9ab00]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Interviewers & Admins */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full overflow-hidden hover:shadow-xl hover:shadow-teal-100/50 transition-all hover:border-t-4 hover:border-t-[#15803d]">
                <div className="bg-gradient-to-br from-[#15803d] to-[#166534] p-6 text-center relative">
                  {/* Subtle glow effect */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-300/20 rounded-full blur-2xl" />
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Shield className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">For Interviewers & Admins</h3>
                  <p className="text-green-100/80 text-xs mt-1">Streamlined evaluation tools</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { icon: MessageSquare, title: 'Interview Scheduling', desc: 'AI suggests optimal time slots based on interviewer and candidate availability. Automated reminders included.' },
                    { icon: CheckCircle2, title: 'Structured Evaluation', desc: 'Pre-built rubrics and scorecards for technical, behavioral, and cultural-fit assessments.' },
                    { icon: PieChart, title: 'Admin Dashboard', desc: 'Full platform control — manage users, jobs, applications, and analytics from a single powerful admin panel.' },
                    { icon: Award, title: 'Quality Scoring', desc: 'AI generates candidate quality scores combining resume data, interview performance, and skill assessments.' },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-[#16a34a]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Workflow Infographic */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">How <span className="bg-gradient-to-r from-[#16a34a] to-[#34a853] bg-clip-text text-transparent">AI</span> Powers Your Hiring Journey</h3>
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0">
              {[
                { icon: FileText, label: 'AI Resume Scan', desc: 'Instant parsing & scoring', color: 'bg-[#16a34a]', ringColor: 'ring-green-200' },
                { icon: Target, label: 'Smart Matching', desc: 'Skill-fit algorithms', color: 'bg-[#34a853]', ringColor: 'ring-emerald-200' },
                { icon: Brain, label: 'AI Interview', desc: 'Automated screening', color: 'bg-[#f9ab00]', ringColor: 'ring-amber-200' },
                { icon: BarChart3, label: 'Quality Score', desc: 'Data-driven ranking', color: 'bg-[#15803d]', ringColor: 'ring-teal-200' },
                { icon: CheckCircle2, label: 'Hire the Best', desc: 'Confident decisions', color: 'bg-[#166534]', ringColor: 'ring-green-300' },
              ].map((step, i) => (
                <motion.div key={step.label} className="flex items-center"
                  initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center text-white shadow-md ring-4 ${step.ringColor}/30`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-gray-900 text-xs mt-2">{step.label}</p>
                    <p className="text-[10px] text-gray-500">{step.desc}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden lg:flex items-center mx-2">
                      <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                        <path d="M0 6L12 6L16 2L20 6L24 2L28 6L40 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                        <circle cx="40" cy="6" r="3" fill="#16a34a" opacity="0.4" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/ai-features">
              <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-8 h-12 text-base rounded-xl shadow-md">
                <Brain className="h-5 w-5 mr-2" /> Explore All AI Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CAREER JOURNEY INFOGRAPHIC ===== */}
      <section className="py-16 bg-gradient-to-b from-white via-purple-50/10 to-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-100/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-blue-100/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="bg-purple-50 text-purple-600 border-purple-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Your Complete Career Path</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Career <span className="bg-gradient-to-r from-[#16a34a] to-[#7c66ff] bg-clip-text text-transparent">Journey</span> with 3 Boxes</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
              Every step in your career journey is interconnected on our platform. Training updates your skills, skills enhance your resume, your resume drives job matches, and interviews seal the deal. It all works together seamlessly.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {careerJourneySteps.map((step, i) => (
              <motion.div key={i}
                initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Circular icon with connecting dotted line and number badge */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center text-white shadow-lg ring-4 ring-green-100/30`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#16a34a]">{i + 1}</span>
                      </div>
                    </div>
                    {i < careerJourneySteps.length - 1 && (
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-0.5 h-4 bg-gradient-to-b from-[#16a34a]/30 to-transparent" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]/40" />
                        <div className="w-0.5 h-4 bg-gradient-to-b from-[#16a34a]/20 to-transparent" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]/30" />
                        <div className="w-0.5 h-4 bg-gradient-to-b from-[#16a34a]/10 to-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100/50">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-green-50/20 relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #16a34a 1px, transparent 0)', backgroundSize: '24px 24px'}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Simple & Powerful</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How It <span className="bg-gradient-to-r from-[#16a34a] to-[#f9ab00] bg-clip-text text-transparent">Works</span></h2>
            <p className="text-gray-500 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
              Getting started with 3 Boxes is straightforward. In just four simple steps, you can transform your job search from a frustrating experience into an AI-powered journey that delivers real results faster than traditional methods.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting flow arrows between cards (desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-[22%] right-[5%] -translate-y-1/2 pointer-events-none z-0">
              <svg className="w-full" viewBox="0 0 800 16" fill="none" preserveAspectRatio="xMidYMid meet">
                {/* Arrow between step 1 and 2 */}
                <path d="M0 8 C60 8, 80 2, 140 2 C180 2, 200 8, 260 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" opacity="0.3" />
                <polygon points="256,4 264,8 256,12" fill="#16a34a" opacity="0.3" />
                {/* Arrow between step 2 and 3 */}
                <path d="M260 8 C320 8, 340 14, 400 14 C440 14, 460 8, 520 8" stroke="#34a853" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" opacity="0.3" />
                <polygon points="516,4 524,8 516,12" fill="#34a853" opacity="0.3" />
                {/* Arrow between step 3 and 4 */}
                <path d="M520 8 C560 8, 580 2, 640 2 C680 2, 700 8, 800 8" stroke="#f9ab00" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" opacity="0.3" />
                <polygon points="796,4 804,8 796,12" fill="#f9ab00" opacity="0.3" />
              </svg>
            </div>

            {howItWorksSteps.map((step, i) => (
              <motion.div key={step.step}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                className="relative z-10"
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full text-center group hover:border-t-4 hover:border-t-[#16a34a] bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} text-white font-bold text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      {step.step}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="h-6 w-6 text-[#16a34a]" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRAINING SECTION ===== */}
      <section className="py-16 bg-gradient-to-b from-white to-amber-50/15 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Training Info */}
            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Upskill & Get Hired Faster</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                Training That <span className="bg-gradient-to-r from-[#16a34a] to-[#f9ab00] bg-clip-text text-transparent">Auto-Updates</span> Your Profile
              </h2>
              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                Our integrated training portal — <a href="https://marqaitrainers.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#16a34a] font-semibold hover:underline">MarqAI Trainers</a> — offers industry-aligned courses designed to bridge the skill gap. Every course you complete automatically updates your skills across your 3 Boxes profile and resume, making you more visible to employers.
              </p>

              {/* Benefits */}
              <div className="mt-6 space-y-4">
                {[
                  { icon: Zap, title: 'Skills Auto-Update', desc: 'Complete a course and your profile, resume, and job match scores update instantly — no manual entry needed.' },
                  { icon: Target, title: 'Industry-Aligned Curriculum', desc: 'Courses designed with industry input so you learn exactly what employers are looking for in current job markets.' },
                  { icon: Award, title: 'Verified Certificates', desc: 'Earn certificates that are displayed on your profile and visible to recruiters, giving you a competitive edge.' },
                  { icon: TrendingUp, title: 'Higher Match Scores', desc: 'More verified skills = higher AI match scores = more interview calls. Training directly boosts your visibility.' },
                  { icon: Brain, title: 'AI-Recommended Courses', desc: 'Our AI analyzes your profile and career goals to recommend the exact courses that will maximize your career growth.' },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-[#16a34a]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://marqaitrainers.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-6 h-11 rounded-xl shadow-md">
                    <GraduationCap className="h-5 w-5 mr-2" /> Explore Training Portal
                  </Button>
                </a>
                <Link href="/training">
                  <Button variant="outline" className="border-[#16a34a] text-[#16a34a] hover:bg-green-50 font-semibold px-6 h-11 rounded-xl">
                    <Rocket className="h-5 w-5 mr-2" /> View Training Hub
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Infographic Workflow */}
            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] p-6 text-center relative">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                    {/* Glow effect */}
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-300/20 rounded-full blur-2xl" />
                    <GraduationCap className="h-10 w-10 text-white mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">Training → Profile → Job</h3>
                    <p className="text-green-100/80 text-xs mt-1">See how training transforms your career journey</p>
                  </div>

                  <div className="p-6 space-y-0">
                    {[
                      { step: '1', icon: BookOpen, title: 'Enroll in a Course', desc: 'Choose from industry-aligned courses on MarqAI Trainers', color: 'bg-[#16a34a]', line: true },
                      { step: '2', icon: Cpu, title: 'Learn & Complete', desc: 'Interactive lessons with hands-on projects and assessments', color: 'bg-[#34a853]', line: true },
                      { step: '3', icon: Zap, title: 'Skills Auto-Update', desc: 'Your 3 Boxes profile & resume update automatically with new skills', color: 'bg-[#f9ab00]', line: true },
                      { step: '4', icon: Target, title: 'Higher Match Scores', desc: 'AI re-calculates your job match scores — higher visibility to employers', color: 'bg-[#15803d]', line: true },
                      { step: '5', icon: Trophy, title: 'Get Interview Calls', desc: 'More matches = more interviews = faster hiring', color: 'bg-[#166534]', line: false },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                              {item.step}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-[#16a34a]" />
                              <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        {item.line && (
                          <div className="flex ml-[22px] my-2">
                            <div className="w-0.5 h-6 bg-gradient-to-b from-[#16a34a]/40 to-[#16a34a]/10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-gradient-to-b from-[#f5f7fc] via-[#f0f4ff] to-[#f5f7fc] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge className="bg-amber-50 text-amber-600 border-amber-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">What People Say</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Trusted by <span className="bg-gradient-to-r from-[#16a34a] to-[#f9ab00] bg-clip-text text-transparent">Thousands</span></h2>
            <p className="text-gray-500 mt-3 text-sm max-w-lg mx-auto">Real stories from job seekers and employers who transformed their careers and hiring with 3 Boxes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full hover:border-t-4 hover:border-t-amber-400 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 relative">
                    {/* Colorful quote mark */}
                    <div className="absolute top-3 right-4 select-none" aria-hidden="true">
                      <span className="text-6xl font-serif leading-none bg-gradient-to-br from-[#16a34a] to-[#f9ab00] bg-clip-text text-transparent opacity-15">&ldquo;</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-[#f9ab00] text-[#f9ab00]" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5 relative z-10">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16a34a] via-[#34a853] to-[#f9ab00] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
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

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-[#16a34a] via-[#15803d] to-[#166534] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                {/* Floating geometric shapes */}
                <motion.div animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-10 right-10 w-12 h-12 rounded-full border-2 border-white/10" />
                <motion.div animate={{ y: [0, 12, 0], rotate: [0, -90, -180] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute bottom-16 left-16 w-16 h-16 opacity-10">
                  <svg viewBox="0 0 60 52" fill="white"><polygon points="30,0 60,26 30,52 0,26" /></svg>
                </motion.div>
                <motion.div animate={{ y: [0, -8, 0], x: [0, 6, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/3 left-8 w-8 h-8 rounded-lg border-2 border-white/10 rotate-45" />
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/3 right-12 w-6 h-6 rounded-full bg-white/5" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                  <Rocket className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-green-100 font-medium">Start Your Journey Today</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                  Ready to Transform Your <br className="hidden sm:block" />Career with AI?
                </h2>
                <p className="text-green-100/80 text-base max-w-xl mx-auto mb-8">
                  Join 50,000+ job seekers and 5,000+ companies already using 3 Boxes. AI-powered resumes, smart matching, mock interviews, and skill auto-updates — all in one platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/find-jobs">
                    <Button className="bg-white text-[#16a34a] hover:bg-gray-50 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                      <Search className="h-5 w-5 mr-2" /> Find Jobs Now
                    </Button>
                  </Link>
                  <Link href="/corporate">
                    <Button className="bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                      <Building2 className="h-5 w-5 mr-2" /> Hire Talent
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-green-200/60 mt-4">Free to join. No credit card required.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== DOWNLOAD MOBILE APP ===== */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-blue-50/15 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - App Info */}
            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">
                Free Download
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                Get Jobs on the Go with <span className="bg-gradient-to-r from-[#16a34a] to-[#7c66ff] bg-clip-text text-transparent">3 Boxes App</span>
              </h2>
              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                Access your AI-powered career dashboard anywhere. Get instant job alerts, practice AI mock interviews on your phone, update your resume on the go, and never miss an opportunity. Our mobile app puts your entire career journey in your pocket.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { icon: Bell, text: 'Instant push notifications for new job matches and interview requests' },
                  { icon: Brain, text: 'Practice AI mock interviews directly from your mobile device' },
                  { icon: Zap, text: 'One-tap apply to jobs with your AI-optimized resume' },
                  { icon: BarChart3, text: 'Track your application status and match scores in real-time' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-4 w-4 text-[#16a34a]" />
                    </div>
                    <span className="text-sm text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {/* Android APK Download */}
                <a
                  href="/3boxes-jobs-app.apk"
                  download
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#16a34a] to-[#059669] hover:from-[#15803d] hover:to-[#047857] text-white font-semibold px-6 h-12 rounded-xl shadow-lg shadow-green-200/50 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  <Download className="h-5 w-5 mr-2" /> Download Android App
                </a>
                {/* iOS - Coming Soon */}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); toast.info('iOS app is coming soon to the App Store!', { duration: 4000 }) }}
                  className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white font-semibold px-6 h-12 rounded-xl shadow-md transition-all hover:shadow-xl hover:scale-[1.02] relative"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg>
                  App Store (Coming Soon)
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <Smartphone className="h-3 w-3" /> Android 5.0+ required · 20 MB · Install from unknown sources may need to be enabled
              </p>
            </motion.div>

            {/* Right - Phone Mockup */}
            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="flex justify-center">
              <div className="relative">
                {/* Decorative floating shapes */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-6 -left-8 w-12 h-12 rounded-full bg-green-200/40 blur-sm" />
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-4 -right-6 w-10 h-10 rounded-xl bg-amber-200/40 rotate-45 blur-sm" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/3 -right-8 w-8 h-8 rounded-full bg-purple-200/30 blur-sm" />

                {/* Phone frame */}
                <div className="w-[280px] h-[560px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl relative">
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-20" />
                  <div className="w-full h-full bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-[2.4rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 pt-4 pb-2">
                      <span className="text-xs text-white/70 font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-white/70" />
                        <div className="w-6 h-3 border border-white/70 rounded-sm relative">
                          <div className="absolute inset-0.5 bg-white/70 rounded-sm" style={{width: '70%'}} />
                        </div>
                      </div>
                    </div>
                    {/* App content */}
                    <div className="px-5 pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white font-bold text-sm">3 Boxes Jobs</span>
                      </div>
                      <h3 className="text-white text-lg font-bold mb-1">Hello, Priya!</h3>
                      <p className="text-green-100/70 text-xs mb-3">3 new job matches today</p>
                      {/* Mini job cards */}
                      <div className="space-y-2">
                        {[
                          { title: 'Senior React Dev', company: 'Google', salary: '₹25L-40L' },
                          { title: 'Data Scientist', company: 'Amazon', salary: '₹20L-35L' },
                        ].map((job, i) => (
                          <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white text-xs font-semibold">{job.title}</p>
                                <p className="text-green-100/60 text-[10px]">{job.company}</p>
                              </div>
                              <span className="text-green-300 text-[10px] font-bold">{job.salary}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Feature grid - showing all 8 features */}
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {[
                          { icon: Search, label: 'Find Jobs' },
                          { icon: Brain, label: 'AI Interview' },
                          { icon: FileText, label: 'CV Manager' },
                          { icon: Target, label: 'Skill Gap' },
                          { icon: Target, label: 'Job Fit' },
                          { icon: GraduationCap, label: 'Training' },
                          { icon: BarChart3, label: 'Analytics' },
                          { icon: User, label: 'Profile' },
                        ].map((action, i) => (
                          <div key={i} className="bg-white/10 rounded-lg p-1.5 text-center">
                            <action.icon className="h-3.5 w-3.5 text-white mx-auto mb-0.5" />
                            <span className="text-[8px] text-green-100/80 leading-tight">{action.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Bottom nav */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md px-4 py-3">
                      <div className="flex items-center justify-around">
                        {[
                          { icon: Briefcase, active: true },
                          { icon: Search, active: false },
                          { icon: Brain, active: false },
                          { icon: User, active: false },
                        ].map((nav, i) => (
                          <nav.icon key={i} className={`h-4 w-4 ${nav.active ? 'text-green-300' : 'text-white/50'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative dots - enhanced */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-200 to-green-100 rounded-full opacity-30 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-amber-200 to-purple-100 rounded-full opacity-30 blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS TO OTHER PAGES ===== */}
      <section className="py-16 bg-gradient-to-b from-white to-green-50/15 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Explore <span className="bg-gradient-to-r from-[#16a34a] to-[#7c66ff] bg-clip-text text-transparent">More</span></h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">Discover AI features, corporate partnerships, and training opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/corporate">
              <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-green-100/50 transition-all group h-full cursor-pointer overflow-hidden hover:border-t-4 hover:border-t-[#16a34a]">
                <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  {/* Glow effect */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-green-300/20 rounded-full blur-2xl" />
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
              <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-amber-100/50 transition-all group h-full cursor-pointer overflow-hidden hover:border-t-4 hover:border-t-[#f9ab00]">
                <div className="bg-gradient-to-br from-[#f9ab00] to-[#e9a000] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  {/* Glow effect */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-amber-300/20 rounded-full blur-2xl" />
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
              <Card className="border-0 shadow-sm hover:shadow-xl hover:shadow-teal-100/50 transition-all group h-full cursor-pointer overflow-hidden hover:border-t-4 hover:border-t-[#15803d]">
                <div className="bg-gradient-to-br from-[#15803d] to-[#166534] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  {/* Glow effect */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-teal-300/20 rounded-full blur-2xl" />
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
