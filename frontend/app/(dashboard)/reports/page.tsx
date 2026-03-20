"use client"

import { useState, useMemo } from "react"
import { useReports } from "@/hooks/use-reports"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/shared/stat-card"
import { ErrorState } from "@/components/shared/error-state"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  PieChartIcon,
  Activity,
  Sparkles,
  Download,
  RefreshCcw,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { LogisticsIllustration } from "@/components/illustrations/logistics-illustration"

// Chart colors
const COLORS = ["#c8a052", "#5a7c9e", "#7a5c8e", "#4ade80", "#f97316"]
const CHART_COLORS = {
  primary: "#c8a052",
  secondary: "#5a7c9e",
  accent: "#7a5c8e",
  success: "#4ade80",
  warning: "#f97316",
}

// Mock data for charts
const revenueData = [
  { name: "Seg", receita: 4200, pedidos: 45, meta: 4000 },
  { name: "Ter", receita: 3800, pedidos: 42, meta: 4000 },
  { name: "Qua", receita: 5100, pedidos: 58, meta: 4000 },
  { name: "Qui", receita: 4800, pedidos: 52, meta: 4000 },
  { name: "Sex", receita: 6200, pedidos: 68, meta: 4000 },
  { name: "Sab", receita: 7500, pedidos: 85, meta: 4000 },
  { name: "Dom", receita: 5800, pedidos: 62, meta: 4000 },
]

const categoryData = [
  { name: "Lanches", value: 45, color: COLORS[0] },
  { name: "Bebidas", value: 25, color: COLORS[1] },
  { name: "Sobremesas", value: 15, color: COLORS[2] },
  { name: "Combos", value: 10, color: COLORS[3] },
  { name: "Outros", value: 5, color: COLORS[4] },
]

const deliveryPerformance = [
  { hour: "08:00", entregas: 12, tempoMedio: 22 },
  { hour: "10:00", entregas: 28, tempoMedio: 25 },
  { hour: "12:00", entregas: 45, tempoMedio: 32 },
  { hour: "14:00", entregas: 38, tempoMedio: 28 },
  { hour: "16:00", entregas: 25, tempoMedio: 24 },
  { hour: "18:00", entregas: 52, tempoMedio: 35 },
  { hour: "20:00", entregas: 48, tempoMedio: 30 },
  { hour: "22:00", entregas: 22, tempoMedio: 22 },
]

const heatmapData = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 60) + 10,
  }))
).flat()

const topProducts = [
  { name: "Hambúrguer Clássico", vendas: 245, receita: 6125 },
  { name: "Pizza Margherita", vendas: 189, receita: 7560 },
  { name: "Açaí 500ml", vendas: 167, receita: 3340 },
  { name: "Combo Família", vendas: 134, receita: 8040 },
  { name: "Refrigerante 2L", vendas: 312, receita: 2496 },
]

const aiInsights = [
  {
    type: "opportunity",
    icon: TrendingUp,
    title: "Horário de Pico Identificado",
    description: "As vendas entre 18h-20h representam 35% do faturamento diário. Considere aumentar a equipe neste período.",
    action: "Ver análise completa",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30"
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "Tempo de Entrega Elevado",
    description: "O tempo médio de entrega aumentou 15% na última semana. Principais causas: tráfego e rotas não otimizadas.",
    action: "Otimizar rotas",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30"
  },
  {
    type: "insight",
    icon: Sparkles,
    title: "Produto em Alta",
    description: "O 'Combo Família' teve aumento de 42% nas vendas. Recomendamos destacá-lo no cardápio.",
    action: "Criar promoção",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30"
  },
  {
    type: "efficiency",
    icon: Zap,
    title: "Eficiência de Entregadores",
    description: "3 entregadores estão com performance acima da média. Considere programa de incentivo.",
    action: "Ver ranking",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
]

export default function ReportsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")
  
  const { data: reportsData, error, isLoading, mutate } = useReports()

  // Calculate summary stats (mock for now)
  const summaryStats = useMemo(() => ({
    totalRevenue: 37400,
    revenueChange: 12.5,
    totalOrders: 412,
    ordersChange: 8.3,
    avgDeliveryTime: 28,
    deliveryTimeChange: -5.2,
    activeDrivers: 12,
    driversChange: 2,
  }), [])

  const handleExport = () => {
    toast({
      title: "Exportando relatório",
      description: "O relatório será baixado em instantes...",
    })
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string; color: string}>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" && entry.name.includes("receita") 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Analytics e insights do seu negócio</p>
        </div>
        <ErrorState 
          title="Erro ao carregar relatórios"
          message="Não foi possível carregar os dados de relatórios."
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
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Analytics avançado e insights de IA</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-background">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value={formatCurrency(summaryStats.totalRevenue)}
          change={summaryStats.revenueChange}
          changeLabel="vs. período anterior"
          icon={DollarSign}
          variant="gold"
          loading={isLoading}
        />
        <StatCard
          title="Total de Pedidos"
          value={summaryStats.totalOrders.toString()}
          change={summaryStats.ordersChange}
          changeLabel="vs. período anterior"
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatCard
          title="Tempo Médio Entrega"
          value={`${summaryStats.avgDeliveryTime} min`}
          change={summaryStats.deliveryTimeChange}
          changeLabel="vs. período anterior"
          icon={Clock}
          loading={isLoading}
        />
        <StatCard
          title="Entregadores Ativos"
          value={summaryStats.activeDrivers.toString()}
          change={summaryStats.driversChange}
          changeLabel="novos esta semana"
          icon={Users}
          loading={isLoading}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Truck className="h-4 w-4" />
            Entregas
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="logistics" className="gap-2">
            <Activity className="h-4 w-4" />
            Logistica
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Receita vs Meta
                </CardTitle>
                <CardDescription>Comparativo diário de receita</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="receita" name="Receita" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="meta" 
                      name="Meta" 
                      stroke={CHART_COLORS.secondary} 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Vendas por Categoria
                </CardTitle>
                <CardDescription>Distribuição percentual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Produtos Mais Vendidos
              </CardTitle>
              <CardDescription>Ranking de vendas do período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold",
                      index === 0 && "bg-primary/20 text-primary",
                      index === 1 && "bg-muted text-foreground",
                      index === 2 && "bg-amber-500/20 text-amber-400",
                      index > 2 && "bg-muted/50 text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.vendas} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{formatCurrency(product.receita)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          {/* Delivery Performance Chart */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Performance de Entregas por Horário
              </CardTitle>
              <CardDescription>Volume e tempo médio de entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={deliveryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                  <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="entregas" 
                    name="Entregas" 
                    fill={CHART_COLORS.primary} 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="tempoMedio" 
                    name="Tempo Médio (min)" 
                    stroke={CHART_COLORS.warning} 
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.warning, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Mapa de Calor - Pedidos por Dia/Hora
              </CardTitle>
              <CardDescription>Intensidade de pedidos ao longo da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Day labels */}
                  <div className="flex mb-2">
                    <div className="w-12" />
                    {["00", "04", "08", "12", "16", "20"].map(hour => (
                      <div key={hour} className="flex-1 text-xs text-muted-foreground text-center">
                        {hour}h
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap rows */}
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, dayIndex) => (
                    <div key={day} className="flex items-center gap-1 mb-1">
                      <div className="w-12 text-xs text-muted-foreground">{day}</div>
                      <div className="flex-1 flex gap-0.5">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const dataPoint = heatmapData.find(d => d.day === dayIndex && d.hour === hour)
                          const value = dataPoint?.value || 0
                          const intensity = value / 70 // normalize to 0-1
                          return (
                            <div
                              key={hour}
                              className="flex-1 h-6 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-primary"
                              style={{
                                backgroundColor: `rgba(200, 160, 82, ${0.1 + intensity * 0.8})`,
                              }}
                              title={`${day} ${hour}:00 - ${value} pedidos`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Legend */}
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-xs text-muted-foreground">Menos</span>
                    <div className="flex gap-0.5">
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map(opacity => (
                        <div
                          key={opacity}
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: `rgba(200, 160, 82, ${opacity})` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Mais</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <Card 
                  key={index} 
                  className={cn(
                    "bg-card/50 border-2 transition-all hover:shadow-lg cursor-pointer",
                    insight.borderColor
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-lg", insight.bgColor)}>
                        <Icon className={cn("h-6 w-6", insight.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Sparkles className="h-3.5 w-3.5" />
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* AI Summary */}
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Resumo Inteligente</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Com base na análise dos últimos 7 dias, seu negócio apresenta uma tendência de crescimento de <span className="text-emerald-400 font-medium">+12.5%</span> na receita. 
                    Os principais pontos de atenção são o tempo de entrega nos horários de pico e a otimização de rotas. 
                    Recomendamos focar em promoções do "Combo Família" e considerar a contratação de mais 2 entregadores para o período noturno.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Saúde do Negócio: Boa
                    </Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Target className="h-3 w-3 mr-1" />
                      Meta Mensal: 85%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics" className="space-y-6">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Centro de Logistica - Fluxo de Operacoes
              </CardTitle>
              <CardDescription>
                Visualizacao do fluxo logistico em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LogisticsIllustration variant="full" className="w-full min-h-[500px]" />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Veiculos de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <LogisticsIllustration variant="trucks" className="w-full h-[200px]" />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Centro de Distribuicao</CardTitle>
              </CardHeader>
              <CardContent>
                <LogisticsIllustration variant="warehouse" className="w-full h-[200px]" />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Metricas em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pedidos em Preparo</span>
                  <Badge className="bg-amber-500/20 text-amber-400">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Em Transporte</span>
                  <Badge className="bg-blue-500/20 text-blue-400">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Entregues Hoje</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400">47</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Eficiencia</span>
                  <Badge className="bg-primary/20 text-primary">94%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
