'use client'

import { PublicPageLayout } from '@/components/portal/PublicPageLayout'
import { TrainingPage } from '@/components/portal/TrainingPage'

export default function TrainingPageRoute() {
  return (
    <PublicPageLayout>
      <TrainingPage />
    </PublicPageLayout>
  )
}
