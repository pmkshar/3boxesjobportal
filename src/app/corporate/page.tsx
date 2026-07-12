'use client'

import { PublicPageLayout } from '@/components/portal/PublicPageLayout'
import { CorporatePage } from '@/components/portal/CorporatePage'

export default function CorporatePageRoute() {
  return (
    <PublicPageLayout>
      <CorporatePage />
    </PublicPageLayout>
  )
}
