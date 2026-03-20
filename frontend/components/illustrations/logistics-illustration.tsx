"use client"

import { cn } from "@/lib/utils"
import { Truck, Package, Building2, Users, ArrowRight, CheckCircle2 } from "lucide-react"

interface LogisticsIllustrationProps {
  variant?: "full" | "trucks" | "warehouse"
  className?: string
}

export function LogisticsIllustration({ variant = "full", className }: LogisticsIllustrationProps) {
  if (variant === "trucks") {
    return (
      <div className={cn("relative flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl overflow-hidden", className)}>
        <div className="flex items-end gap-6">
          {/* Truck 1 */}
          <div className="animate-bounce-slow">
            <div className="relative">
              <div className="w-20 h-12 bg-primary/80 rounded-lg relative">
                <div className="absolute top-1 left-1 w-6 h-6 bg-primary/40 rounded" />
                <div className="absolute bottom-0 left-1 w-4 h-4 bg-muted-foreground rounded-full" />
                <div className="absolute bottom-0 right-3 w-4 h-4 bg-muted-foreground rounded-full" />
              </div>
              <div className="absolute -right-8 top-0 w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          
          {/* Truck 2 */}
          <div className="animate-bounce-slow" style={{ animationDelay: "150ms" }}>
            <div className="relative">
              <div className="w-16 h-10 bg-emerald-600/80 rounded-lg relative">
                <div className="absolute top-1 left-1 w-5 h-5 bg-emerald-400/40 rounded" />
                <div className="absolute bottom-0 left-1 w-3 h-3 bg-muted-foreground rounded-full" />
                <div className="absolute bottom-0 right-2 w-3 h-3 bg-muted-foreground rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Van */}
          <div className="animate-bounce-slow" style={{ animationDelay: "300ms" }}>
            <div className="relative">
              <div className="w-14 h-10 bg-blue-600/80 rounded-lg relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-blue-400/40 rounded" />
                <div className="absolute bottom-0 left-1 w-3 h-3 bg-muted-foreground rounded-full" />
                <div className="absolute bottom-0 right-2 w-3 h-3 bg-muted-foreground rounded-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Road */}
        <div className="absolute bottom-4 left-0 right-0 h-2 bg-muted/50">
          <div className="absolute inset-0 flex items-center justify-around">
            <div className="w-8 h-0.5 bg-primary/50" />
            <div className="w-8 h-0.5 bg-primary/50" />
            <div className="w-8 h-0.5 bg-primary/50" />
            <div className="w-8 h-0.5 bg-primary/50" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === "warehouse") {
    return (
      <div className={cn("relative flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl overflow-hidden", className)}>
        <div className="flex flex-col items-center gap-4">
          {/* Building */}
          <div className="relative">
            <div className="w-32 h-20 bg-muted/50 rounded-lg border-2 border-border/50 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-primary/60" />
            </div>
            {/* Conveyor belt animation */}
            <div className="absolute -bottom-2 left-0 right-0 h-2 bg-muted/80 rounded-full overflow-hidden">
              <div className="flex animate-conveyor">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-4 h-2 bg-primary/40 mx-1 rounded-sm flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>
          
          {/* Packages */}
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground animate-pulse" />
            <div className="animate-pulse" style={{ animationDelay: "200ms" }}>
              <Package className="w-6 h-6 text-emerald-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground animate-pulse" />
            <div className="animate-pulse" style={{ animationDelay: "400ms" }}>
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full variant - Complete logistics flow
  return (
    <div className={cn("relative bg-gradient-to-br from-muted/20 via-background to-muted/10 rounded-xl overflow-hidden p-8", className)}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">Fluxo de Operacoes</h3>
          <p className="text-sm text-muted-foreground">Visualizacao do centro de logistica</p>
        </div>

        {/* Main Flow */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Step 1 - Orders */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center animate-pulse">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Pedidos</span>
            <span className="text-lg font-bold text-primary">24</span>
          </div>

          <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse hidden sm:block" />

          {/* Step 2 - Warehouse */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-amber-500 animate-bounce-slow" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Preparacao</span>
            <span className="text-lg font-bold text-amber-500">12</span>
          </div>

          <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse hidden sm:block" />

          {/* Step 3 - Delivery */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center">
              <Truck className="w-8 h-8 text-blue-500 animate-truck" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Em Transito</span>
            <span className="text-lg font-bold text-blue-500">8</span>
          </div>

          <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse hidden sm:block" />

          {/* Step 4 - Delivered */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Entregues</span>
            <span className="text-lg font-bold text-emerald-500">47</span>
          </div>
        </div>

        {/* Drivers Row */}
        <div className="flex items-center gap-6 pt-4 border-t border-border/30 w-full justify-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Entregadores Ativos:</span>
            <span className="text-sm font-semibold text-foreground">12</span>
          </div>
          <div className="flex -space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/30 border-2 border-background flex items-center justify-center text-xs font-medium text-primary-foreground"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
              +7
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
          <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
            <p className="text-2xl font-bold text-primary">94%</p>
            <p className="text-xs text-muted-foreground">Eficiencia</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
            <p className="text-2xl font-bold text-emerald-500">28min</p>
            <p className="text-xs text-muted-foreground">Tempo Medio</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
            <p className="text-2xl font-bold text-blue-500">156</p>
            <p className="text-xs text-muted-foreground">Entregas Hoje</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-card/50 border border-border/30">
            <p className="text-2xl font-bold text-amber-500">4.8</p>
            <p className="text-xs text-muted-foreground">Avaliacao</p>
          </div>
        </div>
      </div>
    </div>
  )
}
