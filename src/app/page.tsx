'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { PublicPageLayout } from '@/components/portal/PublicPageLayout'
import { HomePage } from '@/components/portal/HomePage'
import { JobSeekerDashboard } from '@/components/portal/JobSeekerDashboard'
import { CorporateDashboard } from '@/components/portal/CorporateDashboard'
import { RecruiterDashboard } from '@/components/portal/RecruiterDashboard'
import { AdminDashboard } from '@/components/portal/AdminDashboard'

/**
 * Hydration guard: Zustand persist with skipHydration prevents
 * automatic rehydration during SSR. We manually rehydrate on the
 * client after the first render to avoid React Error #310
 * ("Rendered more hooks than during the previous render").
 *
 * ALL hooks must be called unconditionally at the top level —
 * never after conditional returns (React Rules of Hooks).
 */
export default function Home() {
  // ALL hooks called unconditionally at the top level — BEFORE any conditional returns
  const { user, isAuthenticated } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Manually rehydrate Zustand persist store from localStorage on the client
    useAuthStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  // Show a branded loading state until hydration completes
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

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
