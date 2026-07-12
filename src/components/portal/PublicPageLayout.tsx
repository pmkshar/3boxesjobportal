'use client'

import { PortalNavbar } from '@/components/portal/PortalNavbar'
import { PortalFooter } from '@/components/portal/PortalFooter'

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PortalNavbar />
      <main className="flex-1">
        {children}
      </main>
      <PortalFooter />
    </div>
  )
}
