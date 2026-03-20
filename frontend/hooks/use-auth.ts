'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, requireAuth, router])

  return {
    user,
    isAuthenticated,
    isLoading,
  }
}

export function useRole() {
  const { user } = useAuthStore()

  const isAdmin = user?.role === 'admin'
  const isViewer = user?.role === 'viewer'
  const canWrite = isAdmin

  return {
    role: user?.role,
    isAdmin,
    isViewer,
    canWrite,
  }
}
