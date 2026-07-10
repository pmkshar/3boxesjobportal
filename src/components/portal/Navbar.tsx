'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthDialog } from './AuthDialog'
import { ThreeBoxesLogo } from './LandingPage'
import { Menu, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [notifCount, setNotifCount] = useState(0)

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

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#166534] shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThreeBoxesLogo size={28} />
            <span className="text-lg font-bold text-white">3 Boxes <span className="text-yellow-300">Jobs</span></span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex text-xs capitalize bg-white/20 text-white border-white/30">
                {user.role.replace('_', ' ')}
              </Badge>

              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10" onClick={() => {}}>
                <Bell className="h-4 w-4" />
                {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF8C00] text-white text-[10px] flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 text-white hover:bg-white/10">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-3 w-3 text-white/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
              <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10"
                onClick={() => { setAuthTab('login'); setAuthOpen(true) }}>
                Login
              </Button>
              <Button size="sm" className="bg-[#FF8C00] hover:bg-[#E07B00] text-white font-semibold"
                onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
                Register
              </Button>
            </div>
          )}
        </div>
      </nav>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />
    </>
  )
}
