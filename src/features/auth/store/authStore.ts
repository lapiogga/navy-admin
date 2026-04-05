import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials } from '@/entities/user/types'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  sessionExpiry: number | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  checkSession: () => boolean
}

const SESSION_DURATION = 30 * 60 * 1000  // 30분

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionExpiry: null,
      login: async (credentials) => {
        const response = await apiClient.post<unknown, ApiResult<{ token: string; user: User }>>(
          '/auth/login',
          credentials,
        )
        if (!response.success) {
          throw new Error(response.message ?? '인증 실패')
        }
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          sessionExpiry: Date.now() + SESSION_DURATION,
        })
      },
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionExpiry: null,
        }),
      checkSession: () => {
        const { sessionExpiry } = get()
        if (!sessionExpiry) return false
        if (Date.now() > sessionExpiry) {
          get().logout()
          return false
        }
        return true
      },
    }),
    { name: 'auth-storage' },
  ),
)
