'use client'

import { Clock, MapPin, Phone, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OrderCardProps {
  order: Order
  onClick?: () => void
  isDragging?: boolean
  className?: string
}

export function OrderCard({ order, onClick, isDragging, className }: OrderCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md',
        isDragging && 'rotate-2 shadow-xl border-primary',
        'animate-card-enter',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{order.order_number}</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {format(new Date(order.created_at), "dd MMM, HH:mm", { locale: ptBR })}
          </div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      {/* Customer Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-foreground truncate">{order.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">{order.customer_phone}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground line-clamp-2">{order.delivery_address}</span>
        </div>
      </div>

      {/* Items summary */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
        </span>
        <StatusBadge status={order.payment_status} variant="payment" size="sm" />
      </div>

      {/* Delivery person */}
      {order.delivery_person_name && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {order.delivery_person_name.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-foreground">{order.delivery_person_name}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
