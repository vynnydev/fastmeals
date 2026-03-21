'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Clock,
  MapPin,
  Phone,
  User,
  Truck,
  Package,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/shared/status-badge'
import type { Order, OrderStatus } from '@/types'
import { useRole } from '@/hooks/use-auth'

interface OrderDetailModalProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (orderId: string, status: string) => void
}

const statusTransitions: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending: { next: 'preparing', label: 'Iniciar Preparo' },
  preparing: { next: 'ready', label: 'Marcar como Pronto' },
  ready: { next: 'delivering', label: 'Enviar para Entrega' },
  delivering: { next: 'delivered', label: 'Marcar como Entregue' },
  delivered: null,
  cancelled: null,
}

export function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const { canWrite } = useRole()

  if (!order) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)
  }

  const getDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch {
      return '-'
    }
  }

  // Field helpers with camelCase/snake_case fallbacks
  const customerName = order.customerName || order.customer_name || 'Cliente'
  const customerPhone = order.customerPhone || order.customer_phone || '-'
  const deliveryAddress = order.deliveryAddress || order.delivery_address || '-'
  const orderTotal = order.totalAmount || order.total || 0
  const orderId = order.order_number || `#${order.id.slice(0, 8)}`
  const createdAt = order.createdAt || order.created_at
  const updatedAt = order.updatedAt || order.updated_at
  const deliveryPersonId = order.deliveryPersonId || order.delivery_person_id
  const deliveryPersonName = order.delivery_person_name || (deliveryPersonId ? `#${deliveryPersonId.slice(0, 8)}` : null)

  const transition = statusTransitions[order.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Pedido {orderId}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço de Entrega</p>
                  <p className="font-medium">{deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Itens do Pedido
            </h3>
            {order.items && order.items.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-medium">Item</th>
                      <th className="text-center py-2 px-4 text-sm font-medium">Qtd</th>
                      <th className="text-right py-2 px-4 text-sm font-medium">Preço</th>
                      <th className="text-right py-2 px-4 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const itemName = item.product_name || (item as any).productName || `Item ${index + 1}`
                      const itemQty = item.quantity || 0
                      const itemPrice = item.unit_price || (item as any).unitPrice || 0
                      const itemTotal = item.total_price || (item as any).subtotal || itemPrice * itemQty

                      return (
                        <tr key={item.id || index} className="border-t border-border">
                          <td className="py-3 px-4">
                            <p className="font-medium">{itemName}</p>
                          </td>
                          <td className="py-3 px-4 text-center">{itemQty}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(itemPrice)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(itemTotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum item encontrado</p>
            )}

            {/* Order Total */}
            <div className="flex flex-col items-end gap-1 pt-2">
              <div className="flex justify-between w-48">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Entrega
            </h3>
            {deliveryPersonName ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entregador</p>
                  <p className="font-medium">{deliveryPersonName}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Entregador não atribuído</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Criado: {getDate(createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Atualizado: {getDate(updatedAt)}
            </div>
          </div>

          {/* Action Buttons */}
          {canWrite && transition && (
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {order.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Pedido
                </Button>
              )}
              <Button
                onClick={() => onUpdateStatus(order.id, transition.next)}
                className="gold-gradient text-primary-foreground"
              >
                {transition.label}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}