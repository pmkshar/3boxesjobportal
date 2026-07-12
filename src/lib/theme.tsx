'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeColor = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'teal'

interface ThemeConfig {
  name: string
  color: ThemeColor
  primary: string        // Main brand color (e.g., #059669)
  primaryHover: string   // Darker version for hover (e.g., #047857)
  primaryLight: string   // Very light bg tint (e.g., #ECFDF5)
  primaryMedium: string  // Medium tint for badges/bg (e.g., #D1FAE5)
  primaryRing: string    // Ring/focus color (e.g., #10B981)
  sidebar: string        // Sidebar background (dark)
  sidebarHover: string   // Sidebar item hover
  sidebarActive: string  // Sidebar active indicator
  gradient: string       // Gradient from primary
  swatch: string         // Small preview swatch hex
}

export const themes: Record<ThemeColor, ThemeConfig> = {
  green: {
    name: 'Emerald',
    color: 'green',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ECFDF5',
    primaryMedium: '#D1FAE5',
    primaryRing: '#10B981',
    sidebar: '#064E3B',
    sidebarHover: '#065F46',
    sidebarActive: '#10B981',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    swatch: '#059669',
  },
  blue: {
    name: 'Ocean Blue',
    color: 'blue',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryLight: '#EFF6FF',
    primaryMedium: '#DBEAFE',
    primaryRing: '#3B82F6',
    sidebar: '#0A1629',
    sidebarHover: '#0F1D35',
    sidebarActive: '#3B82F6',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    swatch: '#2563EB',
  },
  purple: {
    name: 'Royal Purple',
    color: 'purple',
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    primaryLight: '#F5F3FF',
    primaryMedium: '#EDE9FE',
    primaryRing: '#8B5CF6',
    sidebar: '#2E1065',
    sidebarHover: '#3B0F80',
    sidebarActive: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    swatch: '#7C3AED',
  },
  orange: {
    name: 'Sunset Orange',
    color: 'orange',
    primary: '#EA580C',
    primaryHover: '#C2410C',
    primaryLight: '#FFF7ED',
    primaryMedium: '#FED7AA',
    primaryRing: '#F97316',
    sidebar: '#431407',
    sidebarHover: '#5C1D0E',
    sidebarActive: '#F97316',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
    swatch: '#EA580C',
  },
  red: {
    name: 'Crimson Red',
    color: 'red',
    primary: '#DC2626',
    primaryHover: '#B91C1C',
    primaryLight: '#FEF2F2',
    primaryMedium: '#FECACA',
    primaryRing: '#EF4444',
    sidebar: '#450A0A',
    sidebarHover: '#5C1111',
    sidebarActive: '#EF4444',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    swatch: '#DC2626',
  },
  teal: {
    name: 'Ocean Teal',
    color: 'teal',
    primary: '#0D9488',
    primaryHover: '#0F766E',
    primaryLight: '#F0FDFA',
    primaryMedium: '#CCFBF1',
    primaryRing: '#14B8A6',
    sidebar: '#042F2E',
    sidebarHover: '#0D3D3B',
    sidebarActive: '#14B8A6',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    swatch: '#0D9488',
  },
}

interface ThemeContextType {
  theme: ThemeConfig
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.green,
  themeColor: 'green',
  setThemeColor: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('3boxes-theme') as ThemeColor | null
      if (saved && themes[saved]) return saved
    }
    return 'green'
  })

  useEffect(() => {
    const root = document.documentElement
    const t = themes[themeColor]

    root.style.setProperty('--theme-primary', t.primary)
    root.style.setProperty('--theme-primary-hover', t.primaryHover)
    root.style.setProperty('--theme-primary-light', t.primaryLight)
    root.style.setProperty('--theme-primary-medium', t.primaryMedium)
    root.style.setProperty('--theme-primary-ring', t.primaryRing)
    root.style.setProperty('--theme-sidebar', t.sidebar)
    root.style.setProperty('--theme-sidebar-hover', t.sidebarHover)
    root.style.setProperty('--theme-sidebar-active', t.sidebarActive)
    root.style.setProperty('--theme-gradient', t.gradient)

    localStorage.setItem('3boxes-theme', themeColor)
  }, [themeColor])

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
  }

  const theme = themes[themeColor]

  return (
    <ThemeContext.Provider value={{ theme, themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
