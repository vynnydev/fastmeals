'use client'

import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus, DeliveryPersonStatus } from '@/types'

type BadgeVariant = 'order' | 'payment' | 'delivery'

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | DeliveryPersonStatus
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendente',
    className: 'bg-status-pending/20 text-status-pending border-status-pending/30',
  },
  preparing: {
    label: 'Preparando',
    className: 'bg-status-preparing/20 text-status-preparing border-status-preparing/30',
  },
  ready: {
    label: 'Pronto',
    className: 'bg-status-ready/20 text-status-ready border-status-ready/30',
  },
  delivering: {
    label: 'Em Entrega',
    className: 'bg-status-delivering/20 text-status-delivering border-status-delivering/30',
  },
  delivered: {
    label: 'Entregue',
    className: 'bg-status-delivered/20 text-status-delivered border-status-delivered/30',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30',
  },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendente',
    className: 'bg-status-pending/20 text-status-pending border-status-pending/30',
  },
  paid: {
    label: 'Pago',
    className: 'bg-status-delivered/20 text-status-delivered border-status-delivered/30',
  },
  refunded: {
    label: 'Reembolsado',
    className: 'bg-status-confirmed/20 text-status-confirmed border-status-confirmed/30',
  },
  failed: {
    label: 'Falhou',
    className: 'bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30',
  },
}

const deliveryStatusConfig: Record<DeliveryPersonStatus, { label: string; className: string }> = {
  available: {
    label: 'Disponivel',
    className: 'bg-status-delivered/20 text-status-delivered border-status-delivered/30',
  },
  busy: {
    label: 'Ocupado',
    className: 'bg-status-delivering/20 text-status-delivering border-status-delivering/30',
  },
  offline: {
    label: 'Offline',
    className: 'bg-muted text-muted-foreground border-border',
  },
  on_break: {
    label: 'Em Pausa',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
}

export function StatusBadge({ status, variant = 'order', size = 'md', className }: StatusBadgeProps) {
  let config: { label: string; className: string }

  if (variant === 'payment') {
    config = paymentStatusConfig[status as PaymentStatus]
  } else if (variant === 'delivery') {
    config = deliveryStatusConfig[status as DeliveryPersonStatus]
  } else {
    config = orderStatusConfig[status as OrderStatus]
  }

  if (!config) {
    config = { label: status, className: 'bg-muted text-muted-foreground border-border' }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className,
        className
      )}
    >
      <span className={cn(
        'mr-1.5 h-1.5 w-1.5 rounded-full',
        config.className.includes('pending') && 'bg-status-pending',
        config.className.includes('confirmed') && 'bg-status-confirmed',
        config.className.includes('preparing') && 'bg-status-preparing',
        config.className.includes('ready') && 'bg-status-ready',
        config.className.includes('delivering') && 'bg-status-delivering',
        config.className.includes('delivered') && 'bg-status-delivered',
        config.className.includes('cancelled') && 'bg-status-cancelled',
        config.className.includes('muted') && 'bg-muted-foreground',
      )} />
      {config.label}
    </span>
  )
}
