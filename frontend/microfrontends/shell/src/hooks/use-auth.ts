import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'

export function useAuth(requireAuth = true) {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate])

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