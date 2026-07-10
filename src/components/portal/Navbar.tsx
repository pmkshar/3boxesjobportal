'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthDialog } from './AuthDialog'
import { ThreeBoxesLogo } from './LandingPage'
import { Menu, Bell, LogOut, User, Settings, ChevronDown, Search, X } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [notifCount, setNotifCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then(r => r.json())
        .then(data => setNotifCount(data.unreadCount || 0))
        .catch(() => {})
    }
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const roleLabel = user?.role === 'JOB_SEEKER' ? 'Job Seeker' : user?.role === 'CORPORATE' ? 'Employer' : user?.role === 'RECRUITER' ? 'Recruiter' : 'Admin'

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Left: Logo + Role badge */}
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <ThreeBoxesLogo size={32} />
              <span className="text-lg font-bold text-[#05264E]">3 Boxes <span className="text-[#3B82F6]">Jobs</span></span>
            </div>
            {isAuthenticated && user && (
              <Badge className="hidden sm:inline-flex text-xs font-medium bg-[#E7F0FA] text-[#3B82F6] border-0 rounded-full px-3 py-0.5">
                {roleLabel} Area
              </Badge>
            )}
          </div>

          {/* Center: Search (desktop) */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, candidates, companies..."
                  className="pl-9 h-9 bg-[#F9FAFB] border-gray-200 rounded-lg text-sm focus:bg-white focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20"
                />
              </div>
            </div>
          )}

          {/* Right: Notifications + Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-gray-500 hover:text-[#3B82F6]"
                onClick={() => setSearchOpen(!searchOpen)}>
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-gray-500 hover:text-[#3B82F6] hover:bg-[#E7F0FA]" onClick={() => {}}>
                <Bell className="h-4 w-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#EF4444] text-white text-[10px] font-medium flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#3B82F6] text-white text-xs font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-[#05264E] leading-tight">{user.name}</p>
                      <p className="text-xs text-[#66789C] leading-tight">{roleLabel}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-[#66789C] hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-1">
                  <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[#05264E] hover:text-[#3B82F6] hover:bg-[#E7F0FA] font-medium"
                onClick={() => { setAuthTab('login'); setAuthOpen(true) }}>
                Login
              </Button>
              <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-lg px-5"
                onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile search bar */}
        {searchOpen && isAuthenticated && (
          <div className="lg:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search..." className="pl-9 h-9 bg-[#F9FAFB] border-gray-200 text-sm" />
            </div>
          </div>
        )}
      </header>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />
    </>
  )
}
