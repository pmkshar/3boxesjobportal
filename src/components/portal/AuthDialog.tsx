'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { getDemoCredentials, getEnvironmentLabel, isDemoEnvironment, type DemoRole } from '@/lib/demo-credentials'
import { validatePasswordStrength } from '@/lib/auth'
import { Briefcase, Users, UserCheck, Mail, Lock, User, Building2, ChevronRight, Shield, Smartphone } from 'lucide-react'

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
  const { login, setRequires2FA, clear2FAState, requires2FA, tempToken } = useAuthStore()
  const credentials = useMemo(() => getDemoCredentials(), [])
  const envLabel = useMemo(() => getEnvironmentLabel(), [])
  const showDemo = isDemoEnvironment()

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  // 2FA OTP form
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regIndustry, setRegIndustry] = useState('')
  const [regCompanySize, setRegCompanySize] = useState('')
  const [regSpecialization, setRegSpecialization] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; strength: string; errors: string[] } | null>(null)

  // Clear 2FA state when dialog closes
  useEffect(() => {
    if (!open) {
      clear2FAState()
      setOtpDigits(['', '', '', '', '', ''])
      setLoginError(null)
    }
  }, [open])

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only digits
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1) // Only last digit
    setOtpDigits(newDigits)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  // Password strength checker for registration
  const checkPassword = (pwd: string) => {
    if (!pwd) { setPasswordStrength(null); return }
    const result = validatePasswordStrength(pwd)
    setPasswordStrength({ score: result.score, strength: result.strength, errors: result.errors })
  }

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
        // Check if 2FA is required
        if (data.requires2FA) {
          setRequires2FA(data.tempToken)
          toast.info('Enter the 6-digit code from your authenticator app')
          return
        }
        login(data.user, data.token, data.refreshToken)
        toast.success(`Welcome back, ${data.user.name}!`)
        onSuccess?.()
        onClose()
      } else {
        const errorMsg = data.error || 'Login failed'
        // Show password strength warning if provided
        if (data.warning) {
          toast.warning(data.warning)
        }
        setLoginError(errorMsg)
        toast.error(errorMsg)
      }
    } catch {
      setLoginError('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle 2FA OTP submission
  const handle2FAVerification = async () => {
    const otp = otpDigits.join('')
    if (otp.length !== 6) {
      setLoginError('Please enter the complete 6-digit code')
      toast.error('Please enter the complete 6-digit code')
      return
    }
    setLoading(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp }),
      })
      const data = await res.json()
      if (res.ok) {
        login(data.user, data.token, data.refreshToken)
        toast.success(`Welcome back, ${data.user.name}! 2FA verified ✓`)
        onSuccess?.()
        onClose()
      } else {
        setLoginError(data.error || 'Invalid OTP code')
        toast.error(data.error || 'Invalid OTP code')
        setOtpDigits(['', '', '', '', '', '']) // Reset OTP inputs
      }
    } catch {
      setLoginError('Network error. Please try again.')
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
    // Validate password strength
    const pwdCheck = validatePasswordStrength(regPassword)
    if (!pwdCheck.isValid) {
      toast.error(`Password too weak: ${pwdCheck.errors[0]}`)
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
        const errorMsg = data.error || 'Registration failed'
        if (data.passwordErrors) {
          toast.error(`${errorMsg}: ${data.passwordErrors.join(', ')}`)
        } else {
          toast.error(errorMsg)
        }
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role: DemoRole) => {
    if (!credentials) return
    const demo = credentials[role]
    if (demo) {
      setLoginEmail(demo.email)
      setLoginPassword(demo.password)
      setLoginError(null)
      toast.info(`Credentials filled for ${demo.label}`)
    }
  }

  // Password strength color
  const getStrengthColor = (strength: string) => {
    const colors: Record<string, string> = {
      'weak': 'bg-red-500',
      'fair': 'bg-orange-500',
      'good': 'bg-yellow-500',
      'strong': 'bg-[#f0f8f0]0',
      'very-strong': 'bg-emerald-500',
    }
    return colors[strength] || 'bg-gray-300'
  }

  // 2FA View (shown after successful password check when 2FA is enabled)
  if (requires2FA) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-8 h-8 rounded-lg bg-[#014217]/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[#014217]" />
              </div>
              Two-Factor Authentication
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-[#f0f8f0] border border-[#d8ecd8] rounded-lg p-3 text-sm text-[#066722]">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Enter your authenticator code</span>
              </div>
              <p className="text-[#014217]">Open your authenticator app (Google Authenticator, Authy, 1Password) and enter the 6-digit verification code.</p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-10 h-12 text-center text-lg font-bold border-2 focus:border-[#014217] rounded-lg"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-sm text-red-600">
                {loginError}
              </div>
            )}

            <Button className="w-full bg-[#014217] hover:bg-[#066722]" onClick={handle2FAVerification} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            <button
              onClick={() => { clear2FAState(); setLoginError(null); }}
              className="text-sm text-gray-500 hover:text-gray-700 w-full text-center"
            >
              ← Back to email/password login
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-[#014217]/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-[#014217]" />
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

            <Button className="w-full bg-[#014217] hover:bg-[#066722]" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            {/* Demo quick-fill — only shown on demo site, NOT on production */}
            {showDemo && credentials && (
            <div className="bg-[#014217]/5 rounded-lg p-3 text-sm">
              <p className="font-medium text-[#014217] mb-2">Quick {envLabel} Access:</p>
              <div className="space-y-1.5">
                {Object.entries(credentials).map(([role, cred]) => {
                  const Icon = demoIconMap[role] || Users
                  return (
                    <button key={role} onClick={() => fillDemo(role as DemoRole)} className="flex items-center gap-2 text-[#014217] hover:text-[#066722] w-full text-left">
                      <Icon className="h-3.5 w-3.5" /> {cred.label}: {cred.email}
                    </button>
                  )
                })}
              </div>
              <p className="text-[#014217]/70 mt-1">Password: demo123</p>
            </div>
            )}
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">I am a...</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((role) => (
                  <Card key={role.value}
                    className={`cursor-pointer transition-all ${selectedRole === role.value ? `border-[#014217] bg-[#014217]/5 ring-1 ring-[#014217]` : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedRole(role.value)}>
                    <CardContent className="p-3 text-center">
                      <role.icon className={`h-6 w-6 mx-auto mb-1 ${selectedRole === role.value ? 'text-[#014217]' : 'text-gray-400'}`} />
                      <div className={`text-xs font-medium ${selectedRole === role.value ? 'text-[#014217]' : 'text-gray-600'}`}>
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
                  <Input id="reg-password" type="password" placeholder="Min 8 chars, uppercase, number, special" value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); checkPassword(e.target.value) }} className="pl-9" />
                </div>
                {/* Password strength indicator */}
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 w-full rounded-full ${i <= passwordStrength.score ? getStrengthColor(passwordStrength.strength) : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${passwordStrength.strength === 'strong' || passwordStrength.strength === 'very-strong' ? 'text-green-600' : passwordStrength.strength === 'weak' ? 'text-red-600' : 'text-orange-600'}`}>
                      Password strength: {passwordStrength.strength.replace('-', ' ')}
                    </p>
                    {passwordStrength.errors.length > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">{passwordStrength.errors[0]}</p>
                    )}
                  </div>
                )}
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

            <Button className="w-full bg-[#014217] hover:bg-[#066722]" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
