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
import { OrderCreateModal } from '@/components/orders/order-create-modal'
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
import { useRole } from '@/hooks/use-auth'
import { ordersApi } from '@/lib/api'
import type { Order, OrderStatus, ViewMode } from '@/types'
import { cn } from '@/lib/utils'

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'ready', label: 'Prontos' },
  { value: 'delivering', label: 'Em Entrega' },
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
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const { canWrite } = useRole()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await ordersApi.getAll()
        setOrders(data)
      } catch (error) {
        toast.error('Erro ao carregar pedidos')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    let result = orders
  
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter)
    }
  
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          (order.customerName || order.customer_name || '').toLowerCase().includes(query) ||
          (order.customerPhone || order.customer_phone || '').includes(query)
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

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status)
      const data = await ordersApi.getAll()
      setOrders(data)
      toast.success(`Status atualizado para ${status}`)
      setModalOpen(false)
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await ordersApi.getAll()
      setOrders(data)
      toast.success('Pedidos atualizados')
    } catch (error) {
      toast.error('Erro ao atualizar pedidos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">
          {orders.length} pedidos • {orders.filter(o => o.status === 'pending').length} pendentes • {orders.filter(o => o.status === 'delivered').length} entregues
        </p>
      </div>
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
              <Button className="gold-gradient text-primary-foreground gap-2" onClick={() => setCreateModalOpen(true)}>
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
                      <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName || order.customer_name}</p>
                    </div>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(order.totalAmount || order.total || 0)}
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

        {/* Order Create Modal */}
        <OrderCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleRefresh}
        />

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
