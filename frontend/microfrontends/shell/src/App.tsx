import React, { Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import Login from './pages/Login'
import { useUIStore } from './stores/ui-store'
import { cn } from './lib/utils'

// Remote que já foi migrado
const OrdersPage = React.lazy(() => import('remoteOrders/OrdersPage'))
const ProductsPage = React.lazy(() => import('remoteProducts/ProductsPage'))
const DeliveryPage = React.lazy(() => import('remoteDelivery/DeliveryPage'))
const ReportsPage = React.lazy(() => import('remoteReports/ReportsPage'))

// Remotes ainda não migrados — placeholder local
// function ComingSoon({ name }: { name: string }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-20 text-center">
//       <p className="text-lg font-semibold text-foreground mb-2">{name}</p>
//       <p className="text-muted-foreground">Módulo em migração para microfrontend.</p>
//     </div>
//   )
// }

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="ml-3 text-muted-foreground">Carregando módulo...</span>
    </div>
  )
}

class RemoteErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { name: string; children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-20">
          <p className="text-destructive text-lg">Falha ao carregar: {this.props.name}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function RemotePage({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <RemoteErrorBoundary name={name}>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </RemoteErrorBoundary>
  )
}

function AuthenticatedLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}>
          <Header />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<RemotePage name="Orders"><OrdersPage /></RemotePage>} />
              <Route path="/products" element={<RemotePage name="Products"><ProductsPage /></RemotePage>} />
              <Route path="/delivery" element={<RemotePage name="Delivery"><DeliveryPage /></RemotePage>} />
              <Route path="/reports" element={<RemotePage name="Reports"><ReportsPage /></RemotePage>} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function App() {
  const { darkMode } = useUIStore()

  // Set dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AuthenticatedLayout />} />
      </Routes>
    </>
  )
}