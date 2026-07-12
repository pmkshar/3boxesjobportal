'use client'

import { PublicPageLayout } from '@/components/portal/PublicPageLayout'
import { AIFeaturesPage } from '@/components/portal/AIFeaturesPage'

export default function AIFeaturesPageRoute() {
  return (
    <PublicPageLayout>
      <AIFeaturesPage />
    </PublicPageLayout>
  )
}
