'use client'

import { useAuthStore } from '@/lib/store'
import { IntegratedLoginPage } from '@/components/portal/IntegratedLoginPage'
import { LandingPage } from '@/components/portal/LandingPage'
import { JobSeekerDashboard } from '@/components/portal/JobSeekerDashboard'
import { CorporateDashboard } from '@/components/portal/CorporateDashboard'
import { RecruiterDashboard } from '@/components/portal/RecruiterDashboard'
import { AdminDashboard } from '@/components/portal/AdminDashboard'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()

  // Not authenticated: show integrated login page (no popup)
  if (!isAuthenticated || !user) {
    return <IntegratedLoginPage />
  }

  // Authenticated: show role-specific dashboard
  switch (user.role) {
    case 'JOB_SEEKER':
      return <JobSeekerDashboard />
    case 'CORPORATE':
      return <CorporateDashboard />
    case 'RECRUITER':
      return <RecruiterDashboard />
    case 'ADMIN':
      return <AdminDashboard />
    case 'SUPER_ADMIN':
      return <AdminDashboard />
    case 'HR_MANAGER':
      return <AdminDashboard />
    case 'INTERVIEWER':
      return <AdminDashboard />
    default:
      return <IntegratedLoginPage />
  }
}
