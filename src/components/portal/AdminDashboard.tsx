'use client'

import { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { Navbar } from '@/components/portal/Navbar'
import { ThemeSwitcher } from '@/components/portal/ThemeSwitcher'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, Users, Shield, Brain, Settings, FileText, Bot,
  LogOut, ChevronRight, Home, Calendar, X, Menu, ChevronLeft,
  Plus, Search, Filter, Download, Edit, Trash2, Eye, CheckCircle2,
  XCircle, Activity, Server, Briefcase, ClipboardList, UserCheck,
  Lock, Mail, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  PieChart, BarChart3, Save, RotateCcw, Upload, Zap, Thermometer,
  Timer, BookOpen, Award, Layers, Globe, Bell, ShieldCheck, Key,
  Monitor, Database, GraduationCap,
} from 'lucide-react'
import type { UserRole } from '@/lib/store'
import { AIAgentDashboard } from '@/components/portal/AIAgentDashboard'

// ─── Types ──────────────────────────────────────────────────────────────

type AdminView = 'dashboard' | 'users' | 'roles' | 'interview' | 'settings' | 'audit' | 'ai-agents'

interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  createdAt: string
  department?: string
}

interface Permission {
  module: string
  actions: { key: string; label: string }[]
}

interface RoleConfig {
  id: string
  name: string
  label: string
  isDefault: boolean
  permissions: Record<string, string[]> // moduleId -> action keys
}

interface AuditEntry {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  type: 'create' | 'update' | 'delete' | 'login' | 'config'
}

// ─── Constants ──────────────────────────────────────────────────────────

const MODULES: Permission[] = [
  { module: 'dashboard', actions: [
    { key: 'view', label: 'View' },
  ]},
  { module: 'jobs', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
    { key: 'approve', label: 'Approve' },
  ]},
  { module: 'applications', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
    { key: 'approve', label: 'Approve' },
  ]},
  { module: 'interviews', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
    { key: 'approve', label: 'Approve' },
  ]},
  { module: 'training', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
  ]},
  { module: 'analytics', actions: [
    { key: 'view', label: 'View' },
  ]},
  { module: 'users', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
  ]},
  { module: 'roles', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
  ]},
  { module: 'settings', actions: [
    { key: 'view', label: 'View' }, { key: 'edit', label: 'Edit' },
  ]},
  { module: 'reports', actions: [
    { key: 'view', label: 'View' }, { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' },
  ]},
]

const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'super_admin', name: 'SUPER_ADMIN', label: 'Super Admin', isDefault: true,
    permissions: Object.fromEntries(MODULES.map(m => [m.module, m.actions.map(a => a.key)])),
  },
  {
    id: 'admin', name: 'ADMIN', label: 'Admin', isDefault: true,
    permissions: Object.fromEntries(MODULES.map(m => [m.module, m.actions.map(a => a.key)])),
  },
  {
    id: 'corporate', name: 'CORPORATE', label: 'Corporate', isDefault: true,
    permissions: {
      dashboard: ['view'], jobs: ['view','create','edit','delete'], applications: ['view','edit','approve'],
      interviews: ['view','create'], training: ['view'], analytics: ['view'],
      users: [], roles: [], settings: [], reports: ['view','create'],
    },
  },
  {
    id: 'recruiter', name: 'RECRUITER', label: 'Recruiter', isDefault: true,
    permissions: {
      dashboard: ['view'], jobs: ['view','create','edit'], applications: ['view','edit','approve'],
      interviews: ['view','create'], training: ['view'], analytics: ['view'],
      users: ['view'], roles: [], settings: [], reports: ['view'],
    },
  },
  {
    id: 'job_seeker', name: 'JOB_SEEKER', label: 'Job Seeker', isDefault: true,
    permissions: {
      dashboard: ['view'], jobs: ['view'], applications: ['view','create'],
      interviews: ['view','create'], training: ['view','create'], analytics: ['view'],
      users: [], roles: [], settings: [], reports: [],
    },
  },
  {
    id: 'hr_manager', name: 'HR_MANAGER', label: 'HR Manager', isDefault: true,
    permissions: {
      dashboard: ['view'], jobs: ['view','create','edit'], applications: ['view','edit','approve'],
      interviews: ['view','create','edit','approve'], training: ['view','create','edit'],
      analytics: ['view'], users: ['view','edit'], roles: [], settings: ['view'], reports: ['view','create'],
    },
  },
  {
    id: 'interviewer', name: 'INTERVIEWER', label: 'Interviewer', isDefault: true,
    permissions: {
      dashboard: ['view'], jobs: ['view'], applications: ['view'],
      interviews: ['view','create','edit'], training: ['view'],
      analytics: ['view'], users: [], roles: [], settings: [], reports: ['view'],
    },
  },
]

// ─── Demo Data ──────────────────────────────────────────────────────────

const DEMO_USERS: ManagedUser[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@3boxes.com', role: 'SUPER_ADMIN', status: 'active', lastLogin: '2025-03-04T10:30:00', createdAt: '2024-01-15', department: 'Engineering' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@3boxes.com', role: 'ADMIN', status: 'active', lastLogin: '2025-03-04T09:15:00', createdAt: '2024-02-10', department: 'Operations' },
  { id: '3', name: 'James Corp', email: 'james@techcorp.com', role: 'CORPORATE', status: 'active', lastLogin: '2025-03-03T14:00:00', createdAt: '2024-03-05', department: 'TechCorp Inc' },
  { id: '4', name: 'Lisa Recruiter', email: 'lisa@hirewell.com', role: 'RECRUITER', status: 'active', lastLogin: '2025-03-04T08:45:00', createdAt: '2024-04-12', department: 'HireWell' },
  { id: '5', name: 'Mike Seeker', email: 'mike@gmail.com', role: 'JOB_SEEKER', status: 'active', lastLogin: '2025-03-02T16:20:00', createdAt: '2024-05-20', department: '' },
  { id: '6', name: 'Emily HR', email: 'emily@3boxes.com', role: 'HR_MANAGER', status: 'active', lastLogin: '2025-03-04T11:00:00', createdAt: '2024-06-01', department: 'Human Resources' },
  { id: '7', name: 'David Interview', email: 'david@3boxes.com', role: 'INTERVIEWER', status: 'active', lastLogin: '2025-03-01T13:30:00', createdAt: '2024-07-15', department: 'Engineering' },
  { id: '8', name: 'Jane Doe', email: 'jane@gmail.com', role: 'JOB_SEEKER', status: 'inactive', lastLogin: '2025-01-15T10:00:00', createdAt: '2024-08-22', department: '' },
  { id: '9', name: 'Tom Enterprise', email: 'tom@bigcorp.com', role: 'CORPORATE', status: 'suspended', lastLogin: '2025-02-28T09:00:00', createdAt: '2024-09-10', department: 'BigCorp Ltd' },
  { id: '10', name: 'Anna Seeker', email: 'anna@outlook.com', role: 'JOB_SEEKER', status: 'active', lastLogin: '2025-03-04T07:30:00', createdAt: '2024-10-05', department: '' },
  { id: '11', name: 'Robert Admin', email: 'robert@3boxes.com', role: 'ADMIN', status: 'inactive', lastLogin: '2025-02-10T15:00:00', createdAt: '2024-11-01', department: 'Support' },
  { id: '12', name: 'Chris Recruiter', email: 'chris@staffpro.com', role: 'RECRUITER', status: 'active', lastLogin: '2025-03-03T11:20:00', createdAt: '2024-12-08', department: 'StaffPro' },
]

const DEMO_AUDIT: AuditEntry[] = [
  { id: '1', user: 'Alex Johnson', action: 'Updated user role', target: 'Sarah Williams → ADMIN', timestamp: '2025-03-04T10:35:00', type: 'update' },
  { id: '2', user: 'Alex Johnson', action: 'Created new user', target: 'David Interview', timestamp: '2025-03-04T10:20:00', type: 'create' },
  { id: '3', user: 'Sarah Williams', action: 'Modified permissions', target: 'RECRUITER role', timestamp: '2025-03-04T09:45:00', type: 'update' },
  { id: '4', user: 'Alex Johnson', action: 'Deactivated user', target: 'Jane Doe', timestamp: '2025-03-03T16:00:00', type: 'update' },
  { id: '5', user: 'System', action: 'Suspended account', target: 'Tom Enterprise (violations)', timestamp: '2025-03-03T14:30:00', type: 'delete' },
  { id: '6', user: 'Sarah Williams', action: 'Updated AI config', target: 'Interview scoring rubric', timestamp: '2025-03-03T11:15:00', type: 'config' },
  { id: '7', user: 'Alex Johnson', action: 'System login', target: 'IP: 192.168.1.45', timestamp: '2025-03-04T08:00:00', type: 'login' },
  { id: '8', user: 'Emily HR', action: 'Exported report', target: 'Monthly applications report', timestamp: '2025-03-02T17:30:00', type: 'create' },
  { id: '9', user: 'Sarah Williams', action: 'Updated settings', target: 'Session timeout: 30min → 60min', timestamp: '2025-03-02T10:20:00', type: 'config' },
  { id: '10', user: 'Alex Johnson', action: 'Created custom role', target: 'CUSTOM_RECRUITER_SENIOR', timestamp: '2025-03-01T15:45:00', type: 'create' },
  { id: '11', user: 'System', action: 'Backup completed', target: 'Database snapshot', timestamp: '2025-03-01T03:00:00', type: 'config' },
  { id: '12', user: 'Emily HR', action: 'Approved application', target: 'APP-2025-0342', timestamp: '2025-03-04T12:00:00', type: 'update' },
]

// ─── Navigation Items ──────────────────────────────────────────────────

const navItems: { id: AdminView; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'roles', label: 'Role & Access', icon: Shield },
  { id: 'interview', label: 'AI Interview Config', icon: Brain },
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'ai-agents', label: 'AI Agents', icon: Bot },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
]

// ─── Helper Components ─────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const { theme } = useTheme()
  const colors: Record<string, string> = {
    SUPER_ADMIN: '#DC2626',
    ADMIN: '#EA580C',
    CORPORATE: '#059669',
    RECRUITER: '#2563EB',
    JOB_SEEKER: '#7C3AED',
    HR_MANAGER: '#0D9488',
    INTERVIEWER: '#D97706',
  }
  const c = colors[role] || theme.primary
  return (
    <Badge className="text-[10px] font-semibold border-0 rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: `${c}18`, color: c }}>
      {role.replace(/_/g, ' ')}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; icon: any }> = {
    active: { bg: '#ECFDF5', text: '#059669', icon: CheckCircle2 },
    inactive: { bg: '#F3F4F6', text: '#6B7280', icon: XCircle },
    suspended: { bg: '#FEF2F2', text: '#DC2626', icon: AlertTriangle },
  }
  const c = cfg[status] || cfg.inactive
  const Icon = c.icon
  return (
    <Badge className="text-[10px] font-semibold border-0 rounded-full px-2.5 py-0.5 flex items-center gap-1"
      style={{ backgroundColor: c.bg, color: c.text }}>
      <Icon className="h-3 w-3" />{status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function StatCard({ title, value, icon: Icon, change, changeDir, color }: {
  title: string; value: string | number; icon: any; change?: string; changeDir?: 'up' | 'down'; color: string
}) {
  const { theme } = useTheme()
  return (
    <Card className="border-[#E4E8EC] hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#66789C] uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-[#05264E] mt-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1.5">
                {changeDir === 'up' ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                <span className={`text-xs font-medium ${changeDir === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>{change}</span>
                <span className="text-[10px] text-[#66789C]">vs last month</span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}12`, color }}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Mini Pie Chart (CSS only) ────────────────────────────────────────

function PieChartVisual({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cumulativeValues: number[] = []
  data.forEach((d) => {
    const prev = cumulativeValues.length > 0 ? cumulativeValues[cumulativeValues.length - 1] : 0
    cumulativeValues.push(prev + d.value)
  })
  const gradientStops = data.map((d, i) => {
    const start = i === 0 ? 0 : (cumulativeValues[i - 1] / total) * 100
    const end = (cumulativeValues[i] / total) * 100
    return `${d.color} ${start}% ${end}%`
  })
  const conicGradient = `conic-gradient(${gradientStops.join(', ')})`

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 rounded-full flex-shrink-0" style={{ background: conicGradient }}>
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-[#05264E]">{total}</p>
            <p className="text-[9px] text-[#66789C]">Total</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-[#05264E] font-medium">{d.label}</span>
            <span className="text-[#66789C] text-xs ml-auto">{d.value}</span>
            <span className="text-[10px] text-[#66789C]">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function AdminDashboard() {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const [activeView, setActiveView] = useState<AdminView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ─── User Management State ────────────────────────────────────────
  const [users, setUsers] = useState<ManagedUser[]>(DEMO_USERS)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all')
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [viewingUser, setViewingUser] = useState<ManagedUser | null>(null)
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'JOB_SEEKER' as UserRole, department: '', status: 'active' as ManagedUser['status'] })

  // ─── Role Management State ────────────────────────────────────────
  const [roles, setRoles] = useState<RoleConfig[]>([...DEFAULT_ROLES])
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleLabel, setNewRoleLabel] = useState('')
  const [rolePreset, setRolePreset] = useState<'full' | 'readonly' | 'none'>('readonly')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('super_admin')

  // ─── AI Interview Config State ────────────────────────────────────
  const [interviewConfig, setInterviewConfig] = useState({
    categories: [
      { id: '1', name: 'Technical Skills', weight: 35, questions: 8 },
      { id: '2', name: 'Communication', weight: 20, questions: 5 },
      { id: '3', name: 'Problem Solving', weight: 25, questions: 6 },
      { id: '4', name: 'Cultural Fit', weight: 10, questions: 3 },
      { id: '5', name: 'Leadership', weight: 10, questions: 3 },
    ],
    scoring: [
      { competency: 'Technical Depth', maxScore: 10, rubric: 'Assesses depth of technical knowledge and ability to apply concepts' },
      { competency: 'Code Quality', maxScore: 10, rubric: 'Evaluates code structure, naming, and best practices' },
      { competency: 'Communication', maxScore: 10, rubric: 'Measures clarity of expression and articulation' },
      { competency: 'Problem Decomposition', maxScore: 10, rubric: 'Ability to break complex problems into manageable parts' },
      { competency: 'Adaptability', maxScore: 10, rubric: 'Response to changing requirements and edge cases' },
    ],
    duration: { min: 15, max: 60, default: 30 },
    aiModel: { provider: 'openai', model: 'gpt-4o', temperature: 0.7 },
  })

  // ─── System Settings State ────────────────────────────────────────
  const [generalSettings, setGeneralSettings] = useState({
    portalName: '3 Boxes Jobs Portal',
    supportEmail: 'support@3boxes.com',
    maintenanceMode: false,
    maxUploadSize: 10,
    defaultLanguage: 'en',
  })
  const [emailSettings, setEmailSettings] = useState({
    welcomeEmail: true, applicationNotification: true, interviewReminder: true,
    weeklyDigest: true, marketingEmails: false, adminAlerts: true,
  })
  const [securitySettings, setSecuritySettings] = useState({
    minPasswordLength: 8, requireUppercase: true, requireNumbers: true,
    requireSpecialChars: true, sessionTimeout: 60, maxLoginAttempts: 5,
    twoFactorAuth: false, ipWhitelist: '',
  })

  // ─── Audit Log State ─────────────────────────────────────────────
  const [auditLog] = useState<AuditEntry[]>(DEMO_AUDIT)
  const [auditUserFilter, setAuditUserFilter] = useState<string>('all')
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('all')
  const [auditDateFilter, setAuditDateFilter] = useState('')

  // ─── Computed ────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter
      const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, userSearch, userRoleFilter, userStatusFilter])

  const filteredAudit = useMemo(() => {
    return auditLog.filter(a => {
      const matchUser = auditUserFilter === 'all' || a.user === auditUserFilter
      const matchType = auditTypeFilter === 'all' || a.type === auditTypeFilter
      const matchDate = !auditDateFilter || a.timestamp.startsWith(auditDateFilter)
      return matchUser && matchType && matchDate
    })
  }, [auditLog, auditUserFilter, auditTypeFilter, auditDateFilter])

  const userDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    users.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1 })
    const colors: Record<string, string> = {
      SUPER_ADMIN: '#DC2626', ADMIN: '#EA580C', CORPORATE: '#059669',
      RECRUITER: '#2563EB', JOB_SEEKER: '#7C3AED', HR_MANAGER: '#0D9488', INTERVIEWER: '#D97706',
    }
    return Object.entries(counts).map(([role, count]) => ({
      label: role.replace(/_/g, ' '), value: count, color: colors[role] || theme.primary,
    }))
  }, [users, theme.primary])

  const selectedRole = roles.find(r => r.id === selectedRoleId)

  // ─── Handlers ────────────────────────────────────────────────────
  const openCreateUser = () => {
    setEditingUser(null)
    setUserForm({ name: '', email: '', role: 'JOB_SEEKER', department: '', status: 'active' })
    setUserDialogOpen(true)
  }

  const openEditUser = (u: ManagedUser) => {
    setEditingUser(u)
    setUserForm({ name: u.name, email: u.email, role: u.role, department: u.department || '', status: u.status })
    setUserDialogOpen(true)
  }

  const saveUser = () => {
    if (!userForm.name || !userForm.email) return
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u, name: userForm.name, email: userForm.email, role: userForm.role,
        department: userForm.department, status: userForm.status,
      } : u))
    } else {
      const newUser: ManagedUser = {
        id: String(Date.now()), name: userForm.name, email: userForm.email,
        role: userForm.role, department: userForm.department, status: userForm.status,
        lastLogin: '-', createdAt: new Date().toISOString().split('T')[0],
      }
      setUsers(prev => [...prev, newUser])
    }
    setUserDialogOpen(false)
  }

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? {
      ...u, status: u.status === 'active' ? 'inactive' : 'active',
    } : u))
  }

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const applyPreset = (preset: 'full' | 'readonly' | 'none', roleId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const newPerms: Record<string, string[]> = {}
      MODULES.forEach(m => {
        if (preset === 'full') newPerms[m.module] = m.actions.map(a => a.key)
        else if (preset === 'readonly') newPerms[m.module] = m.actions.filter(a => a.key === 'view').map(a => a.key)
        else newPerms[m.module] = []
      })
      return { ...r, permissions: newPerms }
    }))
  }

  const togglePermission = (roleId: string, module: string, action: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const current = r.permissions[module] || []
      const updated = current.includes(action) ? current.filter(a => a !== action) : [...current, action]
      return { ...r, permissions: { ...r.permissions, [module]: updated } }
    }))
  }

  const createCustomRole = () => {
    if (!newRoleName || !newRoleLabel) return
    const newRole: RoleConfig = {
      id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      name: newRoleName.toUpperCase().replace(/\s+/g, '_'),
      label: newRoleLabel,
      isDefault: false,
      permissions: Object.fromEntries(MODULES.map(m => [m.module, m.actions.filter(a => a.key === 'view').map(a => a.key)])),
    }
    setRoles(prev => [...prev, newRole])
    setNewRoleName('')
    setNewRoleLabel('')
    setRoleDialogOpen(false)
  }

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isDefault) return
    setRoles(prev => prev.filter(r => r.id !== roleId))
    if (selectedRoleId === roleId) setSelectedRoleId('super_admin')
  }

  const exportAudit = () => {
    const csv = ['Timestamp,User,Action,Target,Type']
    filteredAudit.forEach(a => {
      csv.push(`${a.timestamp},${a.user},${a.action},${a.target},${a.type}`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'audit-log.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── View Label Map ──────────────────────────────────────────────
  const viewLabels: Record<AdminView, string> = {
    dashboard: 'Dashboard',
    users: 'User Management',
    roles: 'Role & Access Management',
    interview: 'AI Interview Config',
    settings: 'System Settings',
    'ai-agents': 'AI Agents',
    audit: 'Audit Logs',
  }

  // ─── RENDER SECTIONS ─────────────────────────────────────────────

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users} change="+12%" changeDir="up" color="#059669" />
        <StatCard title="Active Sessions" value={342} icon={Activity} change="+8%" changeDir="up" color="#2563EB" />
        <StatCard title="Jobs Posted" value={1247} icon={Briefcase} change="+23%" changeDir="up" color="#EA580C" />
        <StatCard title="Applications" value={5834} icon={ClipboardList} change="+15%" changeDir="up" color="#7C3AED" />
        <StatCard title="Interviews" value={891} icon={UserCheck} change="+5%" changeDir="up" color="#0D9488" />
        <StatCard title="System Health" value="99.9%" icon={Server} change="Stable" changeDir="up" color="#059669" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-[#E4E8EC]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#05264E] flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: theme.primary }} /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {auditLog.slice(0, 8).map((entry) => {
              const typeColors: Record<string, string> = {
                create: '#059669', update: '#2563EB', delete: '#DC2626', login: '#7C3AED', config: '#EA580C',
              }
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${typeColors[entry.type] || theme.primary}15`, color: typeColors[entry.type] || theme.primary }}>
                    {entry.type === 'create' ? <Plus className="h-4 w-4" /> :
                     entry.type === 'update' ? <Edit className="h-4 w-4" /> :
                     entry.type === 'delete' ? <Trash2 className="h-4 w-4" /> :
                     entry.type === 'login' ? <LogOut className="h-4 w-4" /> :
                     <Settings className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#05264E]">
                      <span className="font-semibold">{entry.user}</span> {entry.action}
                    </p>
                    <p className="text-xs text-[#66789C] truncate">{entry.target}</p>
                  </div>
                  <span className="text-[10px] text-[#66789C] flex-shrink-0 mt-0.5">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="border-[#E4E8EC]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#05264E] flex items-center gap-2">
              <PieChart className="h-4 w-4" style={{ color: theme.primary }} /> Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartVisual data={userDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* System Health Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'API Uptime', value: '99.97%', icon: Globe, color: '#059669' },
          { label: 'DB Response', value: '12ms', icon: Database, color: '#2563EB' },
          { label: 'Error Rate', value: '0.03%', icon: AlertTriangle, color: '#DC2626' },
          { label: 'Active Workers', value: '4/4', icon: Monitor, color: '#0D9488' },
        ].map(item => (
          <Card key={item.label} className="border-[#E4E8EC]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}12`, color: item.color }}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-[#66789C]">{item.label}</p>
                <p className="text-sm font-bold text-[#05264E]">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // ─── User Management ─────────────────────────────────────────────
  const renderUserManagement = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#05264E]">User Management</h2>
          <p className="text-sm text-[#66789C]">{users.length} total users · {users.filter(u => u.status === 'active').length} active</p>
        </div>
        <Button className="text-white text-sm rounded-lg"
          style={{ backgroundColor: theme.primary }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}
          onClick={openCreateUser}>
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[#E4E8EC]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66789C]" />
              <Input placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="pl-10 h-9 bg-[#F9FAFB] border-[#E4E8EC] text-sm rounded-lg" />
            </div>
            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-[#F9FAFB] border-[#E4E8EC] rounded-lg">
                <Filter className="h-3.5 w-3.5 mr-1 text-[#66789C]" /><SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-[#F9FAFB] border-[#E4E8EC] rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-[#E4E8EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                  <TableHead className="text-xs font-semibold text-[#66789C]">User</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C]">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C] hidden md:table-cell">Department</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C]">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C] hidden lg:table-cell">Last Login</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id} className="hover:bg-[#F9FAFB]">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px] font-semibold"
                            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#05264E] truncate">{u.name}</p>
                          <p className="text-[11px] text-[#66789C] truncate">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-[#66789C]">{u.department || '—'}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-[#66789C]">
                      {u.lastLogin === '-' ? 'Never' : new Date(u.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#66789C] hover:text-[#059669]"
                          onClick={() => setViewingUser(u)} title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#66789C] hover:text-[#2563EB]"
                          onClick={() => openEditUser(u)} title="Edit">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#66789C]"
                          onClick={() => toggleUserStatus(u.id)} title={u.status === 'active' ? 'Deactivate' : 'Activate'}>
                          {u.status === 'active' ? <XCircle className="h-3.5 w-3.5 text-amber-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#66789C] hover:text-red-500"
                          onClick={() => deleteUser(u.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-[#66789C]">
                      No users found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#05264E]">{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription className="text-[#66789C]">
              {editingUser ? 'Update user details and role assignment.' : 'Add a new user to the portal and assign their role.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#05264E]">Full Name</Label>
              <Input value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Enter full name" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#05264E]">Email</Label>
              <Input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Enter email address" className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#05264E]">Role</Label>
                <Select value={userForm.role} onValueChange={v => setUserForm(p => ({ ...p, role: v as UserRole }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#05264E]">Status</Label>
                <Select value={userForm.status} onValueChange={v => setUserForm(p => ({ ...p, status: v as ManagedUser['status'] }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#05264E]">Department</Label>
              <Input value={userForm.department} onChange={e => setUserForm(p => ({ ...p, department: e.target.value }))}
                placeholder="Enter department (optional)" className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)} className="text-sm">Cancel</Button>
            <Button className="text-white text-sm" onClick={saveUser}
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#05264E]">User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg font-semibold"
                    style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                    {viewingUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-[#05264E]">{viewingUser.name}</p>
                  <p className="text-sm text-[#66789C]">{viewingUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RoleBadge role={viewingUser.role} />
                    <StatusBadge status={viewingUser.status} />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#66789C]">Department</p><p className="text-sm font-medium text-[#05264E]">{viewingUser.department || 'N/A'}</p></div>
                <div><p className="text-xs text-[#66789C]">Created</p><p className="text-sm font-medium text-[#05264E]">{new Date(viewingUser.createdAt).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-[#66789C]">Last Login</p><p className="text-sm font-medium text-[#05264E]">{viewingUser.lastLogin === '-' ? 'Never' : new Date(viewingUser.lastLogin).toLocaleString()}</p></div>
                <div><p className="text-xs text-[#66789C]">User ID</p><p className="text-sm font-medium text-[#05264E] font-mono">#{viewingUser.id}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)} className="text-sm">Close</Button>
            <Button className="text-white text-sm" onClick={() => { openEditUser(viewingUser!); setViewingUser(null) }}
              style={{ backgroundColor: theme.primary }}>
              <Edit className="h-4 w-4 mr-1" /> Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ─── Role & Access Management ────────────────────────────────────
  const renderRoleAccess = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#05264E]">Role & Access Management</h2>
          <p className="text-sm text-[#66789C]">{roles.length} roles configured · {roles.filter(r => r.isDefault).length} default · {roles.filter(r => !r.isDefault).length} custom</p>
        </div>
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-white text-sm rounded-lg"
              style={{ backgroundColor: theme.primary }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
              <Plus className="h-4 w-4 mr-1" /> Create Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#05264E]">Create Custom Role</DialogTitle>
              <DialogDescription className="text-[#66789C]">Define a new role with custom permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#05264E]">Role Name (internal)</Label>
                <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g., SENIOR_RECRUITER" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#05264E]">Display Label</Label>
                <Input value={newRoleLabel} onChange={e => setNewRoleLabel(e.target.value)}
                  placeholder="e.g., Senior Recruiter" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#05264E]">Access Level Preset</Label>
                <Select value={rolePreset} onValueChange={v => setRolePreset(v as 'full' | 'readonly' | 'none')}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access</SelectItem>
                    <SelectItem value="readonly">Read Only</SelectItem>
                    <SelectItem value="none">No Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)} className="text-sm">Cancel</Button>
              <Button className="text-white text-sm" onClick={createCustomRole}
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Selector & Info */}
      <Card className="border-[#E4E8EC]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs font-semibold text-[#66789C] uppercase tracking-wide mb-2 block">Select Role to Edit</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map(r => (
                  <button key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedRoleId === r.id
                        ? 'text-white shadow-sm'
                        : 'bg-[#F3F4F6] text-[#66789C] hover:bg-[#E4E8EC]'
                    }`}
                    style={selectedRoleId === r.id ? { backgroundColor: theme.primary } : {}}>
                    <Shield className="h-3 w-3" />
                    {r.label}
                    {r.isDefault && <span className="opacity-70 text-[9px]">●</span>}
                  </button>
                ))}
              </div>
            </div>
            {selectedRole && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Label className="text-xs font-semibold text-[#66789C] uppercase tracking-wide">Presets:</Label>
                <Button size="sm" variant="outline" className="text-xs h-7"
                  onClick={() => applyPreset('full', selectedRoleId)}>Full Access</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"
                  onClick={() => applyPreset('readonly', selectedRoleId)}>Read Only</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"
                  onClick={() => applyPreset('none', selectedRoleId)}>No Access</Button>
                {!selectedRole.isDefault && (
                  <Button size="sm" variant="outline" className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteRole(selectedRoleId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      {selectedRole && (
        <Card className="border-[#E4E8EC]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-[#05264E]">
                  Permission Matrix — {selectedRole.label}
                </CardTitle>
                <CardDescription className="text-xs text-[#66789C] mt-0.5">
                  {selectedRole.isDefault ? 'Default role — permissions are editable' : 'Custom role — can be deleted'}
                </CardDescription>
              </div>
              <Badge className="text-[10px] border-0 rounded-full"
                style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                {selectedRole.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                    <TableHead className="text-xs font-semibold text-[#66789C] min-w-[140px] sticky left-0 bg-[#F9FAFB] z-10">Module</TableHead>
                    {['View', 'Create', 'Edit', 'Delete', 'Approve'].map(a => (
                      <TableHead key={a} className="text-xs font-semibold text-[#66789C] text-center min-w-[70px]">{a}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULES.map(mod => {
                    const moduleActions = mod.actions.map(a => a.key)
                    const rolePerms = selectedRole.permissions[mod.module] || []
                    return (
                      <TableRow key={mod.module} className="hover:bg-[#F9FAFB]">
                        <TableCell className="text-sm font-medium text-[#05264E] capitalize sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            {mod.module === 'dashboard' && <LayoutDashboard className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'jobs' && <Briefcase className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'applications' && <ClipboardList className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'interviews' && <UserCheck className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'training' && <GraduationCap className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'analytics' && <BarChart3 className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'users' && <Users className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'roles' && <Shield className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'settings' && <Settings className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module === 'reports' && <FileText className="h-3.5 w-3.5 text-[#66789C]" />}
                            {mod.module}
                          </div>
                        </TableCell>
                        {['view', 'create', 'edit', 'delete', 'approve'].map(actionKey => {
                          const isAvailable = moduleActions.includes(actionKey)
                          const isChecked = rolePerms.includes(actionKey)
                          return (
                            <TableCell key={actionKey} className="text-center">
                              {isAvailable ? (
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(selectedRoleId, mod.module, actionKey)}
                                    className="data-[state=checked]:bg-[var(--theme-primary)] data-[state=checked]:border-[var(--theme-primary)]"
                                  />
                                </div>
                              ) : (
                                <span className="text-[10px] text-[#D1D5DB]">—</span>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Roles to Users Quick View */}
      <Card className="border-[#E4E8EC]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#05264E] flex items-center gap-2">
            <Key className="h-4 w-4" style={{ color: theme.primary }} /> Role Assignments
          </CardTitle>
          <CardDescription className="text-xs text-[#66789C]">Quick overview of users per role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {roles.map(r => {
              const usersInRole = users.filter(u => u.role === r.name)
              return (
                <div key={r.id} className="p-3 rounded-lg border border-[#E4E8EC] hover:border-[var(--theme-primary)] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" style={{ color: theme.primary }} />
                      <span className="text-sm font-medium text-[#05264E]">{r.label}</span>
                    </div>
                    <Badge className="text-[10px] border-0 bg-[#F3F4F6] text-[#66789C]">{usersInRole.length}</Badge>
                  </div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {usersInRole.slice(0, 3).map(u => (
                      <div key={u.id} className="flex items-center gap-1.5 text-xs text-[#66789C]">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[7px]"
                            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                            {u.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {u.name}
                      </div>
                    ))}
                    {usersInRole.length > 3 && (
                      <p className="text-[10px] text-[#66789C] pl-5.5">+{usersInRole.length - 3} more</p>
                    )}
                    {usersInRole.length === 0 && (
                      <p className="text-[10px] text-[#D1D5DB]">No users assigned</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ─── AI Interview Config ─────────────────────────────────────────
  const renderInterviewConfig = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#05264E]">AI Interview Configuration</h2>
        <p className="text-sm text-[#66789C]">Configure AI interview parameters, scoring, and model settings.</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="bg-[#F3F4F6] h-9">
          <TabsTrigger value="categories" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Layers className="h-3.5 w-3.5 mr-1" /> Categories
          </TabsTrigger>
          <TabsTrigger value="scoring" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Award className="h-3.5 w-3.5 mr-1" /> Scoring
          </TabsTrigger>
          <TabsTrigger value="duration" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Timer className="h-3.5 w-3.5 mr-1" /> Duration
          </TabsTrigger>
          <TabsTrigger value="model" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Zap className="h-3.5 w-3.5 mr-1" /> AI Model
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-[#05264E]">Question Categories & Weights</CardTitle>
                  <CardDescription className="text-xs text-[#66789C] mt-0.5">
                    Total weight: {interviewConfig.categories.reduce((s, c) => s + c.weight, 0)}%
                    {interviewConfig.categories.reduce((s, c) => s + c.weight, 0) !== 100 && (
                      <span className="text-red-500 ml-1">(must equal 100%)</span>
                    )}
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="text-xs"
                  onClick={() => setInterviewConfig(prev => ({
                    ...prev,
                    categories: [...prev.categories, { id: String(Date.now()), name: 'New Category', weight: 0, questions: 3 }],
                  }))}>
                  <Plus className="h-3 w-3 mr-1" /> Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviewConfig.categories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#E4E8EC] bg-[#F9FAFB]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primary}12`, color: theme.primary }}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input value={cat.name} onChange={e => {
                      const cats = [...interviewConfig.categories]
                      cats[idx] = { ...cats[idx], name: e.target.value }
                      setInterviewConfig(prev => ({ ...prev, categories: cats }))
                    }} className="h-8 text-sm" placeholder="Category name" />
                    <div className="flex items-center gap-1">
                      <Input type="number" value={cat.weight} onChange={e => {
                        const cats = [...interviewConfig.categories]
                        cats[idx] = { ...cats[idx], weight: Number(e.target.value) }
                        setInterviewConfig(prev => ({ ...prev, categories: cats }))
                      }} className="h-8 text-sm w-20" min={0} max={100} />
                      <span className="text-xs text-[#66789C]">%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={cat.questions} onChange={e => {
                        const cats = [...interviewConfig.categories]
                        cats[idx] = { ...cats[idx], questions: Number(e.target.value) }
                        setInterviewConfig(prev => ({ ...prev, categories: cats }))
                      }} className="h-8 text-sm w-20" min={1} max={20} />
                      <span className="text-xs text-[#66789C]">questions</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[#66789C] hover:text-red-500 flex-shrink-0"
                    onClick={() => setInterviewConfig(prev => ({
                      ...prev,
                      categories: prev.categories.filter(c => c.id !== cat.id),
                    }))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring Tab */}
        <TabsContent value="scoring">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-[#05264E]">Scoring Rubrics</CardTitle>
                  <CardDescription className="text-xs text-[#66789C] mt-0.5">
                    Define scoring criteria for each competency (1-{interviewConfig.scoring[0]?.maxScore || 10})
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="text-xs"
                  onClick={() => setInterviewConfig(prev => ({
                    ...prev,
                    scoring: [...prev.scoring, { competency: 'New Competency', maxScore: 10, rubric: 'Describe the rubric...' }],
                  }))}>
                  <Plus className="h-3 w-3 mr-1" /> Add Competency
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviewConfig.scoring.map((s, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-[#E4E8EC] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Award className="h-4 w-4 flex-shrink-0" style={{ color: theme.primary }} />
                      <Input value={s.competency} onChange={e => {
                        const scoring = [...interviewConfig.scoring]
                        scoring[idx] = { ...scoring[idx], competency: e.target.value }
                        setInterviewConfig(prev => ({ ...prev, scoring }))
                      }} className="h-8 text-sm font-medium" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-xs text-[#66789C]">Max Score:</span>
                      <Input type="number" value={s.maxScore} onChange={e => {
                        const scoring = [...interviewConfig.scoring]
                        scoring[idx] = { ...scoring[idx], maxScore: Number(e.target.value) }
                        setInterviewConfig(prev => ({ ...prev, scoring }))
                      }} className="h-8 text-sm w-16" min={1} max={100} />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-[#66789C] hover:text-red-500"
                        onClick={() => setInterviewConfig(prev => ({
                          ...prev, scoring: prev.scoring.filter((_, i) => i !== idx),
                        }))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Textarea value={s.rubric} onChange={e => {
                    const scoring = [...interviewConfig.scoring]
                    scoring[idx] = { ...scoring[idx], rubric: e.target.value }
                    setInterviewConfig(prev => ({ ...prev, scoring }))
                  }} className="text-sm min-h-[60px]" placeholder="Describe scoring rubric..." />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duration Tab */}
        <TabsContent value="duration">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#05264E]">Interview Duration Limits</CardTitle>
              <CardDescription className="text-xs text-[#66789C] mt-0.5">Set time boundaries for AI interview sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E] flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#66789C]" /> Minimum (min)
                  </Label>
                  <Input type="number" value={interviewConfig.duration.min}
                    onChange={e => setInterviewConfig(prev => ({
                      ...prev, duration: { ...prev.duration, min: Number(e.target.value) },
                    }))}
                    className="h-9 text-sm" min={5} max={120} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E] flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-[#66789C]" /> Default (min)
                  </Label>
                  <Input type="number" value={interviewConfig.duration.default}
                    onChange={e => setInterviewConfig(prev => ({
                      ...prev, duration: { ...prev.duration, default: Number(e.target.value) },
                    }))}
                    className="h-9 text-sm" min={5} max={120} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E] flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#66789C]" /> Maximum (min)
                  </Label>
                  <Input type="number" value={interviewConfig.duration.max}
                    onChange={e => setInterviewConfig(prev => ({
                      ...prev, duration: { ...prev.duration, max: Number(e.target.value) },
                    }))}
                    className="h-9 text-sm" min={5} max={180} />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E4E8EC]">
                <p className="text-sm text-[#05264E] font-medium">Current Configuration</p>
                <p className="text-xs text-[#66789C] mt-1">
                  Interviews will last between <span className="font-semibold">{interviewConfig.duration.min}</span> and{' '}
                  <span className="font-semibold">{interviewConfig.duration.max}</span> minutes,
                  with a default of <span className="font-semibold">{interviewConfig.duration.default}</span> minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Model Tab */}
        <TabsContent value="model">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#05264E]">AI Model Settings</CardTitle>
              <CardDescription className="text-xs text-[#66789C] mt-0.5">Configure the AI provider and model parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E]">AI Provider</Label>
                  <Select value={interviewConfig.aiModel.provider}
                    onValueChange={v => setInterviewConfig(prev => ({
                      ...prev, aiModel: { ...prev.aiModel, provider: v },
                    }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google AI</SelectItem>
                      <SelectItem value="local">Local Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E]">Model</Label>
                  <Select value={interviewConfig.aiModel.model}
                    onValueChange={v => setInterviewConfig(prev => ({
                      ...prev, aiModel: { ...prev.aiModel, model: v },
                    }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {interviewConfig.aiModel.provider === 'openai' && (
                        <>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        </>
                      )}
                      {interviewConfig.aiModel.provider === 'anthropic' && (
                        <>
                          <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        </>
                      )}
                      {interviewConfig.aiModel.provider === 'google' && (
                        <>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                        </>
                      )}
                      {interviewConfig.aiModel.provider === 'local' && (
                        <SelectItem value="llama-3">Llama 3 (Local)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#05264E] flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-[#66789C]" />
                  Temperature: {interviewConfig.aiModel.temperature}
                </Label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#66789C]">0 (Precise)</span>
                  <input type="range" min={0} max={2} step={0.1}
                    value={interviewConfig.aiModel.temperature}
                    onChange={e => setInterviewConfig(prev => ({
                      ...prev, aiModel: { ...prev.aiModel, temperature: Number(e.target.value) },
                    }))}
                    className="flex-1 accent-[var(--theme-primary)]"
                  />
                  <span className="text-xs text-[#66789C]">2 (Creative)</span>
                </div>
                <p className="text-[10px] text-[#66789C]">
                  Lower values produce more consistent, factual responses. Higher values increase creativity and variation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  // ─── System Settings ─────────────────────────────────────────────
  const renderSettings = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#05264E]">System Settings</h2>
        <p className="text-sm text-[#66789C]">Manage portal configuration, notifications, and security policies.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-[#F3F4F6] h-9">
          <TabsTrigger value="general" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="h-3.5 w-3.5 mr-1" /> General
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Mail className="h-3.5 w-3.5 mr-1" /> Email
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lock className="h-3.5 w-3.5 mr-1" /> Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#05264E]">General Portal Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E]">Portal Name</Label>
                  <Input value={generalSettings.portalName} onChange={e => setGeneralSettings(p => ({ ...p, portalName: e.target.value }))}
                    className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E]">Support Email</Label>
                  <Input type="email" value={generalSettings.supportEmail} onChange={e => setGeneralSettings(p => ({ ...p, supportEmail: e.target.value }))}
                    className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E]">Default Language</Label>
                  <Select value={generalSettings.defaultLanguage} onValueChange={v => setGeneralSettings(p => ({ ...p, defaultLanguage: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#05264E]">Max Upload Size (MB)</Label>
                  <Input type="number" value={generalSettings.maxUploadSize} onChange={e => setGeneralSettings(p => ({ ...p, maxUploadSize: Number(e.target.value) }))}
                    className="h-9 text-sm" min={1} max={100} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E4E8EC] bg-[#F9FAFB]">
                <div>
                  <p className="text-sm font-medium text-[#05264E]">Maintenance Mode</p>
                  <p className="text-xs text-[#66789C]">Temporarily disable the portal for users</p>
                </div>
                <Switch checked={generalSettings.maintenanceMode}
                  onCheckedChange={v => setGeneralSettings(p => ({ ...p, maintenanceMode: v }))} />
              </div>
              <div className="flex justify-end">
                <Button className="text-white text-sm" style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
                  <Save className="h-4 w-4 mr-1" /> Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#05264E]">Email Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'welcomeEmail' as const, label: 'Welcome Email', desc: 'Send to new users upon registration' },
                { key: 'applicationNotification' as const, label: 'Application Notifications', desc: 'Notify employers of new applications' },
                { key: 'interviewReminder' as const, label: 'Interview Reminders', desc: 'Remind candidates before interviews' },
                { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Send weekly summary to all users' },
                { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Promotional and feature update emails' },
                { key: 'adminAlerts' as const, label: 'Admin Alerts', desc: 'Critical system alerts to administrators' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-[#E4E8EC] hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: emailSettings[item.key] ? `${theme.primary}12` : '#F3F4F6', color: emailSettings[item.key] ? theme.primary : '#9CA3AF' }}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#05264E]">{item.label}</p>
                      <p className="text-xs text-[#66789C]">{item.desc}</p>
                    </div>
                  </div>
                  <Switch checked={emailSettings[item.key]}
                    onCheckedChange={v => setEmailSettings(p => ({ ...p, [item.key]: v }))} />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button className="text-white text-sm" style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
                  <Save className="h-4 w-4 mr-1" /> Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="border-[#E4E8EC]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#05264E]">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#05264E] flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4" style={{ color: theme.primary }} /> Password Policy
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#05264E]">Minimum Password Length</Label>
                    <Input type="number" value={securitySettings.minPasswordLength}
                      onChange={e => setSecuritySettings(p => ({ ...p, minPasswordLength: Number(e.target.value) }))}
                      className="h-9 text-sm" min={6} max={32} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-[#05264E]">Max Login Attempts</Label>
                    <Input type="number" value={securitySettings.maxLoginAttempts}
                      onChange={e => setSecuritySettings(p => ({ ...p, maxLoginAttempts: Number(e.target.value) }))}
                      className="h-9 text-sm" min={3} max={10} />
                  </div>
                </div>
                <div className="space-y-2.5 mt-3">
                  {[
                    { key: 'requireUppercase' as const, label: 'Require uppercase letters' },
                    { key: 'requireNumbers' as const, label: 'Require numbers' },
                    { key: 'requireSpecialChars' as const, label: 'Require special characters' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-2">
                      <Checkbox checked={securitySettings[item.key]}
                        onCheckedChange={v => setSecuritySettings(p => ({ ...p, [item.key]: v }))}
                        className="data-[state=checked]:bg-[var(--theme-primary)] data-[state=checked]:border-[var(--theme-primary)]" />
                      <Label className="text-sm text-[#05264E]">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-[#05264E] flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" style={{ color: theme.primary }} /> Session Management
                </h3>
                <div className="space-y-2">
                  <Label className="text-sm text-[#05264E]">Session Timeout (minutes)</Label>
                  <Input type="number" value={securitySettings.sessionTimeout}
                    onChange={e => setSecuritySettings(p => ({ ...p, sessionTimeout: Number(e.target.value) }))}
                    className="h-9 text-sm w-32" min={5} max={480} />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-[#05264E] flex items-center gap-2 mb-3">
                  <Key className="h-4 w-4" style={{ color: theme.primary }} /> Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#E4E8EC] bg-[#F9FAFB]">
                  <div>
                    <p className="text-sm font-medium text-[#05264E]">Enable 2FA for all users</p>
                    <p className="text-xs text-[#66789C]">Require two-factor authentication on login</p>
                  </div>
                  <Switch checked={securitySettings.twoFactorAuth}
                    onCheckedChange={v => setSecuritySettings(p => ({ ...p, twoFactorAuth: v }))} />
                </div>
              </div>

              <div>
                <Label className="text-sm text-[#05264E]">IP Whitelist (one per line)</Label>
                <Textarea value={securitySettings.ipWhitelist}
                  onChange={e => setSecuritySettings(p => ({ ...p, ipWhitelist: e.target.value }))}
                  placeholder="192.168.1.0/24&#10;10.0.0.1"
                  className="text-sm min-h-[80px] mt-2" />
              </div>

              <div className="flex justify-end pt-2">
                <Button className="text-white text-sm" style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
                  <Save className="h-4 w-4 mr-1" /> Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  // ─── Audit Logs ──────────────────────────────────────────────────
  const renderAuditLogs = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#05264E]">Audit Logs</h2>
          <p className="text-sm text-[#66789C]">{filteredAudit.length} log entries</p>
        </div>
        <Button variant="outline" className="text-sm rounded-lg" onClick={exportAudit}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-[#E4E8EC]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={auditUserFilter} onValueChange={setAuditUserFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm bg-[#F9FAFB] border-[#E4E8EC] rounded-lg">
                <SelectValue placeholder="Filter User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {[...new Set(auditLog.map(a => a.user))].map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={auditTypeFilter} onValueChange={setAuditTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-[#F9FAFB] border-[#E4E8EC] rounded-lg">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="config">Config</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={auditDateFilter} onChange={e => setAuditDateFilter(e.target.value)}
              className="w-full sm:w-[160px] h-9 text-sm bg-[#F9FAFB] border-[#E4E8EC] rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="border-[#E4E8EC]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                  <TableHead className="text-xs font-semibold text-[#66789C]">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C]">User</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C]">Action</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C] hidden md:table-cell">Target</TableHead>
                  <TableHead className="text-xs font-semibold text-[#66789C]">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudit.map(entry => {
                  const typeColors: Record<string, { bg: string; text: string }> = {
                    create: { bg: '#ECFDF5', text: '#059669' },
                    update: { bg: '#EFF6FF', text: '#2563EB' },
                    delete: { bg: '#FEF2F2', text: '#DC2626' },
                    login: { bg: '#F5F3FF', text: '#7C3AED' },
                    config: { bg: '#FFF7ED', text: '#EA580C' },
                  }
                  const tc = typeColors[entry.type] || typeColors.update
                  return (
                    <TableRow key={entry.id} className="hover:bg-[#F9FAFB]">
                      <TableCell className="text-xs text-[#66789C] whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[#05264E]">{entry.user}</TableCell>
                      <TableCell className="text-sm text-[#05264E]">{entry.action}</TableCell>
                      <TableCell className="text-sm text-[#66789C] hidden md:table-cell truncate max-w-[200px]">{entry.target}</TableCell>
                      <TableCell>
                        <Badge className="text-[10px] border-0 rounded-full px-2 py-0.5 capitalize"
                          style={{ backgroundColor: tc.bg, color: tc.text }}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredAudit.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-[#66789C]">
                      No audit entries found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // ─── Main Content Router ─────────────────────────────────────────
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard()
      case 'users': return renderUserManagement()
      case 'roles': return renderRoleAccess()
      case 'interview': return renderInterviewConfig()
      case 'settings': return renderSettings()
      case 'ai-agents': return <AIAgentDashboard />
      case 'audit': return renderAuditLogs()
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  LAYOUT
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="flex">
        {/* ─── Desktop Sidebar ──────────────────────────────────── */}
        <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[72px]'} hidden lg:flex flex-col bg-[var(--theme-sidebar)] min-h-[calc(100vh-4rem)] transition-all duration-300 relative border-r-0`}>
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className={`h-3 w-3 text-gray-600 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Admin label */}
          {sidebarOpen && (
            <div className="px-5 pt-5 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" style={{ color: 'var(--theme-sidebar-active)' }} />
                <span className="text-white font-bold text-sm">Super Admin</span>
              </div>
              <p className="text-[10px] text-[#6B8AB8] mt-0.5 ml-7">Full system access</p>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 px-3 pt-4 space-y-1">
            {navItems.map((item) => (
              <button key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  activeView === item.id
                    ? 'active bg-[var(--theme-sidebar-hover)] text-white font-medium'
                    : 'text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white'
                }`}>
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* System status indicator */}
          {sidebarOpen && (
            <div className="px-5 pb-3">
              <div className="p-3 rounded-lg bg-[var(--theme-sidebar-hover)] border border-white/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-[#A3B8D0] font-medium">System Online</span>
                </div>
                <p className="text-[9px] text-[#6B8AB8]">Uptime: 99.97% · 0 incidents</p>
              </div>
            </div>
          )}

          {/* Bottom: ThemeSwitcher, Settings & Logout */}
          <div className="px-3 pb-4 space-y-1">
            {sidebarOpen && (
              <>
                <ThemeSwitcher />
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white transition-colors"
                  onClick={() => setActiveView('settings')}>
                  <Settings className="h-[18px] w-[18px]" />
                  <span>Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-red-400 transition-colors"
                  onClick={() => { useAuthStore.getState().logout(); window.location.reload() }}>
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* ─── Mobile Nav Overlay ───────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[var(--theme-sidebar)] flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--theme-sidebar-hover)]">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" style={{ color: 'var(--theme-sidebar-active)' }} />
                  <span className="text-white font-bold">Admin Panel</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#A3B8D0]"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 px-3 pt-4 space-y-1">
                {navItems.map((item) => (
                  <button key={item.id}
                    onClick={() => { setActiveView(item.id); setMobileMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeView === item.id ? 'bg-[var(--theme-sidebar-hover)] text-white font-medium' : 'text-[#A3B8D0] hover:bg-[var(--theme-sidebar-hover)] hover:text-white'
                    }`}>
                    <item.icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="px-3 pb-4 space-y-1">
                <ThemeSwitcher />
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#A3B8D0] hover:text-red-400"
                  onClick={() => { useAuthStore.getState().logout(); window.location.reload() }}>
                  <LogOut className="h-[18px] w-[18px]" /><span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Mobile Bottom Nav ────────────────────────────────── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1.5 shadow-lg">
          <div className="flex justify-around">
            {navItems.slice(0, 4).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-xs rounded-lg transition-colors ${
                  activeView === item.id ? 'text-[var(--theme-primary)] font-medium' : 'text-[#66789C]'
                }`}>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="truncate max-w-[56px] text-[10px]">{item.label.split(' ')[0]}</span>
              </button>
            ))}
            <button className="flex flex-col items-center py-1 px-2 text-xs text-[#66789C]" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">More</span>
            </button>
          </div>
        </div>

        {/* ─── Main Content ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="px-4 lg:px-8 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#66789C]">
                <Home className="h-3.5 w-3.5" />
                <span className="hover:text-[var(--theme-primary)] cursor-pointer">Home</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#05264E] font-medium">{viewLabels[activeView]}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#66789C]">
                <Calendar className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-8 pb-24 lg:pb-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
