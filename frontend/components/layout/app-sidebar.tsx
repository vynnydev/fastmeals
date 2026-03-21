'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  UtensilsCrossed,
  ChevronLeft,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { useEffect } from 'react'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Pedidos', href: '/orders', icon: ShoppingBag },
  { title: 'Produtos', href: '/products', icon: Package },
  { title: 'Entregadores', href: '/delivery', icon: Truck },
  { title: 'Relatórios', href: '/reports', icon: BarChart3 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, setMobileMenuOpen])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setMobileMenuOpen])

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <span className="text-lg font-bold text-sidebar-foreground">FastMeals</span>
          )}
        </Link>
        {/* Desktop collapse */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 hidden lg:flex"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
        </Button>
        {/* Mobile close */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const showLabel = !sidebarCollapsed || mobileMenuOpen

          const NavLink = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-primary-foreground')} />
              {showLabel && <span>{item.title}</span>}
            </Link>
          )

          if (sidebarCollapsed && !mobileMenuOpen) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          }
          return <div key={item.href}>{NavLink}</div>
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-3 bg-sidebar-accent/50',
          sidebarCollapsed && !mobileMenuOpen && 'justify-center p-2'
        )}>
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || user?.email || 'Usuário'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.role === 'admin' ? 'Administrador' : 'Visualizador'}
              </p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 text-sidebar-foreground/60 hover:text-destructive flex-shrink-0',
                  sidebarCollapsed && !mobileMenuOpen && 'hidden'
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </>
  )

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:hidden',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 hidden lg:flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}>
        {sidebarContent}
      </aside>
    </TooltipProvider>
  )
}