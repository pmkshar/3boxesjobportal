'use client'

import { Shield } from 'lucide-react'
import { ThreeBoxesLogo3D } from './LandingPage'
import Link from 'next/link'

export function PortalFooter() {
  return (
    <footer className="bg-[#0d3320] text-gray-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <ThreeBoxesLogo3D size={36} />
              <div>
                <span className="text-lg font-extrabold text-white">3 Boxes <span className="text-green-400">Jobs</span></span>
                <p className="text-[10px] text-green-400/60 uppercase tracking-wider">Skills · Resume · Career</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">India&apos;s first AI-powered career platform with smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching. The three boxes represent the complete career journey.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3.5 w-3.5" /> Your data is secure and private
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/find-jobs" className="hover:text-white cursor-pointer transition-colors">Find Jobs</Link></li>
              <li><Link href="/ai-features" className="hover:text-white cursor-pointer transition-colors">AI Resume Builder</Link></li>
              <li><Link href="/ai-features" className="hover:text-white cursor-pointer transition-colors">AI Mock Interviews</Link></li>
              <li><Link href="/training" className="hover:text-white cursor-pointer transition-colors">Training Hub</Link></li>
              <li><Link href="/ai-features" className="hover:text-white cursor-pointer transition-colors">Skill Auto-Update</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/corporate" className="hover:text-white cursor-pointer transition-colors">Post Jobs</Link></li>
              <li><Link href="/ai-features" className="hover:text-white cursor-pointer transition-colors">AI Candidate Matching</Link></li>
              <li><Link href="/corporate" className="hover:text-white cursor-pointer transition-colors">Corporate Benefits</Link></li>
              <li><Link href="/ai-features" className="hover:text-white cursor-pointer transition-colors">Analytics Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>&copy; 2025 3 Boxes Jobs. All rights reserved. Powered by AI.</span>
          <span>Demo: seeker@3boxes.com / demo123</span>
        </div>
      </div>
    </footer>
  )
}
