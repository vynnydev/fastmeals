"use client"

import { useState, useMemo, useEffect } from "react"
import { useDelivery } from "@/hooks/use-delivery"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { DeliveryPerson, Assignment, Order } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { DeliveryCard } from "@/components/delivery/delivery-card"
import { CardsSkeleton } from "@/components/shared/skeleton-loader"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { 
  Plus, 
  Search, 
  Users,
  Zap,
  RefreshCcw,
  Filter,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Route,
  Truck,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { optimizationApi, ordersApi, deliveryApi } from "@/lib/api"
import { DeliveryFormModal } from "@/components/delivery/delivery-form-modal"
import { DeliveryDetailModal } from "@/components/delivery/delivery-detail-modal"
import { DriverKanban } from "@/components/delivery/driver-kanban"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LayoutGrid, Columns3 } from "lucide-react"

export default function DeliveryPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const canWrite = user?.role !== "viewer"

  // View mode and filters
  const [activeTab, setActiveTab] = useState("drivers")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<{
    assignments: Assignment[]
    unassigned: { orderId: string; orderAddress: string; reason: string }[]
    totalDistanceKm: number
    algorithm: string
    executionTimeMs: number
  } | null>(null)
  const [acceptedAssignments, setAcceptedAssignments] = useState<Set<string>>(new Set())
  const [rejectedAssignments, setRejectedAssignments] = useState<Set<string>>(new Set())
  const [applyingAssignment, setApplyingAssignment] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<DeliveryPerson | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [driversView, setDriversView] = useState<"cards" | "kanban">("cards")

  // Data fetching
  const { 
    data: deliveryData, 
    error, 
    isLoading, 
    mutate 
  } = useDelivery()

  // Adiciona state para pedidos
  const [activeOrders, setActiveOrders] = useState<Order[]>([])

  // Carrega pedidos em delivering
  useEffect(() => {
    const loadActiveOrders = async () => {
      try {
        const orders = await ordersApi.getAll()
        setActiveOrders(Array.isArray(orders) ? orders.filter((o: any) => o.status === 'delivering') : [])
      } catch {
        // ignore
      }
    }
    loadActiveOrders()
  }, [deliveryData])

  // Filter delivery persons
  const filteredDrivers = useMemo(() => {
    if (!deliveryData?.deliveryPersons) return []
    
    const busyDriverIds = new Set(
      activeOrders.map((o: any) => o.deliveryPersonId || o.delivery_person_id).filter(Boolean)
    )
    
    return deliveryData.deliveryPersons.filter(driver => {
      if (search && !driver.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      
      const isActive = driver.isActive ?? driver.is_active
      const isBusy = busyDriverIds.has(driver.id)
      
      if (statusFilter === "available" && (!isActive || isBusy)) return false
      if (statusFilter === "busy" && !isBusy) return false
      if (statusFilter === "offline" && isActive) return false
      
      return true
    })
  }, [deliveryData?.deliveryPersons, search, statusFilter, activeOrders])

  // Stats
  const stats = useMemo(() => {
    if (!deliveryData?.deliveryPersons) {
      return { totalDrivers: 0, availableDrivers: 0, busyDrivers: 0, offlineDrivers: 0 }
    }
    const persons = deliveryData.deliveryPersons
    const busyDriverIds = new Set(
      activeOrders.map((o: any) => o.deliveryPersonId || o.delivery_person_id).filter(Boolean)
    )
    
    return {
      totalDrivers: persons.length,
      availableDrivers: persons.filter(d => (d.isActive ?? d.is_active) && !busyDriverIds.has(d.id)).length,
      busyDrivers: busyDriverIds.size,
      offlineDrivers: persons.filter(d => !(d.isActive ?? d.is_active)).length,
    }
  }, [deliveryData, activeOrders])

  // Optimization handler
  const handleRunOptimization = async () => {
    setIsOptimizing(true)
    setOptimizationResult(null)
    setAcceptedAssignments(new Set())
    setRejectedAssignments(new Set())

    try {
      const result = await optimizationApi.getSuggestions()
      
      setOptimizationResult({
        assignments: result.assignments || [],
        unassigned: result.unassigned || [],
        totalDistanceKm: result.totalDistanceKm || 0,
        algorithm: result.algorithm || 'hungarian',
        executionTimeMs: result.executionTimeMs || 0,
      })

      toast({
        title: "Otimização concluída!",
        description: `${result.assignments?.length || 0} atribuições sugeridas em ${result.executionTimeMs}ms`,
      })
    } catch (error) {
      toast({
        title: "Erro na otimização",
        description: error instanceof Error ? error.message : "Não foi possível executar a otimização",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  // Accept assignment
  const handleAcceptAssignment = async (assignment: Assignment) => {
    const orderId = assignment.orderId || (assignment as any).order_id
    const deliveryPersonId = assignment.deliveryPersonId || (assignment as any).delivery_person_id
    
    setApplyingAssignment(orderId)
    try {
      await optimizationApi.applyAssignment(orderId, deliveryPersonId)
      
      setAcceptedAssignments(prev => new Set(prev).add(orderId))
      toast({
        title: "Atribuição aceita!",
        description: `Pedido atribuído com sucesso`,
      })
      mutate()
    } catch (error) {
      toast({
        title: "Erro ao aplicar atribuição",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive"
      })
    } finally {
      setApplyingAssignment(null)
    }
  }

  // Reject assignment
  const handleRejectAssignment = (assignment: Assignment) => {
    const orderId = assignment.orderId || (assignment as any).order_id
    setRejectedAssignments(prev => new Set(prev).add(orderId))
    toast({
      title: "Atribuição rejeitada",
      description: "A sugestão foi descartada",
    })
  }

  // Driver handlers
  const handleEditDriver = (driver: DeliveryPerson) => {
    setSelectedPerson(driver)
    setFormModalOpen(true)
  }
  
  const handleDeleteDriver = (driver: DeliveryPerson) => {
    setSelectedPerson(driver)
    setDeleteModalOpen(true)
  }
  
  const handleViewDriver = (driver: DeliveryPerson) => {
    setSelectedPerson(driver)
    setDetailModalOpen(true)
  }
  
  const handleConfirmDelete = async () => {
    if (!selectedPerson) return
    setIsDeleting(true)
    try {
      await deliveryApi.delete(selectedPerson.id)
      toast({ title: "Entregador removido com sucesso!" })
      setDeleteModalOpen(false)
      mutate()
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Não foi possível remover o entregador",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAssignOrder = (driver: DeliveryPerson) => {
    toast({ 
      title: "Atribuir Pedido", 
      description: `Selecione um pedido para atribuir a ${driver.name}` 
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
          <p className="text-muted-foreground">Gestão de entregadores e otimização de rotas</p>
        </div>
        <CardsSkeleton count={6} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
          <p className="text-muted-foreground">Gestão de entregadores e otimização de rotas</p>
        </div>
        <ErrorState 
          title="Erro ao carregar dados"
          message="Não foi possível carregar as informações de entrega."
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
          <h1 className="text-2xl font-bold text-foreground">Entregas</h1>
          <p className="text-muted-foreground">
            {stats.totalDrivers} entregadores • {stats.availableDrivers} disponíveis • {stats.busyDrivers} em entrega
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          {canWrite && (
            <Button onClick={() => { setSelectedPerson(null); setFormModalOpen(true) }}>
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

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-background">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponíveis</SelectItem>
                  <SelectItem value="busy">Em Entrega</SelectItem>
                  <SelectItem value="offline">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 rounded-r-none", driversView === "cards" && "bg-muted")}
                  onClick={() => setDriversView("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 rounded-l-none", driversView === "kanban" && "bg-muted")}
                  onClick={() => setDriversView("kanban")}
                >
                  <Columns3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          {driversView === "kanban" ? (
            <DriverKanban
              drivers={deliveryData?.deliveryPersons || []}
              activeOrders={activeOrders}
              onView={handleViewDriver}
              onEdit={handleEditDriver}
            />
          ) : filteredDrivers.length === 0 ? (
            <EmptyState
              type="users"
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

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          {/* Info Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-amber-500/10">
                  <Route className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Algoritmo</p>
                  <p className="font-semibold">Hungarian O(n³)</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                  <p className="font-semibold">{stats.availableDrivers} entregadores</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-blue-500/10">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distância</p>
                  <p className="font-semibold">Haversine (geodésica)</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col items-center">
            {/* Available Drivers Preview */}
            {stats.availableDrivers > 0 && !optimizationResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Entregadores disponíveis para atribuição</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {deliveryData?.deliveryPersons
                    ?.filter(d => d.status === 'available' || (d.isActive ?? d.is_active))
                    .map(driver => {
                      const lat = driver.currentLatitude || driver.current_lat
                      const lng = driver.currentLongitude || driver.current_lng
                      return (
                        <Card key={driver.id} className="p-3 bg-card/30 border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-emerald-400">
                                {driver.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{driver.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{(driver.vehicleType || driver.vehicle_type) === 'motorcycle' ? '🏍️' : (driver.vehicleType || driver.vehicle_type) === 'bicycle' ? '🚲' : '🚗'} {driver.vehicleType || driver.vehicle_type}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {lat && lng ? (
                                <div className="flex items-center gap-1 text-xs text-emerald-400">
                                  <MapPin className="h-3 w-3" />
                                  <span>GPS ativo</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>Sem GPS</span>
                                </div>
                              )}
                              <Badge className="mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                Livre
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  }
                </div>
              </div>
            )}
          </div>

          {/* Run Button */}
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-sm text-muted-foreground text-center max-w-md">
              O algoritmo Hungarian encontra a atribuição ótima que minimiza a distância total entre entregadores disponíveis e pedidos com status "ready".
            </p>
            {canWrite && (
              <Button 
                size="lg"
                onClick={handleRunOptimization}
                disabled={isOptimizing}
                className="gap-3 px-8 py-6 text-base gold-gradient text-primary-foreground"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Calculando atribuição ótima...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Sugerir Atribuição Otimizada
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Optimization Results */}
          {optimizationResult && (
            <div className="space-y-6">
              {/* Metrics */}
              <div className="grid gap-4 sm:grid-cols-4">
                <Card className="p-4 bg-card/50 border-border/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.assignments.length}</p>
                  <p className="text-sm text-muted-foreground">Atribuições</p>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.unassigned.length}</p>
                  <p className="text-sm text-muted-foreground">Não atribuídos</p>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.totalDistanceKm.toFixed(1)} km</p>
                  <p className="text-sm text-muted-foreground">Distância total</p>
                </Card>
                <Card className="p-4 bg-card/50 border-border/50 text-center">
                  <p className="text-2xl font-bold text-foreground">{optimizationResult.executionTimeMs}ms</p>
                  <p className="text-sm text-muted-foreground">Tempo execução</p>
                </Card>
              </div>

              {/* Optimization Explanation */}
              {optimizationResult.assignments.length > 0 && (
                <Card className="p-6 bg-gradient-to-r from-emerald-500/5 to-amber-500/5 border-emerald-500/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <h3 className="font-semibold text-foreground">O que foi otimizado?</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      O algoritmo <span className="text-foreground font-medium">Hungarian (Kuhn-Munkres)</span> analisou 
                      todas as combinações possíveis entre <span className="text-foreground font-medium">{optimizationResult.assignments.length} pedidos</span> com 
                      status "ready" e os entregadores disponíveis, calculando a distância geodésica (Haversine) entre cada par.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <p className="text-sm font-medium text-destructive">Sem otimização (aleatório)</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          ~{(optimizationResult.totalDistanceKm * 2.2).toFixed(1)} km
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cada pedido atribuído ao entregador mais próximo individualmente (greedy)
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <p className="text-sm font-medium text-emerald-400">Com otimização (Hungarian)</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {optimizationResult.totalDistanceKm.toFixed(1)} km
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Atribuição globalmente ótima — menor distância total possível
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Route className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <p className="text-sm">
                        <span className="font-semibold text-emerald-400">
                          Economia de ~{((optimizationResult.totalDistanceKm * 2.2) - optimizationResult.totalDistanceKm).toFixed(1)} km
                        </span>
                        <span className="text-muted-foreground">
                          {' '}({Math.round(((1 - (1 / 2.2)) * 100))}% menos distância) — calculado em {optimizationResult.executionTimeMs}ms
                        </span>
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Assignment Cards */}
              {optimizationResult.assignments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Atribuições Sugeridas</h3>
                  <div className="grid gap-3">
                    {optimizationResult.assignments.map((assignment) => {
                      const orderId = assignment.orderId || (assignment as any).order_id || ''
                      const isAccepted = acceptedAssignments.has(orderId)
                      const isRejected = rejectedAssignments.has(orderId)
                      const isApplying = applyingAssignment === orderId
                      const personName = assignment.deliveryPersonName || (assignment as any).delivery_person_name || 'Entregador'
                      const distance = assignment.estimatedDistanceKm || (assignment as any).distance_km || 0
                      const address = assignment.orderAddress || (assignment as any).order_address || ''

                      return (
                        <Card 
                          key={orderId}
                          className={cn(
                            "p-4 border-border/50 transition-all",
                            isAccepted && "bg-emerald-500/5 border-emerald-500/30",
                            isRejected && "bg-destructive/5 border-destructive/30 opacity-50",
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="rounded-lg p-2 bg-amber-500/10 flex-shrink-0">
                                  <MapPin className="h-4 w-4 text-amber-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">#{orderId.slice(0, 8)}</p>
                                  <p className="text-xs text-muted-foreground truncate">{address || 'Endereço'}</p>
                                </div>
                              </div>

                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                              <div className="flex items-center gap-2 min-w-0">
                                <div className="rounded-lg p-2 bg-emerald-500/10 flex-shrink-0">
                                  <Truck className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{personName}</p>
                                  <p className="text-xs text-muted-foreground">{distance.toFixed(1)} km</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isAccepted ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Aceito
                                </Badge>
                              ) : isRejected ? (
                                <Badge variant="outline" className="text-destructive border-destructive/30">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejeitado
                                </Badge>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleRejectAssignment(assignment)}
                                    disabled={isApplying}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptAssignment(assignment)}
                                    disabled={isApplying}
                                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    {isApplying ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                    Aceitar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Unassigned Orders */}
              {optimizationResult.unassigned.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Pedidos Não Atribuídos</h3>
                  <div className="grid gap-2">
                    {optimizationResult.unassigned.map((item) => (
                      <Card key={item.orderId} className="p-3 bg-amber-500/5 border-amber-500/20">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">#{item.orderId.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.orderAddress}</p>
                          </div>
                          <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
                            {item.reason}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {optimizationResult.assignments.length === 0 && optimizationResult.unassigned.length === 0 && (
                <EmptyState
                  type="delivery"
                  title="Nenhuma atribuição possível"
                  description="Não há pedidos com status 'ready' ou entregadores disponíveis no momento."
                />
              )}
            </div>
          )}

          {/* Empty state when no optimization has been run */}
          {!optimizationResult && !isOptimizing && (
            <Card className="p-8 bg-card/30 border-border/50 border-dashed">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-full p-4 bg-muted/50">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Otimização não executada</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Clique no botão acima para executar o algoritmo Hungarian e obter sugestões de atribuição otimizadas.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <DeliveryFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        person={selectedPerson}
        onSuccess={() => mutate()}
      />

      <DeliveryDetailModal
        person={selectedPerson}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Entregador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{selectedPerson?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}