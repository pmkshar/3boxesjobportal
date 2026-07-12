'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Briefcase, Users, UserCheck, Mail, Lock, User, Building2, ChevronRight,
  Brain, FileText, Target, BarChart3, GraduationCap, Sparkles, ArrowRight,
  Shield, Zap, Award, CheckCircle2, Globe, TrendingUp, Rocket,
} from 'lucide-react'
import { HeroIllustration, JobMatchIllustration, ResumeIllustration, InterviewIllustration, SkillsIllustration, GrowthIllustration } from './Illustrations'

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

const roles = [
  { value: 'JOB_SEEKER', label: 'Job Seeker', icon: Users, desc: 'Find your dream job with AI-powered tools', color: 'emerald' },
  { value: 'CORPORATE', label: 'Corporate', icon: Building2, desc: 'Post jobs and find top talent', color: 'teal' },
  { value: 'RECRUITER', label: 'Recruiter', icon: UserCheck, desc: 'Source and manage candidates', color: 'cyan' },
  { value: 'HR_MANAGER', label: 'HR Manager', icon: Users, desc: 'Manage recruitment pipeline', color: 'purple' },
  { value: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck, desc: 'Conduct and review interviews', color: 'blue' },
] as const

const stats = [
  { value: '50K+', label: 'Active Jobs', icon: Briefcase },
  { value: '10K+', label: 'Companies', icon: Building2 },
  { value: '2M+', label: 'Job Seekers', icon: Users },
  { value: '95%', label: 'Match Rate', icon: Target },
]

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Smart algorithms connect you with perfect opportunities' },
  { icon: FileText, title: 'AI Resume Builder', desc: 'Auto-generate and enhance your resume instantly' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Upskill with AI-recommended courses' },
  { icon: BarChart3, title: 'Career Analytics', desc: 'Track growth with real-time insights' },
]

const illustrations = [HeroIllustration, JobMatchIllustration, ResumeIllustration, InterviewIllustration, SkillsIllustration, GrowthIllustration]

export function IntegratedLoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('JOB_SEEKER')
  const { login } = useAuthStore()

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regIndustry, setRegIndustry] = useState('')
  const [regCompanySize, setRegCompanySize] = useState('')
  const [regSpecialization, setRegSpecialization] = useState('')

  // Illustration carousel
  const [currentIllustration, setCurrentIllustration] = useState(0)

  // Auto-rotate illustrations
  useState(() => {
    const interval = setInterval(() => {
      setCurrentIllustration((prev) => (prev + 1) % illustrations.length)
    }, 5000)
    return () => clearInterval(interval)
  })

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        login(data.user, data.token)
        toast.success(`Welcome back, ${data.user.name}!`)
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all required fields')
      return
    }
    if (selectedRole === 'CORPORATE' && !regCompany) {
      toast.error('Company name is required for corporate accounts')
      return
    }
    setLoading(true)
    try {
      const body: any = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: selectedRole,
        companyName: regCompany,
        industry: regIndustry,
        companySize: regCompanySize,
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
        setTab('login')
        setLoginEmail(regEmail)
        setLoginPassword(regPassword)
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  const CurrentIllustration = illustrations[currentIllustration]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ============ LEFT SIDE - Infographics & Branding ============ */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${CG[900]} 0%, ${CG[800]} 40%, ${CG[700]} 100%)` }}>

        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${CG[400]} 0%, transparent 70%)` }} />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-8"
            style={{ background: `radial-gradient(circle, ${CG[500]} 0%, transparent 70%)` }} />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
            style={{ background: `radial-gradient(circle, ${CG[300]} 0%, transparent 70%)` }} />

          {/* Floating dots pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, ${CG[400]}30 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top - Logo & Branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: CG[400] }} />
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: CG[300] }} />
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: CG[200] }} />
              </div>
              <span className="text-2xl font-bold text-white">
                3 Boxes <span style={{ color: CG[300] }}>Jobs</span>
              </span>
            </div>
            <p className="text-sm ml-8" style={{ color: CG[300] }}>
              AI-Powered Career Platform
            </p>
          </motion.div>

          {/* Middle - Rotating Illustration */}
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIllustration}
                initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.85, rotateY: -15 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
              >
                <CurrentIllustration className="w-full h-auto drop-shadow-2xl" />
              </motion.div>
            </AnimatePresence>

            {/* Illustration dots navigation */}
            <div className="flex items-center gap-2 mt-6">
              {illustrations.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIllustration(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === currentIllustration ? '24px' : '8px',
                    height: '8px',
                    backgroundColor: i === currentIllustration ? CG[300] : `${CG[400]}50`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom - Stats & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
                    style={{ backgroundColor: `${CG[400]}20` }}>
                    <stat.icon className="h-5 w-5" style={{ color: CG[300] }} />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs" style={{ color: CG[300] }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full"
                  style={{ backgroundColor: `${CG[400]}15`, border: `1px solid ${CG[400]}25` }}
                >
                  <feat.icon className="h-3.5 w-3.5" style={{ color: CG[300] }} />
                  <span className="text-xs font-medium" style={{ color: CG[200] }}>{feat.title}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-xs" style={{ color: `${CG[300]}80` }}>
              <Shield className="h-3.5 w-3.5" />
              <span>Trusted by 5,000+ companies worldwide. Your data is secure and encrypted.</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ============ RIGHT SIDE - Login/Register Form ============ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CG[600] }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CG[500] }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CG[400] }} />
            </div>
            <span className="text-lg font-bold text-gray-900">
              3 Boxes <span style={{ color: CG[600] }}>Jobs</span>
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8">
          <div className="w-full max-w-md mx-auto">
            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tab === 'login' ? 'Welcome Back!' : 'Get Started'}
              </h1>
              <p className="text-gray-500 text-sm">
                {tab === 'login'
                  ? 'Sign in to access your AI-powered career dashboard'
                  : 'Create your account and unlock AI-powered career tools'}
              </p>
            </motion.div>

            {/* Tab Switcher */}
            <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setTab('login')}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: tab === 'login' ? 'white' : 'transparent',
                  color: tab === 'login' ? CG[700] : '#6b7280',
                  boxShadow: tab === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: tab === 'register' ? 'white' : 'transparent',
                  color: tab === 'register' ? CG[700] : '#6b7280',
                  boxShadow: tab === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Email */}
                  <div>
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-11 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-sm"
                        style={{ '--tw-ring-color': `${CG[500]}30` } as any}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                      <button className="text-xs font-medium hover:underline" style={{ color: CG[600] }}>
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 h-11 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-sm"
                        style={{ '--tw-ring-color': `${CG[500]}30` } as any}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    className="w-full h-11 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg"
                    style={{ backgroundColor: CG[600] }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = CG[700] }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = CG[600] }}
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-400">Quick Demo Access</span>
                    </div>
                  </div>

                  {/* Demo Accounts */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" style={{ color: CG[600] }} />
                      Try any role instantly:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { role: 'JOB_SEEKER', label: 'Job Seeker', icon: Users, email: 'seeker@3boxes.com' },
                        { role: 'CORPORATE', label: 'Corporate', icon: Building2, email: 'corp@3boxes.com' },
                        { role: 'RECRUITER', label: 'Recruiter', icon: UserCheck, email: 'recruiter@3boxes.com' },
                        { role: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield, email: 'superadmin@3boxes.com' },
                        { role: 'HR_MANAGER', label: 'HR Manager', icon: Users, email: 'hr@3boxes.com' },
                        { role: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck, email: 'interviewer@3boxes.com' },
                      ].map((demo) => (
                        <button
                          key={demo.role}
                          onClick={() => fillDemo(demo.role)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200"
                          style={{ backgroundColor: 'white' }}
                        >
                          <demo.icon className="h-3.5 w-3.5 shrink-0" style={{ color: CG[600] }} />
                          <span className="text-xs font-medium text-gray-700 truncate">{demo.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Password: demo123
                    </p>
                  </div>

                  {/* Mobile-only features */}
                  <div className="lg:hidden mt-6">
                    <div className="flex items-center gap-4 justify-center">
                      {features.slice(0, 3).map((feat) => (
                        <div key={feat.title} className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                            style={{ backgroundColor: `${CG[600]}10` }}>
                            <feat.icon className="h-4 w-4" style={{ color: CG[600] }} />
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">{feat.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ============ REGISTER TAB ============ */
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Role Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a...</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roles.map((role) => (
                        <Card
                          key={role.value}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedRole === role.value
                              ? 'border-2 bg-green-50/50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          style={{
                            borderColor: selectedRole === role.value ? CG[500] : undefined,
                          }}
                          onClick={() => setSelectedRole(role.value)}
                        >
                          <CardContent className="p-3 text-center">
                            <role.icon
                              className={`h-6 w-6 mx-auto mb-1.5`}
                              style={{ color: selectedRole === role.value ? CG[600] : '#9ca3af' }}
                            />
                            <div
                              className="text-xs font-medium"
                              style={{ color: selectedRole === role.value ? CG[700] : '#6b7280' }}
                            >
                              {role.label}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reg-name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-name"
                          placeholder="Your full name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="pl-10 h-11 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-sm"
                          style={{ '--tw-ring-color': `${CG[500]}30` } as any}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">Email *</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10 h-11 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-sm"
                          style={{ '--tw-ring-color': `${CG[500]}30` } as any}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">Password *</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Min 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10 h-11 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent text-sm"
                          style={{ '--tw-ring-color': `${CG[500]}30` } as any}
                        />
                      </div>
                    </div>

                    {/* Corporate-specific fields */}
                    {selectedRole === 'CORPORATE' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Company Name *</Label>
                          <Input
                            placeholder="Your company name"
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            className="mt-1.5 h-11 border-gray-200 rounded-xl text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Industry</Label>
                            <Select value={regIndustry} onValueChange={setRegIndustry}>
                              <SelectTrigger className="mt-1.5 h-11 border-gray-200 rounded-xl text-sm">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IT">Information Technology</SelectItem>
                                <SelectItem value="Finance">Finance & Banking</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Retail">Retail & E-commerce</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Company Size</Label>
                            <Select value={regCompanySize} onValueChange={setRegCompanySize}>
                              <SelectTrigger className="mt-1.5 h-11 border-gray-200 rounded-xl text-sm">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-10">1-10</SelectItem>
                                <SelectItem value="11-50">11-50</SelectItem>
                                <SelectItem value="51-200">51-200</SelectItem>
                                <SelectItem value="201-500">201-500</SelectItem>
                                <SelectItem value="501-1000">501-1000</SelectItem>
                                <SelectItem value="1000+">1000+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Recruiter-specific fields */}
                    {selectedRole === 'RECRUITER' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label className="text-sm font-medium text-gray-700">Specialization</Label>
                        <Select value={regSpecialization} onValueChange={setRegSpecialization}>
                          <SelectTrigger className="mt-1.5 h-11 border-gray-200 rounded-xl text-sm">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IT">IT & Software</SelectItem>
                            <SelectItem value="Finance">Finance & Banking</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </div>

                  {/* Create Account Button */}
                  <Button
                    className="w-full h-11 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:shadow-lg"
                    style={{ backgroundColor: CG[600] }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = CG[700] }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = CG[600] }}
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Account <Rocket className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  {/* Terms */}
                  <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <button className="underline hover:text-gray-600">Terms of Service</button>{' '}and{' '}
                    <button className="underline hover:text-gray-600">Privacy Policy</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Switch between tabs at bottom */}
            <div className="mt-8 text-center text-sm text-gray-500">
              {tab === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setTab('register')}
                    className="font-semibold hover:underline"
                    style={{ color: CG[600] }}
                  >
                    Sign up free
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setTab('login')}
                    className="font-semibold hover:underline"
                    style={{ color: CG[600] }}
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2024 3 Boxes Jobs. All rights reserved. AI-Powered Career Platform.
          </p>
        </div>
      </div>
    </div>
  )
}
