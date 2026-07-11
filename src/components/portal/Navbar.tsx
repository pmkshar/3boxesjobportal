'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthDialog } from './AuthDialog'
import { ThreeBoxesLogo } from './LandingPage'
import { Menu, Bell, LogOut, User, Settings, ChevronDown, Search, X, Briefcase, Plus } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme } = useTheme()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [notifCount, setNotifCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

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
      <header className="sticky top-0 z-50 bg-white border-b border-[#E4E8EC] shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Left: Logo + Role badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ThreeBoxesLogo size={32} />
              <span className="text-lg font-bold text-[#05264E]">3 Boxes <span style={{ color: theme.primary }}>Jobs</span></span>
            </div>
            {isAuthenticated && user && (
              <Badge className="hidden sm:inline-flex text-[10px] font-semibold border-0 rounded-full px-3 py-0.5"
                style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                {roleLabel} Area
              </Badge>
            )}
          </div>

          {/* Center: Search (desktop) - JobBox style */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66789C]" />
                <Input
                  placeholder="Search jobs, candidates, companies..."
                  className="pl-10 h-10 bg-[#F9FAFB] border-[#E4E8EC] rounded-xl text-sm focus:bg-white transition-all"
                  style={{ 
                    // @ts-ignore - CSS custom property
                    '--tw-ring-color': `${theme.primary}20`,
                    borderColor: undefined,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary
                    e.target.style.boxShadow = `0 0 0 3px ${theme.primary}15`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = ''
                    e.target.style.boxShadow = ''
                  }}
                />
              </div>
            </div>
          )}

          {/* Right: Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1">
              {/* Post Job button - for corporate */}
              {user.role === 'CORPORATE' && (
                <Button className="hidden md:inline-flex text-white text-xs font-semibold rounded-lg px-4 h-9"
                  style={{ backgroundColor: theme.primary }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Post Job
                </Button>
              )}

              {/* Mobile search toggle */}
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-[#66789C]"
                style={{ color: '#66789C' }}
                onClick={() => setSearchOpen(!searchOpen)}>
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-[#66789C]"
                onClick={() => {}}>
                <Bell className="h-[18px] w-[18px]" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#EF4444] text-white text-[10px] font-medium flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Button>

              {/* Profile dropdown - JobBox style */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 pl-2 pr-2 py-1 rounded-xl hover:bg-[#F9FAFB] transition-colors ml-1">
                    <Avatar className="h-9 w-9 border-2 border-[#E4E8EC]">
                      <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-[#05264E] leading-tight">{user.name}</p>
                      <p className="text-[10px] text-[#66789C] leading-tight">{roleLabel}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-[#66789C] hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 mt-1 border-[#E4E8EC] shadow-lg rounded-xl">
                  <div className="px-3 py-2 border-b border-[#F0F2F5]">
                    <p className="text-sm font-semibold text-[#05264E]">{user.name}</p>
                    <p className="text-xs text-[#66789C]">{user.email}</p>
                  </div>
                  <DropdownMenuItem className="text-sm text-[#05264E] focus:bg-[#F9FAFB] focus:text-[#05264E]">
                    <User className="mr-2 h-4 w-4 text-[#66789C]" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm text-[#05264E] focus:bg-[#F9FAFB] focus:text-[#05264E]">
                    <Settings className="mr-2 h-4 w-4 text-[#66789C]" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#F0F2F5]" />
                  <DropdownMenuItem onClick={handleLogout} className="text-sm text-[#EF4444] focus:bg-[#FEF2F2] focus:text-[#EF4444]">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[#05264E] hover:bg-[var(--theme-primary-light)] font-medium text-sm"
                style={{ color: '#05264E' }}
                onClick={() => { setAuthTab('login'); setAuthOpen(true) }}>
                Login
              </Button>
              <Button size="sm" className="text-white font-semibold rounded-lg px-5 text-sm"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primaryHover }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = theme.primary }}
                onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile search bar */}
        {searchOpen && isAuthenticated && (
          <div className="lg:hidden px-4 pb-3 border-t border-[#F0F2F5]">
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66789C]" />
              <Input placeholder="Search jobs, candidates..." className="pl-10 h-9 bg-[#F9FAFB] border-[#E4E8EC] text-sm rounded-lg" />
            </div>
          </div>
        )}
      </header>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />
    </>
  )
}
