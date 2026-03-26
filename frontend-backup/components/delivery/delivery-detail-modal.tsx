'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Phone,
  Truck,
  MapPin,
  Star,
  Package,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeliveryPerson } from '@/types'

interface DeliveryDetailModalProps {
  person: DeliveryPerson | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

const statusLabels: Record<string, string> = {
  available: 'Disponível',
  busy: 'Em Entrega',
  offline: 'Offline',
  on_break: 'Em Pausa',
}

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  busy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  offline: 'bg-muted text-muted-foreground border-muted',
  on_break: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

export function DeliveryDetailModal({ person, open, onOpenChange }: DeliveryDetailModalProps) {
  if (!person) return null

  const vehicleType = person.vehicleType || person.vehicle_type || 'motorcycle'
  const isActive = person.isActive ?? person.is_active ?? true
  const lat = person.currentLatitude || person.current_lat
  const lng = person.currentLongitude || person.current_lng
  const rating = person.rating || person.average_rating
  const totalDeliveries = person.totalDeliveries || person.total_deliveries || 0

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalhes do Entregador</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/20 text-primary text-lg">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{person.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", statusColors[person.status])}>
                  {statusLabels[person.status] || person.status}
                </Badge>
                <Badge variant={isActive ? "default" : "secondary"} className={cn("text-xs", isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive")}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm font-medium">{person.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Veículo</p>
                <p className="text-sm font-medium">{vehicleEmojis[vehicleType]} {vehicleLabels[vehicleType]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Entregas</p>
                <p className="text-sm font-medium">{totalDeliveries} realizadas</p>
              </div>
            </div>
            {rating ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                  <p className="text-sm font-medium">{Number(rating).toFixed(1)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                  <p className="text-sm font-medium">Sem avaliação</p>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          {lat && lng && (
            <>
              <Separator />
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Localização Atual</p>
                  <p className="text-sm font-mono">
                    {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Current Order */}
          {person.currentOrderId && (
            <>
              <Separator />
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <Clock className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Pedido em Andamento</p>
                  <p className="text-sm font-mono">#{person.currentOrderId.slice(0, 8)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}