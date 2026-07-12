'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { HeroIllustration, JobMatchIllustration, ResumeIllustration, InterviewIllustration, SkillsIllustration, GrowthIllustration, CollabIllustration } from './Illustrations'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Briefcase, Brain, FileText, Users, BarChart3, GraduationCap,
  ArrowRight, Star, ChevronRight, Sparkles, Zap, Target, Award,
  CheckCircle2, MapPin, Search, Building2, TrendingUp, Laptop,
  Heart, Shield, Clock, BookOpen, Code, PieChart, UserCheck,
  IndianRupee, Globe, ChevronDown, Layers, Box, Trophy, Rocket,
  PenTool, MessageSquare, Cpu, Lightbulb, Handshake, Wifi, X,
  Mail, Lock, User, Bookmark, ArrowLeft, CalendarDays, List, LayoutGrid, Facebook, Linkedin, Twitter, Smartphone, Download, Apple, Plus, Phone,
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
  const [authView, setAuthView] = useState<'none' | 'login' | 'register'>('none')
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchExp, setSearchExp] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searching, setSearching] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const { user, isAuthenticated, login: authLogin } = useAuthStore()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regIndustry, setRegIndustry] = useState('')
  const [regCompanySize, setRegCompanySize] = useState('')
  const [regSpecialization, setRegSpecialization] = useState('')
  const [regRole, setRegRole] = useState('JOB_SEEKER')
  const [regLoading, setRegLoading] = useState(false)

  const openRegister = () => setAuthView('register')
  const openLogin = () => setAuthView('login')
  const closeAuth = () => setAuthView('none')

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

  const getCompanyInitial = (name?: string) => name ? name.charAt(0).toUpperCase() : 'C'

  const companyColors = [
    'bg-[#16a34a]', 'bg-[#34a853]', 'bg-[#f9ab00]', 'bg-[#d93025]',
    'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
  ]

  const getCompanyColor = (name?: string) => {
    if (!name) return companyColors[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return companyColors[Math.abs(hash) % companyColors.length]
  }

  // Handle login
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields')
      return
    }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        authLogin(data.user, data.token)
        toast.success(`Welcome back, ${data.user.name}!`)
        setAuthView('none')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle register
  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all required fields')
      return
    }
    if (regRole === 'CORPORATE' && !regCompany) {
      toast.error('Company name is required for corporate accounts')
      return
    }
    setRegLoading(true)
    try {
      const body: any = {
        name: regName, email: regEmail, password: regPassword, role: regRole,
        companyName: regCompany, industry: regIndustry, companySize: regCompanySize,
        specialization: regSpecialization,
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Registration successful! Please login.')
        setAuthView('login')
        setLoginEmail(regEmail)
        setLoginPassword(regPassword)
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setRegLoading(false)
    }
  }

  // Fill demo credentials
  const fillDemo = (role: string) => {
    const demoAccounts: Record<string, { email: string; password: string }> = {
      JOB_SEEKER: { email: 'seeker@3boxes.com', password: 'demo123' },
      CORPORATE: { email: 'corp@3boxes.com', password: 'demo123' },
      RECRUITER: { email: 'recruiter@3boxes.com', password: 'demo123' },
      SUPER_ADMIN: { email: 'superadmin@3boxes.com', password: 'demo123' },
      ADMIN: { email: 'admin@3boxes.com', password: 'demo123' },
      HR_MANAGER: { email: 'hr@3boxes.com', password: 'demo123' },
      INTERVIEWER: { email: 'interviewer@3boxes.com', password: 'demo123' },
    }
    const demo = demoAccounts[role]
    if (demo) {
      setLoginEmail(demo.email)
      setLoginPassword(demo.password)
      toast.info(`Demo credentials filled for ${role.replace('_', ' ')}`)
    }
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

      {/* ===== INLINE AUTH PANEL (slides in from right) ===== */}
      <AnimatePresence>
        {authView !== 'none' && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 bg-black/30 backdrop-blur-sm"
              onClick={closeAuth}
            />
            {/* Auth Panel */}
            <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
              {/* Panel Header */}
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#16a34a]/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-[#16a34a]" />
                  </div>
                  <span className="font-bold text-gray-900">
                    {authView === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                </div>
                <button onClick={closeAuth} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 px-6 py-6">
                {authView === 'login' ? (
                  /* ===== LOGIN FORM ===== */
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                      <p className="text-sm text-gray-500 mt-1">Sign in to access your AI-powered career dashboard</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="you@example.com" value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Password</Label>
                        <button className="text-xs font-medium text-[#16a34a] hover:underline">Forgot password?</button>
                      </div>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Enter your password" value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                      </div>
                    </div>

                    <Button className="w-full h-11 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl text-sm"
                      onClick={handleLogin} disabled={loginLoading}>
                      {loginLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">Sign In <ArrowRight className="h-4 w-4" /></span>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                      <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">Quick Demo Access</span></div>
                    </div>

                    {/* Demo accounts */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#16a34a]" /> Try any role instantly:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { role: 'JOB_SEEKER', label: 'Job Seeker', icon: Users },
                          { role: 'CORPORATE', label: 'Corporate', icon: Building2 },
                          { role: 'RECRUITER', label: 'Recruiter', icon: UserCheck },
                          { role: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield },
                          { role: 'HR_MANAGER', label: 'HR Manager', icon: Users },
                          { role: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck },
                        ].map((demo) => (
                          <button key={demo.role} onClick={() => fillDemo(demo.role)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:shadow-sm border border-transparent hover:border-gray-200 bg-white">
                            <demo.icon className="h-3.5 w-3.5 shrink-0 text-[#16a34a]" />
                            <span className="text-xs font-medium text-gray-700 truncate">{demo.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Lock className="h-3 w-3" /> Password: demo123</p>
                    </div>

                    <div className="text-center text-sm text-gray-500 mt-4">
                      Don&apos;t have an account?{' '}
                      <button onClick={() => setAuthView('register')} className="font-semibold text-[#16a34a] hover:underline">Sign up free</button>
                    </div>
                  </div>
                ) : (
                  /* ===== REGISTER FORM ===== */
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
                      <p className="text-sm text-gray-500 mt-1">Create your account and unlock AI-powered career tools</p>
                    </div>

                    {/* Role selection */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a...</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'JOB_SEEKER', label: 'Job Seeker', icon: Users },
                          { value: 'CORPORATE', label: 'Corporate', icon: Building2 },
                          { value: 'RECRUITER', label: 'Recruiter', icon: UserCheck },
                          { value: 'HR_MANAGER', label: 'HR Manager', icon: Users },
                          { value: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck },
                        ].map((role) => (
                          <Card key={role.value}
                            className={`cursor-pointer transition-all ${regRole === role.value ? 'border-2 bg-green-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                            style={{ borderColor: regRole === role.value ? '#22c55e' : undefined }}
                            onClick={() => setRegRole(role.value)}>
                            <CardContent className="p-3 text-center">
                              <role.icon className={`h-5 w-5 mx-auto mb-1 ${regRole === role.value ? 'text-[#16a34a]' : 'text-gray-400'}`} />
                              <div className={`text-xs font-medium ${regRole === role.value ? 'text-[#16a34a]' : 'text-gray-600'}`}>{role.label}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Your full name" value={regName} onChange={(e) => setRegName(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email *</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="you@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Password *</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>

                    {regRole === 'CORPORATE' && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Company Name *</Label>
                          <Input placeholder="Your company name" value={regCompany} onChange={(e) => setRegCompany(e.target.value)} className="mt-1.5 h-11 border-gray-200 rounded-xl text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Industry</Label>
                            <select className="mt-1.5 w-full h-11 border border-gray-200 rounded-xl px-3 text-sm bg-white" value={regIndustry} onChange={(e) => setRegIndustry(e.target.value)}>
                              <option value="">Select</option>
                              <option value="IT">Information Technology</option>
                              <option value="Finance">Finance & Banking</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Education">Education</option>
                              <option value="Manufacturing">Manufacturing</option>
                              <option value="Retail">Retail & E-commerce</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Company Size</Label>
                            <select className="mt-1.5 w-full h-11 border border-gray-200 rounded-xl px-3 text-sm bg-white" value={regCompanySize} onChange={(e) => setRegCompanySize(e.target.value)}>
                              <option value="">Select</option>
                              <option value="1-10">1-10</option>
                              <option value="11-50">11-50</option>
                              <option value="51-200">51-200</option>
                              <option value="201-500">201-500</option>
                              <option value="501-1000">501-1000</option>
                              <option value="1000+">1000+</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {regRole === 'RECRUITER' && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Specialization</Label>
                        <select className="mt-1.5 w-full h-11 border border-gray-200 rounded-xl px-3 text-sm bg-white" value={regSpecialization} onChange={(e) => setRegSpecialization(e.target.value)}>
                          <option value="">Select</option>
                          <option value="IT">IT & Software</option>
                          <option value="Finance">Finance & Banking</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Marketing">Marketing</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    )}

                    <Button className="w-full h-11 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl text-sm"
                      onClick={handleRegister} disabled={regLoading}>
                      {regLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">Create Account <Rocket className="h-4 w-4" /></span>
                      )}
                    </Button>

                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                      By creating an account, you agree to our <button className="underline hover:text-gray-600">Terms of Service</button> and <button className="underline hover:text-gray-600">Privacy Policy</button>
                    </p>

                    <div className="text-center text-sm text-gray-500">
                      Already have an account?{' '}
                      <button onClick={() => setAuthView('login')} className="font-semibold text-[#16a34a] hover:underline">Sign in</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* ===== SEARCH RESULTS (shown after search) - TILES VIEW ===== */}
      {showSearchResults && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Search Results {searchResults.length > 0 && <span className="text-[#16a34a]">({searchResults.length})</span>}
              </h2>
              <Button variant="ghost" className="text-gray-500 text-sm" onClick={() => { setShowSearchResults(false); setSelectedJob(null) }}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            {searching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {searchResults.map((job: any, i: number) => (
                  <motion.div key={job.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <Card className={`hover:shadow-lg transition-all cursor-pointer border-gray-100 group ${selectedJob?.id === job.id ? 'ring-[#16a34a] border-[#16a34a]' : 'hover:border-emerald-200'}`}
                      onClick={() => setSelectedJob(job)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-11 h-11 rounded-xl ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform`}>
                            {getCompanyInitial(job.corporate?.companyName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-[#16a34a] transition-colors line-clamp-2">{job.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{job.corporate?.companyName}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{job.location || 'Remote'}</span>
                            {job.isRemote && <Badge className="text-[10px] px-1 py-0 bg-teal-50 text-teal-700 border-teal-100">WFH</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <IndianRupee className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-[#16a34a]">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          </div>
                          {job.experienceMin && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span>{job.experienceMin}-{job.experienceMax} Yrs</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills?.split(',').slice(0, 3).map((s: string) => (
                            <Badge key={s.trim()} variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-100">{s.trim()}</Badge>
                          ))}
                          {job.skills?.split(',').length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-500">+{job.skills.split(',').length - 3}</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">{job.jobType || 'Full Time'}</Badge>
                          <span className="text-xs font-medium text-[#16a34a] flex items-center gap-0.5 group-hover:text-emerald-700">
                            View <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== FEATURED JOBS (dynamic from API) - TILE VIEW (Naukri Style) ===== */}
      <section id="jobs" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Featured Jobs</h2>
            <Button variant="ghost" className="text-[#16a34a] text-sm font-semibold" onClick={isAuthenticated ? undefined : openLogin}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {jobs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-32 bg-gray-200 rounded" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {jobs.slice(0, 8).map((job: any, i: number) => (
                <motion.div
                  key={job.id}
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className={`hover:shadow-lg transition-all cursor-pointer border-gray-100 group ${selectedJob?.id === job.id ? 'ring-[#16a34a] border-[#16a34a]' : 'hover:border-emerald-200'}`}
                    onClick={() => setSelectedJob(job)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-xl ${getCompanyColor(job.corporate?.companyName)} flex items-center justify-center text-white font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform`}>
                          {getCompanyInitial(job.corporate?.companyName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-[#16a34a] transition-colors line-clamp-2">{job.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{job.corporate?.companyName}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{job.location || 'Remote'}</span>
                          {job.isRemote && <Badge className="text-[10px] px-1 py-0 bg-teal-50 text-teal-700 border-teal-100">WFH</Badge>}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <IndianRupee className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-[#16a34a]">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </div>
                        {job.experienceMin && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span>{job.experienceMin}-{job.experienceMax} Yrs</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{job.postedDate ? timeAgo(job.postedDate) : 'Recently'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.skills?.split(',').slice(0, 3).map((s: string) => (
                          <Badge key={s.trim()} variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-100">{s.trim()}</Badge>
                        ))}
                        {job.skills?.split(',').length > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-500">+{job.skills.split(',').length - 3}</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">{job.jobType || 'Full Time'}</Badge>
                        <span className="text-xs font-medium text-[#16a34a] flex items-center gap-0.5 group-hover:text-emerald-700">
                          View <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== FULL-PAGE JOB DETAIL (overlay replaces page content) ===== */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Sticky top action bar */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#16a34a] to-[#15803d] py-3 px-4 sm:px-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-white/90 hover:text-white text-sm transition-colors group bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
              </button>
              <div className="flex-1" />
              <Button className="bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-semibold h-9 px-5 shadow-md" onClick={() => {
                if (!isAuthenticated) { openLogin() } else { toast.success('Application feature available in dashboard') }
              }}>
                Apply Now
              </Button>
              <Button variant="outline" className="h-9 px-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hero Header - Green banner */}
          <section className="relative bg-gradient-to-r from-[#16a34a] to-[#15803d] pb-8 pt-4 overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${getCompanyColor(selectedJob.corporate?.companyName)} flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0 shadow-lg ring-2 ring-white/30`}>
                  {getCompanyInitial(selectedJob.corporate?.companyName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedJob.title}</h2>
                  <p className="text-white/80 mt-0.5 text-sm sm:text-base">{selectedJob.corporate?.companyName}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/70 mt-2">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {selectedJob.location || 'Remote'}</span>
                    {selectedJob.experienceMin && <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {selectedJob.experienceMin}-{selectedJob.experienceMax} Yrs</span>}
                    <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4" /> {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                    {selectedJob.postedDate && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {timeAgo(selectedJob.postedDate)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-[rgba(22,163,74,0.3)] text-white border-0 rounded-full px-4 py-1">{selectedJob.jobType}</Badge>
                {selectedJob.isRemote && <Badge className="bg-[rgba(52,168,83,0.3)] text-white border-0 rounded-full px-4 py-1">Remote Friendly</Badge>}
                {selectedJob.openings && <Badge className="bg-[rgba(249,171,0,0.3)] text-white border-0 rounded-full px-4 py-1"><Users className="h-3 w-3 mr-1" />{selectedJob.openings} Openings</Badge>}
              </div>
            </div>
          </section>

          {/* Main Content - Two Column Layout */}
          <section className="py-8 bg-[#f5f7fc]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedJob.description && (
                    <Card className="border-[#ecedf2]">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-[#202124] text-lg mb-4">Job Description</h4>
                        <div className="text-[#5f6368] text-[15px] leading-[26px] whitespace-pre-line">{selectedJob.description}</div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedJob.responsibilities && (
                    <Card className="border-[#ecedf2]">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-[#202124] text-lg mb-4">Key Responsibilities</h4>
                        <ul className="space-y-2.5">
                          {selectedJob.responsibilities.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-[#5f6368] text-[15px] leading-[22px]">
                              <CheckCircle2 className="h-5 w-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                              <span>{line.replace(/^[-•*]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {selectedJob.requirements && (
                    <Card className="border-[#ecedf2]">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-[#202124] text-lg mb-4">Skills & Experience</h4>
                        <ul className="space-y-2.5">
                          {selectedJob.requirements.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-[#5f6368] text-[15px] leading-[22px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] flex-shrink-0 mt-2" />
                              <span>{line.replace(/^[-•*]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Share This Job */}
                  <Card className="border-[#ecedf2]">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-[#202124] text-lg mb-4">Share This Job</h4>
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16a34a] text-white text-sm font-medium hover:opacity-90 transition-opacity"><Facebook className="h-4 w-4" /> Facebook</button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#15803d] text-white text-sm font-medium hover:opacity-90 transition-opacity"><Twitter className="h-4 w-4" /> Twitter</button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22c55e] text-white text-sm font-medium hover:opacity-90 transition-opacity"><Linkedin className="h-4 w-4" /> LinkedIn</button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Job Overview Widget */}
                  <Card className="border-[#ecedf2]">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-[#202124] mb-4">Job Overview</h4>
                      <div className="space-y-4">
                        {[
                          { icon: CalendarDays, label: 'Date Posted', value: selectedJob.postedDate ? timeAgo(selectedJob.postedDate) : 'Recently', color: 'text-[#16a34a]' },
                          { icon: Clock, label: 'Expiration', value: '30 days left', color: 'text-[#d93025]' },
                          { icon: MapPin, label: 'Location', value: selectedJob.location || 'Remote', color: 'text-[#34a853]' },
                          { icon: Briefcase, label: 'Job Title', value: selectedJob.title, color: 'text-[#16a34a]' },
                          { icon: Clock, label: 'Hours', value: selectedJob.jobType === 'part-time' ? 'Part Time' : 'Full Time', color: 'text-[#f9ab00]' },
                          { icon: IndianRupee, label: 'Salary', value: formatSalary(selectedJob.salaryMin, selectedJob.salaryMax), color: 'text-[#34a853]' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#f5f7fc] flex items-center justify-center flex-shrink-0">
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <div>
                              <p className="text-xs text-[#5f6368]">{item.label}</p>
                              <p className="text-sm font-medium text-[#202124] truncate max-w-[160px]">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job Skills Widget */}
                  {selectedJob.skills && (
                    <Card className="border-[#ecedf2]">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-[#202124] mb-4">Job Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.split(',').map((s: string) => (
                            <Badge key={s.trim()} className="bg-[#f5f7fc] text-[#5f6368] border border-[#ecedf2] hover:bg-green-50 hover:text-[#16a34a] rounded-md px-3 py-1.5 text-sm font-normal transition-colors">{s.trim()}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Company Info Widget */}
                  <Card className="border-[#ecedf2]">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-[#202124] mb-4">Company Info</h4>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-14 h-14 rounded-xl ${getCompanyColor(selectedJob.corporate?.companyName)} flex items-center justify-center text-white font-bold text-xl`}>
                          {getCompanyInitial(selectedJob.corporate?.companyName)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202124]">{selectedJob.corporate?.companyName}</p>
                          <button className="text-sm text-[#16a34a] hover:underline">View company profile</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { icon: Building2, label: 'Industry', value: 'Technology' },
                          { icon: Users, label: 'Company Size', value: '1,000 - 5,000' },
                          { icon: CalendarDays, label: 'Founded', value: '2010' },
                          { icon: Phone, label: 'Phone', value: '+91 123 456 7890' },
                          { icon: Mail, label: 'Email', value: 'hr@company.com' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm">
                            <item.icon className="h-4 w-4 text-[#5f6368] flex-shrink-0" />
                            <span className="text-[#5f6368] min-w-[90px]">{item.label}:</span>
                            <span className="font-medium text-[#202124]">{item.value}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-2">
                          <button className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Facebook className="h-3.5 w-3.5" /></button>
                          <button className="w-8 h-8 rounded-full bg-[#15803d] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Twitter className="h-3.5 w-3.5" /></button>
                          <button className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Linkedin className="h-3.5 w-3.5" /></button>
                          <button className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white hover:opacity-80 transition-opacity"><Globe className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Apply CTA Card */}
                  <Card className="border-[#ecedf2] bg-gradient-to-br from-[#16a34a] to-[#15803d]">
                    <CardContent className="p-5 text-center">
                      <h4 className="font-semibold text-white mb-2">Interested in this job?</h4>
                      <p className="text-white/70 text-sm mb-4">Apply now and get a response within 48 hours</p>
                      <Button className="w-full bg-[#f9ab00] hover:bg-[#e9a000] text-[#202124] font-semibold h-11 shadow-md" onClick={() => {
                        if (!isAuthenticated) { openLogin() } else { toast.success('Application feature available in dashboard') }
                      }}>
                        Apply For This Job
                      </Button>
                      <Button variant="outline" className="w-full mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20 h-10">
                        <Bookmark className="h-4 w-4 mr-2" /> Save Job
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
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

// ===== OLD LOGO KEPT FOR BACKWARD COMPAT =====
export function ThreeBoxesLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <ThreeBoxesLogo3D size={size} className={className} />
}
