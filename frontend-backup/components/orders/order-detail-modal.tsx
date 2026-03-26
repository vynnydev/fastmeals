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
import { useState, useEffect } from 'react'
import { deliveryApi, ordersApi } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { DeliveryPerson } from '@/types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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

function AssignDriverSection({ orderId, onAssigned }: { orderId: string; onAssigned: () => void }) {
  const [drivers, setDrivers] = useState<DeliveryPerson[]>([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await deliveryApi.getAll()
        const list = Array.isArray(data) ? data : (data as any).data || []
        setDrivers(list.filter((d: DeliveryPerson) => d.isActive ?? d.is_active))
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleAssign = async () => {
    if (!selectedDriver) return
    setIsAssigning(true)
    try {
      await ordersApi.assignDelivery(orderId, selectedDriver)
      toast.success('Entregador atribuído com sucesso!')
      onAssigned()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atribuir entregador')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="pt-4 border-t border-border space-y-3">
      <p className="text-sm text-amber-400">
        Atribuição manual — selecione um entregador para este pedido. 
        Para atribuição otimizada de múltiplos pedidos, use a tela de Entregadores → Otimização.
      </p>
      <div className="flex items-center gap-3">
        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
          <SelectTrigger className="flex-1 bg-background">
            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecionar entregador"} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {drivers.map((driver) => {
              const isBusy = !!driver.currentOrderId
              return (
                <SelectItem key={driver.id} value={driver.id} disabled={isBusy}>
                  <div className="flex items-center gap-2">
                    <span>{driver.name} — {driver.vehicleType || driver.vehicle_type}</span>
                    {isBusy && (
                      <span className="text-xs text-destructive">(em entrega)</span>
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAssign}
          disabled={!selectedDriver || isAssigning}
          className="gap-2 gold-gradient text-primary-foreground"
        >
          {isAssigning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Truck className="h-4 w-4" />
          )}
          Atribuir
        </Button>
      </div>
      {drivers.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground">Nenhum entregador ativo no momento</p>
      )}
      {drivers.length > 0 && drivers.every(d => !!d.currentOrderId) && (
        <p className="text-xs text-amber-400">Todos os entregadores estão em entrega no momento</p>
      )}
    </div>
  )
}

export function OrderDetailModal({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const { canWrite } = useRole()
  const [driverInfo, setDriverInfo] = useState<{ name: string; vehicleType: string } | null>(null)

  useEffect(() => {
    const loadDriver = async () => {
      const driverId = order?.deliveryPersonId || order?.delivery_person_id
      if (driverId) {
        try {
          const driver = await deliveryApi.getById(driverId)
          setDriverInfo({
            name: driver.name,
            vehicleType: driver.vehicleType || driver.vehicle_type || '',
          })
        } catch {
          setDriverInfo(null)
        }
      } else {
        setDriverInfo(null)
      }
    }
    if (open && order) loadDriver()
  }, [open, order])

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

  const vehicleLabels: Record<string, string> = {
    motorcycle: 'Motocicleta',
    bicycle: 'Bicicleta',
    car: 'Carro',
  }

  const transition = statusTransitions[order.status]
  const needsDriver = order.status === 'ready' && !(order.deliveryPersonId || order.delivery_person_id)

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
            {(deliveryPersonId || driverInfo) ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entregador</p>
                  <p className="font-medium">
                    {driverInfo ? driverInfo.name : `#${deliveryPersonId?.slice(0, 8)}`}
                  </p>
                  {driverInfo?.vehicleType && (
                    <p className="text-xs text-muted-foreground">
                      {vehicleLabels[driverInfo.vehicleType] || driverInfo.vehicleType}
                    </p>
                  )}
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
          {canWrite && transition && !needsDriver && (
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {order.status !== 'cancelled' && order.status !== 'delivering' && (
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

          {/* Needs driver warning */}
          {canWrite && needsDriver && (
            <AssignDriverSection orderId={order.id} onAssigned={() => {
              onOpenChange(false)
            }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}