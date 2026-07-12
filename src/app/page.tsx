'use client'

import { useAuthStore } from '@/lib/store'
import { PublicPageLayout } from '@/components/portal/PublicPageLayout'
import { HomePage } from '@/components/portal/HomePage'
import { JobSeekerDashboard } from '@/components/portal/JobSeekerDashboard'
import { CorporateDashboard } from '@/components/portal/CorporateDashboard'
import { RecruiterDashboard } from '@/components/portal/RecruiterDashboard'
import { AdminDashboard } from '@/components/portal/AdminDashboard'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()

  // Not authenticated: show public home page with navbar/footer
  if (!isAuthenticated || !user) {
    return (
      <PublicPageLayout>
        <HomePage />
      </PublicPageLayout>
    )
  }

  // Authenticated: show role-specific dashboard (no public navbar/footer)
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
      return (
        <PublicPageLayout>
          <HomePage />
        </PublicPageLayout>
      )
  }
}
