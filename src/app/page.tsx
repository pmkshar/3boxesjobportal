'use client'

import { useAuthStore } from '@/lib/store'
import { LandingPage } from '@/components/portal/LandingPage'
import { JobSeekerDashboard } from '@/components/portal/JobSeekerDashboard'
import { CorporateDashboard } from '@/components/portal/CorporateDashboard'
import { RecruiterDashboard } from '@/components/portal/RecruiterDashboard'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()

  // Auto-seeding is now handled by ensureSeedData() in db.ts
  // No need for client-side seeding

  // Render based on auth state and role
  if (!isAuthenticated || !user) {
    return <LandingPage onNavigate={() => {}} />
  }

  switch (user.role) {
    case 'JOB_SEEKER':
      return <JobSeekerDashboard />
    case 'CORPORATE':
      return <CorporateDashboard />
    case 'RECRUITER':
      return <RecruiterDashboard />
    case 'ADMIN':
      return <JobSeekerDashboard />
    default:
      return <LandingPage onNavigate={() => {}} />
  }
}
