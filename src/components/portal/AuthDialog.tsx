'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { getDemoCredentials, getEnvironmentLabel, type DemoRole } from '@/lib/demo-credentials'
import { Briefcase, Users, UserCheck, Mail, Lock, User, Building2, ChevronRight } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
  onSuccess?: () => void
}

const roles = [
  { value: 'JOB_SEEKER', label: 'Job Seeker', icon: Users, desc: 'Find your dream job with AI-powered tools', color: 'emerald' },
  { value: 'CORPORATE', label: 'Corporate', icon: Building2, desc: 'Post jobs and find top talent', color: 'teal' },
  { value: 'RECRUITER', label: 'Recruiter', icon: UserCheck, desc: 'Source and manage candidates', color: 'cyan' },
  { value: 'HR_MANAGER', label: 'HR Manager', icon: Users, desc: 'Manage recruitment pipeline', color: 'purple' },
  { value: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck, desc: 'Conduct and review interviews', color: 'blue' },
] as const

const demoIconMap: Record<string, any> = {
  JOB_SEEKER: Users,
  CORPORATE: Building2,
  RECRUITER: UserCheck,
  SUPER_ADMIN: Briefcase,
  ADMIN: Briefcase,
  HR_MANAGER: Users,
  INTERVIEWER: UserCheck,
}

export function AuthDialog({ open, onClose, defaultTab = 'login', onSuccess }: AuthDialogProps) {
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('JOB_SEEKER')
  const { login } = useAuthStore()
  const credentials = useMemo(() => getDemoCredentials(), [])
  const envLabel = useMemo(() => getEnvironmentLabel(), [])

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regIndustry, setRegIndustry] = useState('')
  const [regCompanySize, setRegCompanySize] = useState('')
  const [regSpecialization, setRegSpecialization] = useState('')

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields')
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    setLoginError(null)
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
        onSuccess?.()
        onClose()
      } else {
        const errorMsg = data.error || 'Login failed'
        setLoginError(errorMsg)
        toast.error(errorMsg)
      }
    } catch {
      const errorMsg = 'Network error. Please try again.'
      setLoginError(errorMsg)
      toast.error(errorMsg)
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

  const fillDemo = (role: DemoRole) => {
    const demo = credentials[role]
    if (demo) {
      setLoginEmail(demo.email)
      setLoginPassword(demo.password)
      setLoginError(null)
      toast.info(`Credentials filled for ${demo.label}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-[#16a34a]/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-[#16a34a]" />
            </div>
            3 Boxes Jobs
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="login-email" type="email" placeholder="you@example.com"
                    value={loginEmail} onChange={(e) => { setLoginEmail(e.target.value); setLoginError(null) }} className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="login-password" type="password" placeholder="••••••"
                    value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError(null) }} className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </div>
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-600 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><line x1="8" y2="4.5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="11.5" r="0.75" fill="currentColor"/></svg>
                  {loginError}
                </div>
              )}
            </div>

            <Button className="w-full bg-[#16a34a] hover:bg-[#15803d]" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            <div className="bg-[#16a34a]/5 rounded-lg p-3 text-sm">
              <p className="font-medium text-[#16a34a] mb-2">Quick {envLabel} Access:</p>
              <div className="space-y-1.5">
                {Object.entries(credentials).map(([role, cred]) => {
                  const Icon = demoIconMap[role] || Users
                  return (
                    <button key={role} onClick={() => fillDemo(role as DemoRole)} className="flex items-center gap-2 text-[#16a34a] hover:text-[#15803d] w-full text-left">
                      <Icon className="h-3.5 w-3.5" /> {cred.label}: {cred.email}
                    </button>
                  )
                })}
              </div>
              <p className="text-[#16a34a]/70 mt-1">Password: demo123</p>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">I am a...</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((role) => (
                  <Card key={role.value}
                    className={`cursor-pointer transition-all ${selectedRole === role.value ? `border-[#16a34a] bg-[#16a34a]/5 ring-1 ring-[#16a34a]` : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedRole(role.value)}>
                    <CardContent className="p-3 text-center">
                      <role.icon className={`h-6 w-6 mx-auto mb-1 ${selectedRole === role.value ? 'text-[#16a34a]' : 'text-gray-400'}`} />
                      <div className={`text-xs font-medium ${selectedRole === role.value ? 'text-[#16a34a]' : 'text-gray-600'}`}>
                        {role.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="reg-name">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="reg-name" placeholder="Your full name" value={regName}
                    onChange={(e) => setRegName(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="reg-email">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="reg-email" type="email" placeholder="you@example.com" value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="reg-password">Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input id="reg-password" type="password" placeholder="Min 6 characters" value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)} className="pl-9" />
                </div>
              </div>

              {selectedRole === 'CORPORATE' && (
                <>
                  <div>
                    <Label>Company Name *</Label>
                    <Input placeholder="Your company name" value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Industry</Label>
                      <Select value={regIndustry} onValueChange={setRegIndustry}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <Label>Company Size</Label>
                      <Select value={regCompanySize} onValueChange={setRegCompanySize}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
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
                </>
              )}

              {selectedRole === 'RECRUITER' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Specialization</Label>
                    <Select value={regSpecialization} onValueChange={setRegSpecialization}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT & Software</SelectItem>
                        <SelectItem value="Finance">Finance & Banking</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full bg-[#16a34a] hover:bg-[#15803d]" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
