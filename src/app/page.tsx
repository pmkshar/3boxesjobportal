'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { LandingPage } from '@/components/portal/LandingPage'
import { JobSeekerDashboard } from '@/components/portal/JobSeekerDashboard'
import { CorporateDashboard } from '@/components/portal/CorporateDashboard'
import { RecruiterDashboard } from '@/components/portal/RecruiterDashboard'

export default function Home() {
  const { user, isAuthenticated, setLoading } = useAuthStore()
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  // Seed database on first load
  useEffect(() => {
    if (!seeded) {
      seedDatabase()
    }
  }, [])

  const seedDatabase = async () => {
    if (seeding) return
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      if (res.ok) {
        console.log('Database seeded successfully')
        setSeeded(true)
      }
    } catch (e) {
      console.error('Seed error:', e)
    } finally {
      setSeeding(false)
    }
  }

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
      return <JobSeekerDashboard /> // Admin gets job seeker view for now
    default:
      return <LandingPage onNavigate={() => {}} />
  }
}
