"use client"

import { useState, useMemo } from "react"
import { useDelivery } from "@/hooks/use-delivery"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Delivery, DeliveryPerson } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { DeliveryCard } from "@/components/delivery/delivery-card"
import { DeliveryKanban } from "@/components/delivery/delivery-kanban"
import { OptimizationFlow } from "@/components/delivery/optimization-flow"
import { CardsSkeleton } from "@/components/shared/skeleton-loader"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { 
  Plus, 
  Search, 
  Users,
  Truck,
  Zap,
  LayoutGrid,
  Kanban,
  RefreshCcw,
  Filter
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWebSocket } from "@/hooks/use-websocket"

type ViewMode = "cards" | "kanban"

export default function DeliveryPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const canWrite = user?.role !== "viewer"

  // View mode and filters
  const [activeTab, setActiveTab] = useState("drivers")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Data fetching
  const { 
    data: deliveryData, 
    error, 
    isLoading, 
    mutate 
  } = useDelivery()

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket({
    enabled: true,
    onMessage: (event, data) => {
      if (event === "delivery_updated" || event === "driver_status_changed") {
        mutate()
      }
    }
  })

  // Filter delivery persons
  const filteredDrivers = useMemo(() => {
    if (!deliveryData?.deliveryPersons) return []
    return deliveryData.deliveryPersons.filter(driver => {
      if (search && !driver.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (statusFilter !== "all" && driver.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [deliveryData?.deliveryPersons, search, statusFilter])

  // Stats
  const stats = useMemo(() => {
    if (!deliveryData) {
      return {
        totalDrivers: 0,
        availableDrivers: 0,
        busyDrivers: 0,
        pendingDeliveries: 0,
        activeDeliveries: 0,
      }
    }
    return {
      totalDrivers: deliveryData.deliveryPersons?.length || 0,
      availableDrivers: deliveryData.deliveryPersons?.filter(d => d.status === "available").length || 0,
      busyDrivers: deliveryData.deliveryPersons?.filter(d => d.status === "busy").length || 0,
      pendingDeliveries: deliveryData.deliveries?.filter(d => d.status === "pending").length || 0,
      activeDeliveries: deliveryData.deliveries?.filter(d => ["assigned", "picked_up"].includes(d.status || "")).length || 0,
    }
  }, [deliveryData])

  // Last optimization result (mock)
  const [lastOptimization, setLastOptimization] = useState<{
    assignedOrders: number
    unassignedOrders: number
    avgDistance: number
    estimatedTime: string
  } | undefined>()

  // Handlers
  const handleRunOptimization = async () => {
    setIsOptimizing(true)
    try {
      // Call optimization endpoint
      const response = await fetch("/api/delivery/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: deliveryData?.deliveries?.filter(d => d.status === "pending").map(d => d.orderId) || []
        })
      })
      
      if (!response.ok) {
        throw new Error("Falha na otimização")
      }

      const result = await response.json()
      
      setLastOptimization({
        assignedOrders: result.assignedCount || stats.pendingDeliveries,
        unassignedOrders: result.unassignedCount || 0,
        avgDistance: result.avgDistance || 2.5,
        estimatedTime: result.estimatedTime || "25min"
      })

      toast({
        title: "Otimização concluída!",
        description: `${result.assignedCount || stats.pendingDeliveries} pedidos foram atribuídos automaticamente.`
      })

      mutate()
    } catch (error) {
      toast({
        title: "Erro na otimização",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleEditDriver = (driver: DeliveryPerson) => {
    toast({ title: "Editar", description: `Editando ${driver.name}` })
  }

  const handleDeleteDriver = (driver: DeliveryPerson) => {
    toast({ title: "Remover", description: `Removendo ${driver.name}` })
  }

  const handleViewDriver = (driver: DeliveryPerson) => {
    toast({ title: driver.name, description: `Status: ${driver.status}` })
  }

  const handleAssignOrder = (driver: DeliveryPerson) => {
    toast({ 
      title: "Atribuir Pedido", 
      description: `Selecione um pedido para atribuir a ${driver.name}` 
    })
  }

  const handleDeliveryClick = (delivery: Delivery) => {
    toast({
      title: `Entrega #${delivery.id.slice(-6)}`,
      description: `Status: ${delivery.status}`
    })
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
            <p className="text-muted-foreground">Gestão de entregadores e otimização de rotas</p>
          </div>
        </div>
        <CardsSkeleton count={6} />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
            <p className="text-muted-foreground">Gestão de entregadores e otimização de rotas</p>
          </div>
        </div>
        <ErrorState 
          title="Erro ao carregar dados"
          description="Não foi possível carregar as informações de entrega."
          onRetry={() => mutate()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
            {isConnected && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                Tempo Real
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {stats.totalDrivers} entregadores • {stats.availableDrivers} disponíveis • {stats.pendingDeliveries} pedidos pendentes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          {canWrite && (
            <Button onClick={() => toast({ title: "Novo Entregador", description: "Formulário em desenvolvimento" })}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Entregador
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="drivers" className="gap-2">
            <Users className="h-4 w-4" />
            Entregadores
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="gap-2">
            <Truck className="h-4 w-4" />
            Entregas
          </TabsTrigger>
          <TabsTrigger value="optimization" className="gap-2">
            <Zap className="h-4 w-4" />
            Otimização
          </TabsTrigger>
        </TabsList>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar entregadores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-background">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponíveis</SelectItem>
                <SelectItem value="busy">Em Entrega</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="on_break">Em Pausa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drivers Grid */}
          {filteredDrivers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum entregador encontrado"
              description={search || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Adicione entregadores para começar"
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDrivers.map((driver) => (
                <DeliveryCard
                  key={driver.id}
                  person={driver}
                  onEdit={handleEditDriver}
                  onDelete={handleDeleteDriver}
                  onView={handleViewDriver}
                  onAssignOrder={handleAssignOrder}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries" className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {stats.activeDeliveries} entregas ativas • {stats.pendingDeliveries} pendentes
            </p>
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-r-none gap-2",
                  viewMode === "cards" && "bg-muted"
                )}
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
                Cards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-l-none gap-2",
                  viewMode === "kanban" && "bg-muted"
                )}
                onClick={() => setViewMode("kanban")}
              >
                <Kanban className="h-4 w-4" />
                Kanban
              </Button>
            </div>
          </div>

          {/* Deliveries Content */}
          {!deliveryData?.deliveries || deliveryData.deliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Nenhuma entrega"
              description="As entregas aparecerão aqui quando pedidos forem atribuídos"
            />
          ) : viewMode === "kanban" ? (
            <DeliveryKanban 
              deliveries={deliveryData.deliveries}
              onDeliveryClick={handleDeliveryClick}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deliveryData.deliveries.map((delivery) => (
                <div 
                  key={delivery.id}
                  className="p-4 rounded-lg border border-border/50 bg-card/50 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => handleDeliveryClick(delivery)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-mono">
                      #{delivery.id.slice(-6)}
                    </Badge>
                    <Badge className={cn(
                      delivery.status === "pending" && "bg-amber-500/20 text-amber-400",
                      delivery.status === "assigned" && "bg-blue-500/20 text-blue-400",
                      delivery.status === "picked_up" && "bg-purple-500/20 text-purple-400",
                      delivery.status === "delivered" && "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {delivery.status}
                    </Badge>
                  </div>
                  {delivery.deliveryAddress && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {typeof delivery.deliveryAddress === 'string' 
                        ? delivery.deliveryAddress 
                        : `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.number}`
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization">
          <OptimizationFlow
            pendingOrders={stats.pendingDeliveries}
            availableDrivers={stats.availableDrivers}
            onRunOptimization={handleRunOptimization}
            isOptimizing={isOptimizing}
            lastOptimizationResult={lastOptimization}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
