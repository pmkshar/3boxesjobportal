/**
 * Environment-aware demo credentials
 *
 * DEMO site (3boxesjobportal.vercel.app): Uses SQLite/memory-store with @3boxes.com emails
 * PRODUCTION site (3boxesjobs.com): Uses Neon PostgreSQL with @3boxesjobs.com emails
 *
 * This module provides the correct credentials based on NEXT_PUBLIC_APP_ENV
 */

export type DemoRole = 'JOB_SEEKER' | 'CORPORATE' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN' | 'HR_MANAGER' | 'INTERVIEWER'

export interface DemoCredential {
  email: string
  password: string
  label: string
}

const DEMO_CREDENTIALS: Record<DemoRole, DemoCredential> = {
  JOB_SEEKER: { email: 'seeker@3boxes.com', password: 'demo123', label: 'Job Seeker' },
  CORPORATE: { email: 'corp@3boxes.com', password: 'demo123', label: 'Corporate' },
  RECRUITER: { email: 'recruiter@3boxes.com', password: 'demo123', label: 'Recruiter' },
  SUPER_ADMIN: { email: 'superadmin@3boxes.com', password: 'demo123', label: 'Super Admin' },
  ADMIN: { email: 'admin@3boxes.com', password: 'demo123', label: 'Admin' },
  HR_MANAGER: { email: 'hr@3boxes.com', password: 'demo123', label: 'HR Manager' },
  INTERVIEWER: { email: 'interviewer@3boxes.com', password: 'demo123', label: 'Interviewer' },
}

const PRODUCTION_CREDENTIALS: Record<DemoRole, DemoCredential> = {
  JOB_SEEKER: { email: 'seeker@3boxesjobs.com', password: 'demo123', label: 'Job Seeker' },
  CORPORATE: { email: 'hr@3boxesjobs.com', password: 'demo123', label: 'Corporate (HR)' },
  RECRUITER: { email: 'recruiter@3boxesjobs.com', password: 'demo123', label: 'Recruiter' },
  SUPER_ADMIN: { email: 'admin@3boxesjobs.com', password: 'demo123', label: 'Admin' },
  ADMIN: { email: 'admin@3boxesjobs.com', password: 'demo123', label: 'Admin' },
  HR_MANAGER: { email: 'hrmanager@3boxesjobs.com', password: 'demo123', label: 'HR Manager' },
  INTERVIEWER: { email: 'interviewer@3boxesjobs.com', password: 'demo123', label: 'Interviewer' },
}

export function getDemoCredentials(): Record<DemoRole, DemoCredential> {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'demo'
  if (env === 'production') {
    return PRODUCTION_CREDENTIALS
  }
  return DEMO_CREDENTIALS
}

export function getDemoCredential(role: DemoRole): DemoCredential {
  return getDemoCredentials()[role]
}

export function isDemoEnvironment(): boolean {
  return (process.env.NEXT_PUBLIC_APP_ENV || 'demo') !== 'production'
}

export function getEnvironmentLabel(): string {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'demo'
  return env === 'production' ? 'Production' : 'Demo'
}
