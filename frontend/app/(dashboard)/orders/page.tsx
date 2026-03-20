'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { OrderTable } from '@/components/orders/order-table'
import { OrderKanban } from '@/components/orders/order-kanban'
import { OrderDetailModal } from '@/components/orders/order-detail-modal'
import { TableSkeleton } from '@/components/shared/skeleton-loader'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  List,
  LayoutGrid,
  Columns3,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOrderWebSocket } from '@/hooks/use-websocket'
import { useRole } from '@/hooks/use-auth'
import type { Order, OrderStatus, ViewMode } from '@/types'
import { cn } from '@/lib/utils'

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: '1',
    order_number: '#4772827',
    customer_name: 'John Smith',
    customer_phone: '11999998888',
    customer_email: 'john@email.com',
    delivery_address: 'Rua das Flores, 123 - Centro',
    items: [
      { id: '1', product_id: '1', product_name: 'Hamburguer Classico', quantity: 2, unit_price: 25.5, total_price: 51.0 },
      { id: '2', product_id: '2', product_name: 'Batata Frita', quantity: 1, unit_price: 12.0, total_price: 12.0 },
    ],
    subtotal: 63.0,
    delivery_fee: 5.0,
    total: 120.75,
    status: 'delivered',
    payment_method: 'debit_card',
    payment_status: 'paid',
    delivery_person_id: '1',
    delivery_person_name: 'Carlos Silva',
    created_at: '2024-06-24T21:23:00Z',
    updated_at: '2024-06-24T22:15:00Z',
  },
  {
    id: '2',
    order_number: '#5839201',
    customer_name: 'Emily Johnson',
    customer_phone: '11988887777',
    delivery_address: 'Av. Brasil, 456 - Jardins',
    items: [
      { id: '3', product_id: '3', product_name: 'Pizza Margherita', quantity: 1, unit_price: 45.0, total_price: 45.0 },
    ],
    subtotal: 45.0,
    delivery_fee: 8.0,
    total: 250.0,
    status: 'delivered',
    payment_method: 'credit_card',
    payment_status: 'paid',
    delivery_person_id: '2',
    delivery_person_name: 'Ana Costa',
    created_at: '2023-03-15T14:45:00Z',
    updated_at: '2023-03-15T15:30:00Z',
  },
  {
    id: '3',
    order_number: '#6273845',
    customer_name: 'Michael Brown',
    customer_phone: '11977776666',
    delivery_address: 'Praca Central, 789',
    items: [
      { id: '4', product_id: '4', product_name: 'Salada Caesar', quantity: 2, unit_price: 28.0, total_price: 56.0 },
      { id: '5', product_id: '5', product_name: 'Suco Natural', quantity: 2, unit_price: 8.0, total_price: 16.0 },
    ],
    subtotal: 72.0,
    delivery_fee: 6.0,
    total: 89.99,
    status: 'delivered',
    payment_method: 'pix',
    payment_status: 'paid',
    created_at: '2022-04-10T11:30:00Z',
    updated_at: '2022-04-10T12:00:00Z',
  },
  {
    id: '4',
    order_number: '#7382910',
    customer_name: 'Jessica Davis',
    customer_phone: '11966665555',
    delivery_address: 'Rua Augusta, 1500',
    items: [
      { id: '6', product_id: '6', product_name: 'Combo Familia', quantity: 1, unit_price: 89.9, total_price: 89.9 },
    ],
    subtotal: 89.9,
    delivery_fee: 0,
    total: 1500.2,
    status: 'pending',
    payment_method: 'pix',
    payment_status: 'pending',
    created_at: '2023-02-28T18:15:00Z',
    updated_at: '2023-02-28T18:15:00Z',
  },
  {
    id: '5',
    order_number: '#8491763',
    customer_name: 'Daniel Wilson',
    customer_phone: '11955554444',
    delivery_address: 'Rua Oscar Freire, 200',
    items: [
      { id: '7', product_id: '7', product_name: 'Wrap Vegetariano', quantity: 3, unit_price: 22.0, total_price: 66.0 },
    ],
    subtotal: 66.0,
    delivery_fee: 5.0,
    total: 45.5,
    status: 'preparing',
    payment_method: 'pix',
    payment_status: 'paid',
    created_at: '2024-05-19T19:55:00Z',
    updated_at: '2024-05-19T20:00:00Z',
  },
  {
    id: '6',
    order_number: '#9503842',
    customer_name: 'Sarah Miller',
    customer_phone: '11944443333',
    delivery_address: 'Alameda Santos, 800',
    items: [
      { id: '8', product_id: '8', product_name: 'Poke Bowl', quantity: 2, unit_price: 42.0, total_price: 84.0 },
    ],
    subtotal: 84.0,
    delivery_fee: 7.0,
    total: 360.0,
    status: 'ready',
    payment_method: 'credit_card',
    payment_status: 'paid',
    created_at: '2024-01-03T12:05:00Z',
    updated_at: '2024-01-03T12:30:00Z',
  },
  {
    id: '7',
    order_number: '#1627493',
    customer_name: 'David Anderson',
    customer_phone: '11933332222',
    delivery_address: 'Rua Haddock Lobo, 450',
    items: [
      { id: '9', product_id: '9', product_name: 'Acai Premium', quantity: 1, unit_price: 35.0, total_price: 35.0 },
    ],
    subtotal: 35.0,
    delivery_fee: 5.0,
    total: 299.99,
    status: 'out_for_delivery',
    payment_method: 'pix',
    payment_status: 'paid',
    delivery_person_id: '3',
    delivery_person_name: 'Pedro Santos',
    created_at: '2023-07-21T20:40:00Z',
    updated_at: '2023-07-21T21:00:00Z',
  },
  {
    id: '8',
    order_number: '#2738915',
    customer_name: 'Laura Taylor',
    customer_phone: '11922221111',
    delivery_address: 'Rua Bela Cintra, 600',
    items: [
      { id: '10', product_id: '10', product_name: 'Tacos Mexicanos', quantity: 4, unit_price: 18.0, total_price: 72.0 },
    ],
    subtotal: 72.0,
    delivery_fee: 6.0,
    total: 580.75,
    status: 'confirmed',
    payment_method: 'debit_card',
    payment_status: 'paid',
    created_at: '2023-09-16T15:25:00Z',
    updated_at: '2023-09-16T15:30:00Z',
  },
]

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'ready', label: 'Prontos' },
  { value: 'out_for_delivery', label: 'Em Entrega' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { canWrite } = useRole()
  const { isConnected, isUsingPolling } = useOrderWebSocket({ enabled: true })

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setOrders(mockOrders)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredOrders = useMemo(() => {
    let result = orders

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_phone.includes(query)
      )
    }

    return result
  }, [orders, statusFilter, searchQuery])

  const handleSelectOrder = (orderId: string, selected: boolean) => {
    if (selected) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setModalOpen(true)
  }

  const handleUpdateStatus = (orderId: string, status: string) => {
    // Simulate API call
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: status as OrderStatus } : order
      )
    )
    toast.success(`Status atualizado para ${status}`)
    setModalOpen(false)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setOrders(mockOrders)
      setIsLoading(false)
      toast.success('Pedidos atualizados')
    }, 500)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Pedidos" />

      <div className="flex-1 p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
              isConnected 
                ? 'bg-status-delivered/20 text-status-delivered' 
                : isUsingPolling 
                  ? 'bg-status-pending/20 text-status-pending'
                  : 'bg-muted text-muted-foreground'
            )}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="hidden sm:inline">Tempo real</span>
                </>
              ) : isUsingPolling ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Polling</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="table" className="px-3">
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="cards" className="px-3">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="kanban" className="px-3">
                  <Columns3 className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Refresh */}
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>

            {/* New Order (Admin only) */}
            {canWrite && (
              <Button className="gold-gradient text-primary-foreground gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Pedido</span>
              </Button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => {
            const count = filter.value === 'all' 
              ? orders.length 
              : orders.filter((o) => o.status === filter.value).length
            
            return (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'flex-shrink-0',
                  statusFilter === filter.value && 'gold-gradient text-primary-foreground'
                )}
              >
                {filter.label}
                <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
                  {count}
                </span>
              </Button>
            )
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          viewMode === 'kanban' ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-shrink-0 w-80 h-96 rounded-xl bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <TableSkeleton rows={8} columns={10} />
          )
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            type="orders"
            title={searchQuery ? 'Nenhum pedido encontrado' : undefined}
            description={
              searchQuery
                ? 'Tente ajustar os filtros ou termos de busca.'
                : undefined
            }
            actionLabel={canWrite ? 'Criar Pedido' : undefined}
            onAction={canWrite ? () => {} : undefined}
          />
        ) : viewMode === 'kanban' ? (
          <OrderKanban
            orders={filteredOrders}
            onViewOrder={handleViewOrder}
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="cursor-pointer"
                onClick={() => handleViewOrder(order)}
              >
                <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(order.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {order.items.length} itens
                    </span>
                    <div className="flex gap-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        order.payment_status === 'paid' 
                          ? 'bg-status-delivered/20 text-status-delivered'
                          : 'bg-status-pending/20 text-status-pending'
                      )}>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <OrderTable
            orders={filteredOrders}
            selectedOrders={selectedOrders}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  )
}
