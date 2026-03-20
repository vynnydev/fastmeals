"use client"

import { DeliveryPerson } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail,
  MapPin,
  Truck,
  Star,
  Clock
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"

interface DeliveryCardProps {
  person: DeliveryPerson
  onEdit?: (person: DeliveryPerson) => void
  onDelete?: (person: DeliveryPerson) => void
  onView?: (person: DeliveryPerson) => void
  onAssignOrder?: (person: DeliveryPerson) => void
}

export function DeliveryCard({ 
  person, 
  onEdit, 
  onDelete, 
  onView,
  onAssignOrder
}: DeliveryCardProps) {
  const { user } = useAuthStore()
  const canWrite = user?.role !== "viewer"

  const statusColors: Record<string, string> = {
    available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    busy: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    offline: "bg-muted text-muted-foreground border-muted",
    on_break: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  }

  const statusLabels: Record<string, string> = {
    available: "Disponível",
    busy: "Em Entrega",
    offline: "Offline",
    on_break: "Em Pausa",
  }

  const vehicleIcons: Record<string, string> = {
    motorcycle: "Moto",
    bicycle: "Bicicleta",
    car: "Carro",
    on_foot: "A Pé",
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <Card className={cn(
      "group bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300",
      person.status === "available" && "ring-1 ring-emerald-500/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage src={person.photoUrl} alt={person.name} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card",
              person.status === "available" && "bg-emerald-500",
              person.status === "busy" && "bg-amber-500",
              person.status === "offline" && "bg-muted-foreground",
              person.status === "on_break" && "bg-blue-500"
            )} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{person.name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn("mt-1 text-xs", statusColors[person.status])}
                >
                  {statusLabels[person.status]}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem onClick={() => onView?.(person)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </DropdownMenuItem>
                  {canWrite && person.status === "available" && (
                    <DropdownMenuItem onClick={() => onAssignOrder?.(person)}>
                      <Truck className="mr-2 h-4 w-4" />
                      Atribuir Pedido
                    </DropdownMenuItem>
                  )}
                  {canWrite && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit?.(person)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(person)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact info */}
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {person.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="truncate">{person.phone}</span>
                </div>
              )}
              {person.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{person.email}</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{vehicleIcons[person.vehicleType] || person.vehicleType}</span>
              </div>
              {person.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>{person.rating.toFixed(1)}</span>
                </div>
              )}
              {person.activeDeliveries !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{person.activeDeliveries} entregas</span>
                </div>
              )}
            </div>

            {/* Current location if available */}
            {person.currentLocation && person.status !== "offline" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">
                  Lat: {person.currentLocation.lat.toFixed(4)}, 
                  Lng: {person.currentLocation.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
