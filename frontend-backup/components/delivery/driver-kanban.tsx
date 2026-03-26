'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Truck,
  XCircle,
  Phone,
  MapPin,
  Package,
  Eye,
  Edit,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeliveryPerson, Order } from '@/types'

interface DriverKanbanProps {
  drivers: DeliveryPerson[]
  activeOrders: Order[]
  onView?: (driver: DeliveryPerson) => void
  onEdit?: (driver: DeliveryPerson) => void
}

const vehicleLabels: Record<string, string> = {
  motorcycle: 'Motocicleta',
  bicycle: 'Bicicleta',
  car: 'Carro',
}

const vehicleEmojis: Record<string, string> = {
  motorcycle: '🏍️',
  bicycle: '🚲',
  car: '🚗',
}

const columns = [
  {
    id: 'available',
    title: 'Disponíveis',
    description: 'Prontos para receber pedidos',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'busy',
    title: 'Em Entrega',
    description: 'Realizando uma entrega',
    icon: Truck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'inactive',
    title: 'Inativos',
    description: 'Fora de serviço',
    icon: XCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    borderColor: 'border-muted',
    dotColor: 'bg-muted-foreground',
  },
]

function DriverKanbanCard({
  driver,
  order,
  dotColor,
  onView,
  onEdit,
}: {
  driver: DeliveryPerson
  order?: Order | null
  dotColor: string
  onView?: () => void
  onEdit?: () => void
}) {
  const vehicleType = driver.vehicleType || driver.vehicle_type || 'motorcycle'
  const lat = driver.currentLatitude || driver.current_lat
  const lng = driver.currentLongitude || driver.current_lng
  const rating = driver.rating || driver.average_rating
  const totalDeliveries = driver.totalDeliveries || driver.total_deliveries || 0

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const customerName = order
    ? (order as any).customerName || (order as any).customer_name || 'Cliente'
    : null

  const orderAddress = order
    ? (order as any).deliveryAddress || (order as any).delivery_address || ''
    : null

  return (
    <Card className="bg-card/80 border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      <CardContent className="p-4">
        {/* Driver Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {getInitials(driver.name)}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
              dotColor
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{driver.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{vehicleEmojis[vehicleType]} {vehicleLabels[vehicleType]}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Phone className="h-3 w-3" />
          <span>{driver.phone}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs mb-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{totalDeliveries} entregas</span>
          </div>
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span>{Number(rating).toFixed(1)}</span>
            </div>
          )}
          {lat && lng && (
            <div className="flex items-center gap-1 text-emerald-400">
              <MapPin className="h-3 w-3" />
              <span>GPS</span>
            </div>
          )}
        </div>

        {/* Current Order */}
        {order && (
          <div className="p-2.5 rounded-md bg-amber-500/5 border border-amber-500/10 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-3 w-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Pedido em andamento</span>
            </div>
            <p className="text-xs font-mono text-foreground">#{order.id.slice(0, 8)}</p>
            {customerName && (
              <p className="text-xs text-muted-foreground mt-0.5">{customerName}</p>
            )}
            {orderAddress && (
              <div className="flex items-start gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-1">{orderAddress}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={onView}
          >
            <Eye className="h-3 w-3 mr-1" />
            Detalhes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DriverKanban({ drivers, activeOrders, onView, onEdit }: DriverKanbanProps) {
  const busyDriverIds = useMemo(() => {
    return new Set(
      activeOrders
        .filter((o: any) => o.status === 'delivering')
        .map((o: any) => o.deliveryPersonId || o.delivery_person_id)
        .filter(Boolean)
    )
  }, [activeOrders])

  const orderByDriver = useMemo(() => {
    const map: Record<string, Order> = {}
    activeOrders
      .filter((o: any) => o.status === 'delivering')
      .forEach((o: any) => {
        const driverId = o.deliveryPersonId || o.delivery_person_id
        if (driverId) map[driverId] = o
      })
    return map
  }, [activeOrders])

  const groupedDrivers = useMemo(() => {
    const groups: Record<string, DeliveryPerson[]> = {
      available: [],
      busy: [],
      inactive: [],
    }

    drivers.forEach(driver => {
      const isActive = driver.isActive ?? driver.is_active
      const isBusy = busyDriverIds.has(driver.id)

      if (!isActive) {
        groups.inactive.push(driver)
      } else if (isBusy) {
        groups.busy.push(driver)
      } else {
        groups.available.push(driver)
      }
    })

    return groups
  }, [drivers, busyDriverIds])

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {columns.map((column) => {
          const columnDrivers = groupedDrivers[column.id] || []
          const Icon = column.icon

          return (
            <div key={column.id} className="flex-shrink-0 w-[320px]">
              <Card className={cn(
                'bg-muted/10 border-border/30 min-h-[400px]',
                columnDrivers.length > 0 && column.borderColor
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex items-center justify-center h-8 w-8 rounded-lg', column.bgColor)}>
                        <Icon className={cn('h-4 w-4', column.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{column.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{column.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', columnDrivers.length > 0 && column.bgColor, columnDrivers.length > 0 && column.color)}
                    >
                      {columnDrivers.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {columnDrivers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-center">
                        <Icon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Nenhum entregador
                        </p>
                      </div>
                    ) : (
                      columnDrivers.map(driver => (
                        <DriverKanbanCard
                          key={driver.id}
                          driver={driver}
                          order={orderByDriver[driver.id] || null}
                          dotColor={column.dotColor}
                          onView={() => onView?.(driver)}
                          onEdit={() => onEdit?.(driver)}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}