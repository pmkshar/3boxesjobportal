'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Briefcase, X, Mail, Lock, User, ChevronDown, Menu, Search,
} from 'lucide-react'
import { ThreeBoxesLogo3D } from './LandingPage'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PortalNavbar() {
  const { user, isAuthenticated, login: authLogin } = useAuthStore()
  const [authView, setAuthView] = useState<'none' | 'login' | 'register'>('none')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('JOB_SEEKER')
  const [regLoading, setRegLoading] = useState(false)

  const openLogin = () => setAuthView('login')
  const openRegister = () => setAuthView('register')
  const closeAuth = () => setAuthView('none')

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error('Please fill in all fields'); return }
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
        closeAuth()
      } else { toast.error(data.error || 'Login failed') }
    } catch { toast.error('Network error') }
    finally { setLoginLoading(false) }
  }

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) { toast.error('Please fill in all fields'); return }
    setRegLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole }),
      })
      const data = await res.json()
      if (res.ok) {
        authLogin(data.user, data.token)
        toast.success(`Welcome, ${data.user.name}!`)
        closeAuth()
      } else { toast.error(data.error || 'Registration failed') }
    } catch { toast.error('Network error') }
    finally { setRegLoading(false) }
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/find-jobs', label: 'Find Jobs' },
    { href: '/corporate', label: 'Companies' },
    { href: '/ai-features', label: 'AI Features' },
    { href: '/training', label: 'Training' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#166534] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <ThreeBoxesLogo3D size={44} />
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-white leading-tight tracking-tight">3 Boxes <span className="text-green-300">Jobs</span></span>
                  <span className="text-[10px] text-green-200/70 leading-tight tracking-wider uppercase font-medium">Skills · Resume · Career</span>
                </div>
              </Link>
              <div className="hidden lg:flex items-center gap-1 text-sm">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-white/15 text-white'
                        : 'text-green-100/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/15 text-white border-0 rounded-full px-3 py-0.5 text-xs font-medium">
                    {user.role === 'JOB_SEEKER' ? 'Job Seeker' : user.role === 'CORPORATE' ? 'Employer' : 'Admin'}
                  </Badge>
                  <Link href="/">
                    <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold shadow-md text-sm">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="text-green-100 hover:text-white hover:bg-white/10" onClick={openLogin}>
                    Login
                  </Button>
                  <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold shadow-md" onClick={openRegister}>
                    Register Free
                  </Button>
                </div>
              )}
              {/* Mobile menu toggle */}
              <button
                className="lg:hidden text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-white/10 mt-2 pt-3">
              <div className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-white/15 text-white'
                        : 'text-green-100/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ===== INLINE AUTH PANEL ===== */}
      <AnimatePresence>
        {authView !== 'none' && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex"
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 bg-black/30 backdrop-blur-sm" onClick={closeAuth} />
            <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
              <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#16a34a]/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-[#16a34a]" />
                  </div>
                  <span className="font-bold text-gray-900">{authView === 'login' ? 'Sign In' : 'Create Account'}</span>
                </div>
                <button onClick={closeAuth} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 px-6 py-6">
                {authView === 'login' ? (
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
                    <Button className="w-full h-11 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl text-sm" disabled={loginLoading} onClick={handleLogin}>
                      {loginLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <p className="text-sm text-gray-500 text-center">Don&apos;t have an account? <button className="text-[#16a34a] font-semibold hover:underline" onClick={openRegister}>Register Free</button></p>
                    <div className="bg-green-50 rounded-xl p-3 text-xs text-gray-600">
                      <p className="font-semibold text-[#16a34a] mb-1">Demo Accounts:</p>
                      <p>Job Seeker: seeker@3boxes.com / demo123</p>
                      <p>Corporate: corporate@3boxes.com / demo123</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Join 3 Boxes Jobs</h2>
                      <p className="text-sm text-gray-500 mt-1">Start your AI-powered career journey today</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter your full name" value={regName}
                          onChange={(e) => setRegName(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="you@example.com" value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="Create a strong password" value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)} className="pl-10 h-11 border-gray-200 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">I am a...</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {[
                          { value: 'JOB_SEEKER', label: 'Job Seeker', icon: Briefcase },
                          { value: 'CORPORATE', label: 'Employer', icon: Building2Icon },
                        ].map((role) => (
                          <button key={role.value} onClick={() => setRegRole(role.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              regRole === role.value ? 'border-[#16a34a] bg-green-50 text-[#16a34a]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                            <role.icon className="h-4 w-4" />
                            {role.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full h-11 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl text-sm" disabled={regLoading} onClick={handleRegister}>
                      {regLoading ? 'Creating Account...' : 'Create Free Account'}
                    </Button>
                    <p className="text-sm text-gray-500 text-center">Already have an account? <button className="text-[#16a34a] font-semibold hover:underline" onClick={openLogin}>Sign In</button></p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Simple building icon for register form
function Building2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22V12h6v10" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  )
}
