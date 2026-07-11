'use client'

import { useTheme, themes, ThemeColor } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Palette } from 'lucide-react'

export function ThemeSwitcher() {
  const { themeColor, setThemeColor, theme } = useTheme()

  const themeKeys = Object.keys(themes) as ThemeColor[]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
          title="Change Theme"
        >
          <Palette className="h-5 w-5 flex-shrink-0" />
          <span className="hidden lg:inline">Theme</span>
          <span
            className="hidden lg:inline ml-auto w-4 h-4 rounded-full border-2 border-white/30 flex-shrink-0"
            style={{ backgroundColor: theme.swatch }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="right"
        className="w-56 p-3 border-[var(--theme-primary-light)] shadow-xl rounded-xl"
      >
        <p className="text-sm font-semibold text-[#05264E] mb-3">Choose Theme Color</p>
        <div className="grid grid-cols-2 gap-2">
          {themeKeys.map((key) => {
            const t = themes[key]
            const isActive = themeColor === key
            return (
              <button
                key={key}
                onClick={() => setThemeColor(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-light)]'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-offset-1"
                  style={{
                    backgroundColor: t.swatch,
                    ringColor: isActive ? t.primary : 'transparent',
                  }}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-[var(--theme-primary)]' : 'text-[#05264E]'
                  }`}
                >
                  {t.name}
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
