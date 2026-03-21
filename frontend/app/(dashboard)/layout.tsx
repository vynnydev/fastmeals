'use client'

import { useEffect, useState, useCallback } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()

  // Mark as client-side rendered
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check auth after client is ready
  useEffect(() => {
    if (isClient) {
      checkAuth()
    }
  }, [isClient, checkAuth])

  // Handle redirect after auth check completes
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      setShouldRedirect(true)
    }
  }, [isClient, isLoading, isAuthenticated])

  // Perform redirect using window.location to avoid router issues
  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = '/login'
    }
  }, [shouldRedirect])

  // Show loading state while checking auth or not yet client-side
  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if redirecting
  if (shouldRedirect || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        )}
      >
        <Header />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
