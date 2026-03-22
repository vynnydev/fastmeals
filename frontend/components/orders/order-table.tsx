'use client'

import { useState, useEffect } from 'react'
import { deliveryApi } from '@/lib/api'
import {
  MoreHorizontal,
  Eye,
  Truck,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OrderTableProps {
  orders: Order[]
  selectedOrders: string[]
  onSelectOrder: (orderId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onViewOrder: (order: Order) => void
  onUpdateStatus: (orderId: string, status: string) => void
  isLoading?: boolean
}

export function OrderTable({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onViewOrder,
  onUpdateStatus,
}: OrderTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  const getOrderDate = (order: Order): string => {
    const dateStr = order.createdAt || order.created_at
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: ptBR })
    } catch {
      return '-'
    }
  }

  const getCustomerName = (order: Order): string => {
    return (order as any).customerName || order.customer_name || 'Cliente'
  }

  const getOrderTotal = (order: Order): number => {
    return (order as any).totalAmount || order.total || 0
  }

  const getOrderItems = (order: Order): number => {
    return order.items?.length || 0
  }

  const getDeliveryPersonId = (order: Order): string | undefined => {
    return (order as any).deliveryPersonId || order.delivery_person_id
  }

  const getOrderId = (order: Order): string => {
    return order.order_number || `#${order.id.slice(0, 8)}`
  }

  const allSelected = orders.length > 0 && selectedOrders.length === orders.length
  const someSelected = selectedOrders.length > 0 && selectedOrders.length < orders.length

  const [driverNames, setDriverNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadDriverNames = async () => {
      const driverIds = [...new Set(orders.map(o => (o as any).deliveryPersonId || o.delivery_person_id).filter(Boolean))]
      if (driverIds.length === 0) return
      
      try {
        const allDrivers = await deliveryApi.getAll()
        const list = Array.isArray(allDrivers) ? allDrivers : (allDrivers as any).data || []
        const names: Record<string, string> = {}
        list.forEach((d: any) => {
          names[d.id] = d.name
        })
        setDriverNames(names)
      } catch {
        // ignore
      }
    }
    loadDriverNames()
  }, [orders])

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox
                checked={someSelected ? "indeterminate" : allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead className="font-medium">Pedido</TableHead>
            <TableHead className="font-medium">Cliente</TableHead>
            <TableHead className="font-medium">Total</TableHead>
            <TableHead className="font-medium">Itens</TableHead>
            <TableHead className="font-medium">Data</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Entregador</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                'cursor-pointer transition-colors',
                selectedOrders.includes(order.id) && 'bg-primary/5'
              )}
              onClick={() => onViewOrder(order)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={(checked) => onSelectOrder(order.id, !!checked)}
                />
              </TableCell>
              <TableCell className="font-medium font-mono text-sm">
                {getOrderId(order)}
              </TableCell>
              <TableCell>{getCustomerName(order)}</TableCell>
              <TableCell className="font-medium">{formatCurrency(getOrderTotal(order))}</TableCell>
              <TableCell>
                {getOrderItems(order)} {getOrderItems(order) === 1 ? 'item' : 'itens'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getOrderDate(order)}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} size="sm" />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {getDeliveryPersonId(order) 
                  ? driverNames[getDeliveryPersonId(order)!] || `#${getDeliveryPersonId(order)!.slice(0, 8)}`
                  : '-'
                }
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {order.status === 'pending' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'preparing')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Iniciar preparo
                      </DropdownMenuItem>
                    )}
                    {order.status === 'preparing' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'ready')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como pronto
                      </DropdownMenuItem>
                    )}
                    {order.status === 'ready' && (order.deliveryPersonId || order.delivery_person_id) && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivering')}>
                        <Truck className="mr-2 h-4 w-4" />
                        Enviar para entrega
                      </DropdownMenuItem>
                    )}
                    {order.status === 'delivering' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivered')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como entregue
                      </DropdownMenuItem>
                    )}
                    {!['delivered', 'cancelled', 'delivering'].includes(order.status) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar pedido
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}