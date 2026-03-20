"use client"

import { useMemo } from "react"
import { Delivery } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock,
  MapPin,
  ArrowRight
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DeliveryKanbanProps {
  deliveries: Delivery[]
  onDeliveryClick?: (delivery: Delivery) => void
}

const columns = [
  { 
    id: "pending", 
    title: "Pendente", 
    description: "Aguardando atribuição",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30"
  },
  { 
    id: "assigned", 
    title: "Atribuído", 
    description: "Entregador designado",
    icon: Package,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  { 
    id: "picked_up", 
    title: "Em Trânsito", 
    description: "Saiu para entrega",
    icon: Truck,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30"
  },
  { 
    id: "delivered", 
    title: "Entregue", 
    description: "Concluído com sucesso",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30"
  },
]

function DeliveryKanbanCard({ delivery, onClick }: { delivery: Delivery; onClick?: () => void }) {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <Card 
      className={cn(
        "bg-card/80 border-border/50 cursor-pointer",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Order ID and priority */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs font-mono">
            #{delivery.orderId?.slice(-6) || delivery.id.slice(-6)}
          </Badge>
          {delivery.priority === "high" && (
            <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">
              Urgente
            </Badge>
          )}
        </div>

        {/* Delivery Address */}
        {delivery.deliveryAddress && (
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {typeof delivery.deliveryAddress === 'string' 
                ? delivery.deliveryAddress 
                : `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.number}`
              }
            </p>
          </div>
        )}

        {/* Driver info */}
        {delivery.deliveryPersonId && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-muted/30">
            <Avatar className="h-6 w-6">
              <AvatarImage src="" />
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                EN
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-foreground truncate">
              Entregador Atribuído
            </span>
          </div>
        )}

        {/* Footer with time and value */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {delivery.createdAt && formatDistanceToNow(new Date(delivery.createdAt), {
              addSuffix: true,
              locale: ptBR
            })}
          </span>
          {delivery.estimatedDeliveryTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {delivery.estimatedDeliveryTime}min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function DeliveryKanban({ deliveries, onDeliveryClick }: DeliveryKanbanProps) {
  const groupedDeliveries = useMemo(() => {
    const groups: Record<string, Delivery[]> = {
      pending: [],
      assigned: [],
      picked_up: [],
      delivered: [],
    }

    deliveries.forEach(delivery => {
      const status = delivery.status || "pending"
      if (groups[status]) {
        groups[status].push(delivery)
      } else {
        groups.pending.push(delivery)
      }
    })

    return groups
  }, [deliveries])

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {columns.map((column) => {
          const columnDeliveries = groupedDeliveries[column.id] || []
          const Icon = column.icon

          return (
            <div 
              key={column.id}
              className="flex-shrink-0 w-[320px]"
            >
              <Card className={cn(
                "bg-muted/20 border-border/30",
                columnDeliveries.length > 0 && column.borderColor
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-lg",
                        column.bgColor
                      )}>
                        <Icon className={cn("h-4 w-4", column.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {column.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {column.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        columnDeliveries.length > 0 && column.bgColor,
                        columnDeliveries.length > 0 && column.color
                      )}
                    >
                      {columnDeliveries.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 min-h-[200px]">
                    {columnDeliveries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-center">
                        <Icon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Nenhuma entrega
                        </p>
                      </div>
                    ) : (
                      columnDeliveries.map((delivery) => (
                        <DeliveryKanbanCard
                          key={delivery.id}
                          delivery={delivery}
                          onClick={() => onDeliveryClick?.(delivery)}
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
