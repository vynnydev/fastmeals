import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest } from '@/types'
import { authApi } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(credentials)
          
          const token = response.accessToken
          
          // Save token separately for axios interceptor
          if (typeof window !== 'undefined') {
            localStorage.setItem('fastmeals_token', token)
          }
          
          set({
            user: response.user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Erro ao fazer login. Verifique suas credenciais.'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: async () => {
        localStorage.removeItem('fastmeals_token')
        localStorage.removeItem('fastmeals-auth')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('fastmeals_token')
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null })
          return
        }
      
        // Token exists, check if user data is in store
        const { user } = get()
        if (user) {
          set({ isAuthenticated: true, token })
          return
        }
      
        // Try to get user from persisted state
        const persisted = localStorage.getItem('fastmeals-auth')
        if (persisted) {
          try {
            const parsed = JSON.parse(persisted)
            if (parsed.state?.user) {
              set({
                user: parsed.state.user,
                token,
                isAuthenticated: true,
              })
              return
            }
          } catch {
            // Invalid persisted state
          }
        }
      
        // No user data, clear token
        localStorage.removeItem('fastmeals_token')
        set({ isAuthenticated: false, user: null, token: null })
      },
    }),
    {
      name: 'fastmeals-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
