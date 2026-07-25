import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'JOB_SEEKER' | 'CORPORATE' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN' | 'HR_MANAGER' | 'INTERVIEWER'

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  location?: string
  twoFactorEnabled?: boolean
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  requires2FA: boolean
  tempToken: string | null
  login: (user: AuthUser, token: string, refreshToken?: string) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  setLoading: (loading: boolean) => void
  setRequires2FA: (tempToken: string) => void
  clear2FAState: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      tempToken: null,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false, requires2FA: false, tempToken: null }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false, requires2FA: false, tempToken: null }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setRequires2FA: (tempToken) =>
        set({ requires2FA: true, tempToken, isAuthenticated: false, isLoading: false }),
      clear2FAState: () =>
        set({ requires2FA: false, tempToken: null }),
    }),
    {
      name: '3boxes-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Prevent Zustand from rehydrating during SSR/hydration
      skipHydration: true,
    }
  )
)
