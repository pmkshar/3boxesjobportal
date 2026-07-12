'use client'

import { PublicPageLayout } from '@/components/portal/PublicPageLayout'
import { JobSearchView } from '@/components/portal/JobSearchView'

export default function FindJobsPage() {
  return (
    <PublicPageLayout>
      <JobSearchView />
    </PublicPageLayout>
  )
}
