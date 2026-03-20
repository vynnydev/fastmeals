'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  Truck,
  XCircle,
  CheckCircle,
  CreditCard,
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
import type { Order, PaymentMethod } from '@/types'
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

const paymentMethodIcons: Record<PaymentMethod, React.ReactNode> = {
  credit_card: <CreditCard className="h-4 w-4" />,
  debit_card: <CreditCard className="h-4 w-4" />,
  pix: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  cash: <span className="text-sm font-bold">$</span>,
  voucher: <span className="text-sm">V</span>,
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
    }).format(value)
  }

  const allSelected = orders.length > 0 && selectedOrders.length === orders.length
  const someSelected = selectedOrders.length > 0 && selectedOrders.length < orders.length

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
            <TableHead className="font-medium">Pagamento</TableHead>
            <TableHead className="font-medium">Metodo</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Rastreio</TableHead>
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
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
              <TableCell>
                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.payment_status} variant="payment" size="sm" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {paymentMethodIcons[order.payment_method]}
                  <span className="text-sm capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} size="sm" />
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm">
                {order.delivery_person_id ? `#${order.delivery_person_id.slice(0, 8)}` : '-'}
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
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'confirmed')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar
                      </DropdownMenuItem>
                    )}
                    {order.status === 'confirmed' && (
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
                    {order.status === 'ready' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'out_for_delivery')}>
                        <Truck className="mr-2 h-4 w-4" />
                        Enviar para entrega
                      </DropdownMenuItem>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivered')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como entregue
                      </DropdownMenuItem>
                    )}
                    {!['delivered', 'cancelled'].includes(order.status) && (
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
