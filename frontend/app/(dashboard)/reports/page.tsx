"use client"

import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatCardSkeleton, ChartSkeleton } from "@/components/shared/skeleton-loader"
import { ErrorState } from "@/components/shared/error-state"
import { AnimatedNumber, AnimatedCurrency } from "@/hooks/use-animated-counter"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { 
  DollarSign,
  ShoppingCart,
  Truck,
  Clock,
  BarChart3,
  Sparkles,
  RefreshCcw,
  Target,
  Zap,
  CheckCircle2,
  Loader2,
  Package,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ordersApi, reportsApi } from "@/lib/api"
import { toast as sonnerToast } from "sonner"
import type { Order } from "@/types"

const STATUS_COLORS: Record<string, string> = {
  pending: '#eab308',
  preparing: '#3b82f6',
  ready: '#a855f7',
  delivering: '#f97316',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivering: 'Em entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

// Get current week boundaries (Monday to Sunday)
function getCurrentWeekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  return { start: monday, end: sunday }
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allOrders, setAllOrders] = useState<Order[]>([])

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  // Delivery time from reports-service
  const [avgDeliveryTime, setAvgDeliveryTime] = useState(0)
  const [fastestDelivery, setFastestDelivery] = useState(0)
  const [slowestDelivery, setSlowestDelivery] = useState(0)
  const [deliveryByVehicle, setDeliveryByVehicle] = useState<any[]>([])

  const weekRange = useMemo(() => getCurrentWeekRange(), [])

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [orders, deliveryTime] = await Promise.all([
        ordersApi.getAll().catch(() => []),
        reportsApi.getAverageDeliveryTime().catch(() => ({ averageMinutes: 0, totalDelivered: 0, fastestMinutes: 0, slowestMinutes: 0, byVehicleType: [] })),
      ])

      setAllOrders(Array.isArray(orders) ? orders : [])
      setAvgDeliveryTime(deliveryTime.averageMinutes || 0)
      setFastestDelivery(deliveryTime.fastestMinutes || 0)
      setSlowestDelivery(deliveryTime.slowestMinutes || 0)
      setDeliveryByVehicle(deliveryTime.byVehicleType || [])
    } catch (err) {
      setError('Erro ao carregar relatórios')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter orders for current week
  const weekOrders = useMemo(() => {
    return allOrders.filter(order => {
      const dateStr = order.createdAt || order.created_at
      if (!dateStr) return false
      const orderDate = new Date(dateStr)
      return orderDate >= weekRange.start && orderDate <= weekRange.end
    })
  }, [allOrders, weekRange])

  // Delivered orders
  const deliveredOrders = useMemo(() => allOrders.filter((o: any) => o.status === 'delivered'), [allOrders])
  const weekDelivered = useMemo(() => weekOrders.filter((o: any) => o.status === 'delivered'), [weekOrders])

  // Revenue from delivered orders
  const totalRevenue = useMemo(() => 
    deliveredOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)
  , [deliveredOrders])

  const weekRevenue = useMemo(() => 
    weekDelivered.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)
  , [weekDelivered])

  // Average daily revenue (week revenue / days elapsed this week)
  const avgDailyRevenue = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysElapsed = dayOfWeek === 0 ? 7 : dayOfWeek
    return daysElapsed > 0 ? weekRevenue / daysElapsed : 0
  }, [weekRevenue])

  // Average order value
  const avgOrderValue = useMemo(() => 
    deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0
  , [totalRevenue, deliveredOrders])

  // Orders by status (from all orders)
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    allOrders.forEach((o: any) => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }, [allOrders])

  // Top products (by quantity in delivered orders)
  const topProducts = useMemo(() => {
    const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {}
    deliveredOrders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const id = item.productId || item.product_id || item.id
          const name = item.product_name || item.productName || `Produto ${id?.slice(0, 6)}`
          if (!productCounts[id]) productCounts[id] = { name, qty: 0, revenue: 0 }
          productCounts[id].qty += item.quantity || 0
          productCounts[id].revenue += item.subtotal || item.total_price || (item.unitPrice || item.unit_price || 0) * (item.quantity || 0)
        })
      }
    })
    return Object.values(productCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [deliveredOrders])

  // Daily revenue for the week
  const dailyRevenueChart = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const dailyData = days.map((label, i) => {
      const dayDate = new Date(weekRange.start)
      dayDate.setDate(weekRange.start.getDate() + i)
      const dayStr = dayDate.toISOString().split('T')[0]
      
      const dayOrders = allOrders.filter(o => {
        const dateStr = o.createdAt || o.created_at
        return dateStr?.startsWith(dayStr) && o.status === 'delivered'
      })
      const revenue = dayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)
      const count = dayOrders.length

      return { name: label, receita: revenue, pedidos: count }
    })
    return dailyData
  }, [allOrders, weekRange])

  // Chart data
  const statusChartData = ordersByStatus.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6b7280',
  }))

  const vehicleChart = deliveryByVehicle.map((v: any) => ({
    name: v.vehicleType === 'motorcycle' ? 'Moto' : v.vehicleType === 'bicycle' ? 'Bicicleta' : v.vehicleType === 'car' ? 'Carro' : v.vehicleType,
    tempo: Math.round(v.averageMinutes || 0),
    entregas: v.count || 0,
  }))

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  // AI Insights
  const loadAIInsights = async () => {
    setIsLoadingAI(true)
    try {
      const startDate = weekRange.start.toISOString().split('T')[0]
      const endDate = weekRange.end.toISOString().split('T')[0]
      const result = await reportsApi.getAIInsights({ startDate, endDate })
      setAiInsights(result)
      sonnerToast.success('Insights gerados com sucesso!')
    } catch {
      sonnerToast.error('Erro ao gerar insights de IA. Verifique se o AWS Bedrock está configurado.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  const weekLabel = `${weekRange.start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${weekRange.end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Analytics e insights do seu negócio</p>
        </div>
        <ErrorState title="Erro ao carregar relatórios" message={error} onRetry={loadReportData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Semana atual: {weekLabel} • {allOrders.length} pedidos no total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReportData}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Summary Stats with Animated Numbers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          <>
            {/* Revenue */}
            <Card className="p-6 gold-gradient border-0 text-primary-foreground hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-primary-foreground/80">Receita Total</span>
                <div className="rounded-lg p-2 bg-primary-foreground/20">
                  <DollarSign className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-primary-foreground">
                <AnimatedCurrency value={totalRevenue} duration={1800} />
              </h3>
              <span className="text-sm text-primary-foreground/70">
                Ticket médio: <AnimatedCurrency value={avgOrderValue} duration={1200} delay={300} />
              </span>
            </Card>

            {/* Orders */}
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total de Pedidos</span>
                <div className="rounded-lg p-2 bg-muted">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={allOrders.length} duration={1500} />
              </h3>
              <span className="text-sm text-muted-foreground">
                Esta semana: <AnimatedNumber value={weekOrders.length} duration={1000} delay={200} />
              </span>
            </Card>

            {/* Deliveries */}
            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Entregas Realizadas</span>
                <div className="rounded-lg p-2 bg-muted">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={deliveredOrders.length} duration={1500} delay={100} />
              </h3>
              <span className="text-sm text-muted-foreground">
                Esta semana: <AnimatedNumber value={weekDelivered.length} duration={1000} delay={300} />
              </span>
            </Card>

            {/* Avg Delivery Time */}
            <Card className={cn(
              "p-6 border hover:shadow-lg transition-all",
              avgDeliveryTime > 30 ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border"
            )}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Tempo Médio Entrega</span>
                <div className="rounded-lg p-2 bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={Math.round(avgDeliveryTime)} duration={1200} delay={200} /> <span className="text-lg font-normal">min</span>
              </h3>
              <span className="text-sm text-muted-foreground">
                Mais rápido: {Math.round(fastestDelivery)} min • Mais lento: {Math.round(slowestDelivery)} min
              </span>
            </Card>
          </>
        )}
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
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders by Status */}
            {isLoading ? <ChartSkeleton /> : (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Pedidos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {statusChartData.length > 0 ? (
                    <>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                              formatter={(value: number) => [`${value} pedidos`, 'Quantidade']}
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500} animationBegin={300}>
                              {statusChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                        {statusChartData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Daily Revenue */}
            {isLoading ? <ChartSkeleton /> : (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                    Receita Diária Média
                  </CardTitle>
                  <CardDescription>
                    Média diária: {formatCurrency(avgDailyRevenue)} • Semana: {weekLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyRevenueChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                          formatter={(value: number, name: string) => [
                            name === 'receita' ? formatCurrency(value) : `${value} pedidos`,
                            name === 'receita' ? 'Receita' : 'Pedidos entregues'
                          ]}
                        />
                        <Bar dataKey="receita" fill="#f97316" radius={[6, 6, 0, 0]} name="receita" animationDuration={1500} animationBegin={500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Products */}
          {!isLoading && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-400" />
                  Produtos Mais Vendidos
                </CardTitle>
                <CardDescription>Ranking por quantidade em pedidos entregues</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => {
                      const maxQty = Math.max(...topProducts.map(p => p.qty))
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className={cn(
                            "flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold flex-shrink-0",
                            index === 0 && "bg-amber-500/20 text-amber-400",
                            index === 1 && "bg-gray-500/20 text-gray-300",
                            index === 2 && "bg-orange-500/20 text-orange-400",
                            index > 2 && "bg-muted/50 text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-foreground truncate">{product.name}</p>
                              <p className="font-medium text-amber-400 flex-shrink-0 ml-2">{formatCurrency(product.revenue)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500/60 rounded-full transition-all duration-1000"
                                  style={{ width: `${maxQty > 0 ? (product.qty / maxQty) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                <AnimatedNumber value={product.qty} duration={1000} delay={index * 150} /> vendas
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">Nenhum dado disponível</div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 bg-card/50 border-border/50 text-center">
              <p className="text-3xl font-bold text-foreground"><AnimatedNumber value={Math.round(avgDeliveryTime)} duration={1200} /> min</p>
              <p className="text-sm text-muted-foreground">Tempo médio</p>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50 text-center">
              <p className="text-3xl font-bold text-emerald-400"><AnimatedNumber value={Math.round(fastestDelivery)} duration={1000} delay={100} /> min</p>
              <p className="text-sm text-muted-foreground">Mais rápido</p>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50 text-center">
              <p className="text-3xl font-bold text-amber-400"><AnimatedNumber value={Math.round(slowestDelivery)} duration={1000} delay={200} /> min</p>
              <p className="text-sm text-muted-foreground">Mais lento</p>
            </Card>
          </div>

          {vehicleChart.length > 0 && (
            <>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Tempo de Entrega por Veículo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vehicleChart} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                        <Legend formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: 12 }}>{value === 'tempo' ? 'Tempo médio (min)' : 'Total entregas'}</span>} />
                        <Bar dataKey="tempo" fill="#22c55e" radius={[4, 4, 0, 0]} name="tempo" animationDuration={1500} />
                        <Bar dataKey="entregas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="entregas" animationDuration={1500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                {deliveryByVehicle.map((v: any, i: number) => {
                  const icon = v.vehicleType === 'motorcycle' ? '🏍️' : v.vehicleType === 'bicycle' ? '🚲' : '🚗'
                  const name = v.vehicleType === 'motorcycle' ? 'Motocicleta' : v.vehicleType === 'bicycle' ? 'Bicicleta' : 'Carro'
                  return (
                    <Card key={i} className="p-4 bg-card/50 border-border/50">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <p className="font-semibold">{name}</p>
                          <p className="text-xs text-muted-foreground">{v.count} entregas</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tempo médio</span>
                        <span className="font-semibold"><AnimatedNumber value={Math.round(v.averageMinutes)} duration={1000} delay={i * 200} /> min</span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Gere insights inteligentes sobre a semana atual usando inteligência artificial (AWS Bedrock — Claude).
            </p>
            <Button
              size="lg"
              onClick={loadAIInsights}
              disabled={isLoadingAI}
              className="gap-3 px-8 py-6 text-base gold-gradient text-primary-foreground"
            >
              {isLoadingAI ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Analisando dados...</>
              ) : (
                <><Sparkles className="h-5 w-5" />Gerar Insights com IA</>
              )}
            </Button>
          </div>

          {aiInsights && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />Modelo: {aiInsights.model}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />{new Date(aiInsights.generatedAt).toLocaleString('pt-BR')}
                </Badge>
              </div>

              <Card className="bg-gradient-to-br from-amber-500/5 to-emerald-500/5 border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/20 flex-shrink-0">
                      <Sparkles className="h-8 w-8 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Resumo Inteligente</h3>
                      <p className="text-muted-foreground leading-relaxed">{aiInsights.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {aiInsights.recommendations?.length > 0 && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-400" />Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiInsights.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {aiInsights.highlights?.length > 0 && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-400" />Destaques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {aiInsights.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">{h}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!aiInsights && !isLoadingAI && (
            <Card className="p-8 bg-card/30 border-border/50 border-dashed">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-full p-4 bg-muted/50">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Insights não gerados</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Clique no botão acima para gerar análises e recomendações inteligentes com IA.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}