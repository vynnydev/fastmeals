'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Clock,
  MapPin,
  Phone,
  User,
  Mail,
  CreditCard,
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
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

const statusTransitions: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending: { next: 'confirmed', label: 'Confirmar Pedido' },
  confirmed: { next: 'preparing', label: 'Iniciar Preparo' },
  preparing: { next: 'ready', label: 'Marcar como Pronto' },
  ready: { next: 'out_for_delivery', label: 'Enviar para Entrega' },
  out_for_delivery: { next: 'delivered', label: 'Marcar como Entregue' },
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
    }).format(value)
  }

  const transition = statusTransitions[order.status]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Pedido {order.order_number}
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
              Informacoes do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereco de Entrega</p>
                  <p className="font-medium">{order.delivery_address}</p>
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
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left py-2 px-4 text-sm font-medium">Item</th>
                    <th className="text-center py-2 px-4 text-sm font-medium">Qtd</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Preco</th>
                    <th className="text-right py-2 px-4 text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Totals */}
            <div className="flex flex-col items-end gap-1 pt-2">
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">Entrega:</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
              <Separator className="w-48 my-1" />
              <div className="flex justify-between w-48">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pagamento
              </h3>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Metodo</p>
                  <p className="font-medium capitalize">
                    {order.payment_method.replace('_', ' ')}
                  </p>
                </div>
                <StatusBadge status={order.payment_status} variant="payment" size="sm" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Entrega
              </h3>
              {order.delivery_person_name ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entregador</p>
                    <p className="font-medium">{order.delivery_person_name}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Entregador nao atribuido</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Criado: {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Atualizado: {format(new Date(order.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
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
