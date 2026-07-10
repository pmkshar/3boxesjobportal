'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AuthDialog } from './AuthDialog'
import { ThreeBoxesLogo } from './LandingPage'
import { Menu, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [notifCount, setNotifCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

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
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThreeBoxesLogo size={28} />
            <span className="text-lg font-bold text-gray-900">3 Boxes <span className="text-emerald-600">Jobs</span></span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex text-xs capitalize">
                {user.role.replace('_', ' ')}
              </Badge>

              <Button variant="ghost" size="icon" className="relative" onClick={() => {}}>
                <Bell className="h-4 w-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
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
              <Button variant="ghost" size="sm" onClick={() => { setAuthTab('login'); setAuthOpen(true) }}>
                Login
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />
    </>
  )
}
