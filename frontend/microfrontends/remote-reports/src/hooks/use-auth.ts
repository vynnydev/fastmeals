interface User {
  id: string
  name?: string
  email: string
  role: 'admin' | 'viewer'
}

function getUser(): User | null {
  try {
    const raw = localStorage.getItem('fastmeals_user')
    if (raw) return JSON.parse(raw)

    const persisted = localStorage.getItem('fastmeals-auth')
    if (persisted) {
      const parsed = JSON.parse(persisted)
      if (parsed.state?.user) return parsed.state.user
    }

    return null
  } catch {
    return null
  }
}

export function useAuth() {
  const user = getUser()
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