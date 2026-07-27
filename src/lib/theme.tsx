'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeColor = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'teal'

interface ThemeConfig {
  name: string
  color: ThemeColor
  primary: string        // Main brand color (e.g., #056022)
  primaryHover: string   // Darker version for hover (e.g., #044d1a)
  primaryLight: string   // Very light bg tint (e.g., #f0f8f0)
  primaryMedium: string  // Medium tint for badges/bg (e.g., #d8ecd8)
  primaryRing: string    // Ring/focus color (e.g., #1e7d1e)
  sidebar: string        // Sidebar background (dark)
  sidebarHover: string   // Sidebar item hover
  sidebarActive: string  // Sidebar active indicator
  gradient: string       // Gradient from primary
  swatch: string         // Small preview swatch hex
  accent?: string        // Accent color (e.g., #fc7e0b for orange)
  accentHover?: string   // Accent hover color
  accentLight?: string   // Accent light bg tint
  accentRing?: string    // Accent ring/focus color
}

export const themes: Record<ThemeColor, ThemeConfig> = {
  green: {
    name: '3Boxes Green',
    color: 'green',
    primary: '#056022',
    primaryHover: '#044d1a',
    primaryLight: '#f0f8f0',
    primaryMedium: '#d8ecd8',
    primaryRing: '#1e7d1e',
    sidebar: '#0f172a',
    sidebarHover: '#056022',
    sidebarActive: '#fc7e0b',
    gradient: 'linear-gradient(135deg, #056022 0%, #fc7e0b 100%)',
    swatch: '#056022',
    accent: '#fc7e0b',
    accentHover: '#ea5703',
    accentLight: '#fff8eb',
    accentRing: '#fdba64',
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
    name: '3Boxes Orange',
    color: 'orange',
    primary: '#fc7e0b',
    primaryHover: '#ea5703',
    primaryLight: '#fff8eb',
    primaryMedium: '#fed7aa',
    primaryRing: '#fdba64',
    sidebar: '#0f172a',
    sidebarHover: '#056022',
    sidebarActive: '#fc7e0b',
    gradient: 'linear-gradient(135deg, #fc7e0b 0%, #056022 100%)',
    swatch: '#fc7e0b',
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
    // Accent color (orange from logo for green theme)
    if (t.accent) {
      root.style.setProperty('--theme-accent', t.accent)
      root.style.setProperty('--theme-accent-hover', t.accentHover || t.accent)
      root.style.setProperty('--theme-accent-light', t.accentLight || '#fff8eb')
      root.style.setProperty('--theme-accent-ring', t.accentRing || t.accent)
    }

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
