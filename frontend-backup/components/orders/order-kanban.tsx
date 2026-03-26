'use client'

import { useMemo } from 'react'
import { OrderCard } from './order-card'
import { KanbanColumnSkeleton } from '@/components/shared/skeleton-loader'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface OrderKanbanProps {
  orders: Order[]
  onViewOrder: (order: Order) => void
  isLoading?: boolean
}

const columns: { id: OrderStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pendentes', color: 'bg-status-pending' },
  { id: 'preparing', title: 'Preparando', color: 'bg-status-preparing' },
  { id: 'ready', title: 'Prontos', color: 'bg-status-ready' },
  { id: 'delivered', title: 'Entregues', color: 'bg-status-delivered' },
]

export function OrderKanban({ orders, onViewOrder, isLoading }: OrderKanbanProps) {
  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      pending: [],
      preparing: [],
      ready: [],
      delivering: [],
      delivered: [],
      cancelled: [],
    }

    orders.forEach((order) => {
      if (grouped[order.status]) {
        grouped[order.status].push(order)
      }
    })

    return grouped
  }, [orders])

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.slice(0, 5).map((column) => (
          <KanbanColumnSkeleton key={column.id} />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 pb-4 min-h-[calc(100vh-280px)]">
        {columns.map((column) => {
          const columnOrders = ordersByStatus[column.id] || []
          const totalValue = columnOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0)

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 rounded-xl bg-card/30 border border-border"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', column.color)} />
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {columnOrders.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalValue)}
                </p>
              </div>

              {/* Column Content */}
              <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                {columnOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhum pedido nesta coluna
                    </p>
                  </div>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => onViewOrder(order)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
