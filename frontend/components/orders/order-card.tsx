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
    }).format(value || 0)
  }

  const getDate = () => {
    const dateStr = order.createdAt || order.created_at
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), "dd MMM, HH:mm", { locale: ptBR })
    } catch {
      return '-'
    }
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md',
        isDragging && 'rotate-2 shadow-xl border-primary',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">#{order.id.slice(0, 8)}</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(order.totalAmount || order.total || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {getDate()}
          </div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-foreground truncate">
            {order.customerName || order.customer_name || 'Cliente'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
            {order.customerPhone || order.customer_phone || '-'}
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground line-clamp-2">
            {order.deliveryAddress || order.delivery_address || '-'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {(order.delivery_person_name || order.deliveryPersonId) && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">E</span>
            </div>
            <span className="text-sm text-foreground">
              {order.delivery_person_name || `#${(order.deliveryPersonId || '').slice(0, 8)}`}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}