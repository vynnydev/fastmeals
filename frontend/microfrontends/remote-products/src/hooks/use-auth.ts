import { useMemo } from 'react'

interface User {
  id: string
  name?: string
  email: string
  role: 'admin' | 'viewer'
}

function getUser(): User | null {
  try {
    const raw = localStorage.getItem('fastmeals_user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function useAuth() {
  const user = useMemo(() => getUser(), [])
  return { user, isAuthenticated: !!user }
}

export function useRole() {
  const { user } = useAuth()
  return {
    role: user?.role || 'viewer',
    isAdmin: user?.role === 'admin',
    canWrite: user?.role === 'admin',
  }
}