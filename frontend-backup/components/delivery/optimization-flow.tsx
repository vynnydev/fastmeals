"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Truck,
  Package,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  GitBranch
} from "lucide-react"

interface FlowNode {
  id: string
  type: "start" | "process" | "decision" | "action" | "end"
  label: string
  description?: string
  status: "idle" | "active" | "completed" | "error"
  icon?: React.ReactNode
}

interface FlowConnection {
  from: string
  to: string
  label?: string
  type?: "default" | "yes" | "no"
}

interface OptimizationFlowProps {
  pendingOrders: number
  availableDrivers: number
  onRunOptimization?: () => Promise<void>
  isOptimizing?: boolean
  lastOptimizationResult?: {
    assignedOrders: number
    unassignedOrders: number
    avgDistance: number
    estimatedTime: string
  }
}

export function OptimizationFlow({
  pendingOrders,
  availableDrivers,
  onRunOptimization,
  isOptimizing = false,
  lastOptimizationResult
}: OptimizationFlowProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const nodes: FlowNode[] = useMemo(() => [
    {
      id: "start",
      type: "start",
      label: "Iniciar",
      description: "Coleta dados de pedidos e entregadores",
      status: completedSteps.includes("start") ? "completed" : activeStep === "start" ? "active" : "idle",
      icon: <Play className="h-4 w-4" />
    },
    {
      id: "collect_orders",
      type: "process",
      label: "Coletar Pedidos",
      description: `${pendingOrders} pedidos pendentes`,
      status: completedSteps.includes("collect_orders") ? "completed" : activeStep === "collect_orders" ? "active" : "idle",
      icon: <Package className="h-4 w-4" />
    },
    {
      id: "collect_drivers",
      type: "process",
      label: "Verificar Entregadores",
      description: `${availableDrivers} disponíveis`,
      status: completedSteps.includes("collect_drivers") ? "completed" : activeStep === "collect_drivers" ? "active" : "idle",
      icon: <Truck className="h-4 w-4" />
    },
    {
      id: "check_availability",
      type: "decision",
      label: "Há Recursos?",
      description: "Verifica se há pedidos e entregadores",
      status: completedSteps.includes("check_availability") ? "completed" : activeStep === "check_availability" ? "active" : "idle",
      icon: <GitBranch className="h-4 w-4" />
    },
    {
      id: "hungarian_algorithm",
      type: "process",
      label: "Algoritmo Hungarian",
      description: "Otimização de atribuições",
      status: completedSteps.includes("hungarian_algorithm") ? "completed" : activeStep === "hungarian_algorithm" ? "active" : "idle",
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: "calculate_routes",
      type: "process",
      label: "Calcular Rotas",
      description: "Distância e tempo estimado",
      status: completedSteps.includes("calculate_routes") ? "completed" : activeStep === "calculate_routes" ? "active" : "idle",
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: "assign_orders",
      type: "action",
      label: "Atribuir Pedidos",
      description: "Envia notificações",
      status: completedSteps.includes("assign_orders") ? "completed" : activeStep === "assign_orders" ? "active" : "idle",
      icon: <Target className="h-4 w-4" />
    },
    {
      id: "end",
      type: "end",
      label: "Concluído",
      description: "Otimização finalizada",
      status: completedSteps.includes("end") ? "completed" : activeStep === "end" ? "active" : "idle",
      icon: <CheckCircle2 className="h-4 w-4" />
    }
  ], [pendingOrders, availableDrivers, activeStep, completedSteps])

  const connections: FlowConnection[] = [
    { from: "start", to: "collect_orders" },
    { from: "collect_orders", to: "collect_drivers" },
    { from: "collect_drivers", to: "check_availability" },
    { from: "check_availability", to: "hungarian_algorithm", label: "Sim", type: "yes" },
    { from: "check_availability", to: "end", label: "Não", type: "no" },
    { from: "hungarian_algorithm", to: "calculate_routes" },
    { from: "calculate_routes", to: "assign_orders" },
    { from: "assign_orders", to: "end" }
  ]

  const simulateOptimization = useCallback(async () => {
    const steps = ["start", "collect_orders", "collect_drivers", "check_availability", "hungarian_algorithm", "calculate_routes", "assign_orders", "end"]
    
    setCompletedSteps([])
    
    for (const step of steps) {
      setActiveStep(step)
      await new Promise(resolve => setTimeout(resolve, 800))
      setCompletedSteps(prev => [...prev, step])
    }
    
    setActiveStep(null)
    
    if (onRunOptimization) {
      await onRunOptimization()
    }
  }, [onRunOptimization])

  const resetFlow = () => {
    setActiveStep(null)
    setCompletedSteps([])
  }

  const getNodeStyles = (node: FlowNode) => {
    const baseStyles = "relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300"
    
    switch (node.status) {
      case "active":
        return cn(baseStyles, "border-primary bg-primary/10 shadow-lg shadow-primary/20")
      case "completed":
        return cn(baseStyles, "border-emerald-500/50 bg-emerald-500/10")
      case "error":
        return cn(baseStyles, "border-destructive/50 bg-destructive/10")
      default:
        return cn(baseStyles, "border-border/50 bg-card/50")
    }
  }

  const getNodeIcon = (node: FlowNode) => {
    if (node.status === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    }
    if (node.status === "active") {
      return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    }
    return node.icon
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Motor de Otimização
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Fluxo de atribuição inteligente de entregas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFlow}
            disabled={isOptimizing || activeStep !== null}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button 
            onClick={simulateOptimization}
            disabled={isOptimizing || activeStep !== null || (pendingOrders === 0 || availableDrivers === 0)}
          >
            {activeStep ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Processando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Executar Otimização
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              Pedidos Pendentes
            </div>
            <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Truck className="h-4 w-4" />
              Entregadores Livres
            </div>
            <p className="text-2xl font-bold text-foreground">{availableDrivers}</p>
          </div>
          {lastOptimizationResult && (
            <>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-sm text-emerald-400 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Atribuídos
                </div>
                <p className="text-2xl font-bold text-emerald-400">{lastOptimizationResult.assignedOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  Tempo Estimado
                </div>
                <p className="text-2xl font-bold text-foreground">{lastOptimizationResult.estimatedTime}</p>
              </div>
            </>
          )}
        </div>

        {/* Flow Diagram */}
        <div className="relative p-6 rounded-lg bg-muted/20 border border-border/30">
          {/* Warnings */}
          {pendingOrders === 0 && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Não há pedidos pendentes para otimização</span>
            </div>
          )}
          {availableDrivers === 0 && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Não há entregadores disponíveis no momento</span>
            </div>
          )}

          {/* Flow Nodes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Row 1: Start and Collection */}
            <div className={getNodeStyles(nodes[0])}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[0].status === "completed" ? "bg-emerald-500/20" : 
                nodes[0].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[0])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[0].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[0].description}</p>
              </div>
            </div>

            <div className={getNodeStyles(nodes[1])}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[1].status === "completed" ? "bg-emerald-500/20" : 
                nodes[1].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[1])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[1].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[1].description}</p>
              </div>
            </div>

            <div className={getNodeStyles(nodes[2])}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[2].status === "completed" ? "bg-emerald-500/20" : 
                nodes[2].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[2])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[2].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[2].description}</p>
              </div>
            </div>

            <div className={cn(getNodeStyles(nodes[3]), "border-dashed")}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[3].status === "completed" ? "bg-emerald-500/20" : 
                nodes[3].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[3])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[3].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[3].description}</p>
              </div>
            </div>

            {/* Row 2: Processing */}
            <div className={cn(getNodeStyles(nodes[4]), "bg-gradient-to-r from-primary/5 to-transparent")}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[4].status === "completed" ? "bg-emerald-500/20" : 
                nodes[4].status === "active" ? "bg-primary/20 animate-pulse" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[4])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[4].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[4].description}</p>
                {nodes[4].status === "active" && (
                  <Badge variant="outline" className="mt-1 text-xs bg-primary/10 border-primary/30">
                    Processando matriz de custos
                  </Badge>
                )}
              </div>
            </div>

            <div className={getNodeStyles(nodes[5])}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[5].status === "completed" ? "bg-emerald-500/20" : 
                nodes[5].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[5])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[5].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[5].description}</p>
              </div>
            </div>

            <div className={getNodeStyles(nodes[6])}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[6].status === "completed" ? "bg-emerald-500/20" : 
                nodes[6].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[6])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[6].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[6].description}</p>
              </div>
            </div>

            <div className={cn(getNodeStyles(nodes[7]), nodes[7].status === "completed" && "border-emerald-500")}>
              <div className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full",
                nodes[7].status === "completed" ? "bg-emerald-500/20" : 
                nodes[7].status === "active" ? "bg-primary/20" : "bg-muted/50"
              )}>
                {getNodeIcon(nodes[7])}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{nodes[7].label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodes[7].description}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted/50 border border-border" />
              <span>Aguardando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/50 border border-primary" />
              <span>Processando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500/50 border border-emerald-500" />
              <span>Concluído</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
