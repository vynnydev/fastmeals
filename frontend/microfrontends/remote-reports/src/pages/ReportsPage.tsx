import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StatCardSkeleton, ChartSkeleton } from '@/components/shared/skeleton-loader'
import { ErrorState } from '@/components/shared/error-state'
import { AnimatedNumber, AnimatedCurrency } from '@/hooks/use-animated-counter'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, ShoppingCart, Truck, Clock, BarChart3,
  Sparkles, RefreshCcw, Target, Zap, CheckCircle2,
  Loader2, TrendingUp, Calendar,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { ordersApi, reportsApi } from '@/lib/api'
import { toast } from 'sonner'
import type { Order } from '@/types'

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

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Reports-service data
  const [revenueData, setRevenueData] = useState<any>(null)
  const [ordersByStatusData, setOrdersByStatusData] = useState<any>(null)
  const [topProductsData, setTopProductsData] = useState<any>(null)
  const [deliveryTimeData, setDeliveryTimeData] = useState<any>(null)

  // Orders fallback
  const [allOrders, setAllOrders] = useState<Order[]>([])

  // AI Insights
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [startDate, endDate])

  const loadReportData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [revenue, statusData, products, deliveryTime, orders] = await Promise.all([
        reportsApi.getRevenueByPeriod({ startDate, endDate }).catch(() => null),
        reportsApi.getOrdersByStatus().catch(() => null),
        reportsApi.getTopProducts({ startDate, endDate, limit: 10 }).catch(() => null),
        reportsApi.getAverageDeliveryTime().catch(() => null),
        ordersApi.getAll().catch(() => []),
      ])

      setRevenueData(revenue)
      setOrdersByStatusData(statusData)
      setTopProductsData(products)
      setDeliveryTimeData(deliveryTime)
      setAllOrders(Array.isArray(orders) ? orders : [])
    } catch {
      setError('Erro ao carregar relatórios')
    } finally {
      setIsLoading(false)
    }
  }

  // Revenue metrics (reports-service first, then orders fallback)
  const totalRevenue = revenueData?.totalRevenue ??
    allOrders.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)

  const totalOrders = revenueData?.totalOrders ?? allOrders.length
  const avgOrderValue = revenueData?.averageOrderValue ?? (totalRevenue > 0 && totalOrders > 0 ? totalRevenue / totalOrders : 0)

  // Daily revenue chart
  const dailyRevenueChart = (revenueData?.dailyRevenue || []).map((d: any) => ({
    date: d.date ? d.date.slice(5) : '',
    receita: d.revenue || 0,
    pedidos: d.orders || 0,
  }))

  // Orders by status
  const ordersByStatus = useMemo(() => {
    if (ordersByStatusData?.data?.length > 0) {
      return ordersByStatusData.data.filter((s: any) => s.count > 0)
    }
    const counts: Record<string, number> = {}
    allOrders.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }, [ordersByStatusData, allOrders])

  const totalOrdersFromStatus = ordersByStatusData?.total ?? allOrders.length

  // Top products
  const topProducts = useMemo(() => {
    if (topProductsData?.data?.length > 0) return topProductsData.data
    const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {}
    allOrders.filter((o: any) => o.status === 'delivered').forEach((order: any) => {
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
      .slice(0, 10)
      .map(p => ({ productName: p.name, totalQuantity: p.qty, totalRevenue: p.revenue }))
  }, [topProductsData, allOrders])

  // Delivery time
  const avgDeliveryTime = deliveryTimeData?.averageMinutes ?? 0
  const fastestDelivery = deliveryTimeData?.fastestMinutes ?? 0
  const slowestDelivery = deliveryTimeData?.slowestMinutes ?? 0
  const totalDelivered = deliveryTimeData?.totalDelivered ?? allOrders.filter((o: any) => o.status === 'delivered').length
  const deliveryByVehicle = (deliveryTimeData?.byVehicleType || []).filter((v: any) => v.vehicleType !== 'unknown')

  // Chart data
  const statusChartData = ordersByStatus.map((item: any) => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6b7280',
  }))

  const vehicleChart = deliveryByVehicle.map((v: any) => ({
    name: v.vehicleType === 'motorcycle' ? '🏍️ Moto'
      : v.vehicleType === 'bicycle' ? '🚲 Bicicleta'
      : v.vehicleType === 'car' ? '🚗 Carro'
      : v.vehicleType,
    tempo: Math.round(v.averageMinutes || 0),
    entregas: v.count || 0,
  }))

  // AI Insights
  const loadAIInsights = async () => {
    setIsLoadingAI(true)
    try {
      const result = await reportsApi.getAIInsights({ startDate, endDate })
      setAiInsights(result)
      toast.success('Insights gerados com sucesso!')
    } catch {
      toast.error('Erro ao gerar insights de IA. Verifique se o AWS Bedrock está configurado.')
    } finally {
      setIsLoadingAI(false)
    }
  }

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
            Analytics e insights do seu negócio • {totalOrdersFromStatus} pedidos no total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[140px] bg-background" />
            <span className="text-muted-foreground">até</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[140px] bg-background" />
          </div>
          <Button variant="outline" size="sm" onClick={loadReportData}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          <>
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

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total de Pedidos</span>
                <div className="rounded-lg p-2 bg-muted"><ShoppingCart className="h-4 w-4 text-muted-foreground" /></div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={totalOrders} duration={1500} />
              </h3>
              <span className="text-sm text-muted-foreground">{totalOrdersFromStatus} no período selecionado</span>
            </Card>

            <Card className="p-6 bg-card border-border hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Entregas Realizadas</span>
                <div className="rounded-lg p-2 bg-muted"><Truck className="h-4 w-4 text-muted-foreground" /></div>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={totalDelivered} duration={1500} delay={100} />
              </h3>
              <span className="text-sm text-muted-foreground">pedidos entregues</span>
            </Card>

            <Card className={cn(
              'p-6 border hover:shadow-lg transition-all',
              avgDeliveryTime > 30 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card border-border'
            )}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Tempo Médio Entrega</span>
                <div className="rounded-lg p-2 bg-muted"><Clock className="h-4 w-4 text-muted-foreground" /></div>
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
          <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2"><Truck className="h-4 w-4" /> Entregas</TabsTrigger>
          <TabsTrigger value="insights" className="gap-2"><Sparkles className="h-4 w-4" /> IA Insights</TabsTrigger>
        </TabsList>

        {/* ========================================
            OVERVIEW TAB
            ======================================== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders by Status */}
            {isLoading ? <ChartSkeleton /> : (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Pedidos por Status</CardTitle>
                  <CardDescription>Distribuição dos pedidos no período</CardDescription>
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
                              formatter={(value: any) => [`${value} pedidos`, 'Quantidade']}
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500} animationBegin={300}>
                              {statusChartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                        {statusChartData.map((entry: any, index: number) => (
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
                    <TrendingUp className="h-5 w-5 text-amber-400" /> Receita Diária
                  </CardTitle>
                  <CardDescription>
                    {dailyRevenueChart.length > 0 ? `${dailyRevenueChart.length} dias com movimentação` : 'Nenhuma receita no período'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyRevenueChart.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyRevenueChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            formatter={(value: any, name: any) => [
                              name === 'receita' ? formatCurrency(value) : `${value} pedidos`,
                              name === 'receita' ? 'Receita' : 'Pedidos'
                            ]}
                          />
                          <Bar dataKey="receita" fill="#f97316" radius={[6, 6, 0, 0]} name="receita" animationDuration={1500} animationBegin={500} />
                          <Bar dataKey="pedidos" fill="#3b82f6" radius={[6, 6, 0, 0]} name="pedidos" animationDuration={1500} animationBegin={700} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Products */}
          {!isLoading && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-400" /> Produtos Mais Vendidos
                </CardTitle>
                <CardDescription>Ranking por quantidade vendida no período</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product: any, index: number) => {
                      const name = product.productName || product.product_name || product.name || 'Produto'
                      const qty = product.totalQuantity || product.quantity_sold || product.qty || 0
                      const rev = product.totalRevenue || product.revenue || 0
                      const maxQty = Math.max(...topProducts.map((p: any) => p.totalQuantity || p.quantity_sold || p.qty || 0))

                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className={cn(
                            'flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold flex-shrink-0',
                            index === 0 && 'bg-amber-500/20 text-amber-400',
                            index === 1 && 'bg-gray-500/20 text-gray-300',
                            index === 2 && 'bg-orange-500/20 text-orange-400',
                            index > 2 && 'bg-muted/50 text-muted-foreground'
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-foreground truncate">{name}</p>
                              <p className="font-medium text-amber-400 flex-shrink-0 ml-2">{formatCurrency(rev)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500/60 rounded-full transition-all duration-1000"
                                  style={{ width: `${maxQty > 0 ? (qty / maxQty) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                <AnimatedNumber value={qty} duration={1000} delay={index * 150} /> vendas
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

        {/* ========================================
            DELIVERY TAB
            ======================================== */}
        <TabsContent value="delivery" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 bg-card/50 border-border/50 text-center">
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                {avgDeliveryTime >= 1
                  ? <><AnimatedNumber value={Math.round(avgDeliveryTime)} duration={1200} delay={200} /> <span className="text-lg font-normal">min</span></>
                  : <><AnimatedNumber value={Math.round(avgDeliveryTime * 60)} duration={1200} delay={200} /> <span className="text-lg font-normal">seg</span></>
                }
              </h3>
              <p className="text-sm text-muted-foreground">Tempo médio</p>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50 text-center">
              <p className="text-3xl font-bold text-emerald-400">
                {fastestDelivery >= 1
                  ? <><AnimatedNumber value={Math.round(fastestDelivery)} duration={1000} delay={100} /> min</>
                  : <><AnimatedNumber value={Math.round(fastestDelivery * 60)} duration={1000} delay={100} /> seg</>
                }
              </p>
              <p className="text-sm text-muted-foreground">Mais rápido</p>
            </Card>
            <Card className="p-4 bg-card/50 border-border/50 text-center">
              <p className="text-3xl font-bold text-amber-400">
                <AnimatedNumber value={Math.round(slowestDelivery)} duration={1000} delay={200} /> min
              </p>
              <p className="text-sm text-muted-foreground">Mais lento</p>
            </Card>
          </div>

          {vehicleChart.length > 0 && (
            <>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Tempo de Entrega por Veículo</CardTitle>
                  <CardDescription>Comparativo de performance por tipo de veículo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vehicleChart} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                        <Legend formatter={(value: string) => <span style={{ color: '#a1a1aa', fontSize: 12 }}>{value === 'tempo' ? 'Tempo médio (min)' : 'Total entregas'}</span>} />
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
                        <span className="font-semibold">
                          {v.averageMinutes >= 1
                            ? <><AnimatedNumber value={Math.round(v.averageMinutes)} duration={1000} delay={i * 200} /> min</>
                            : <><AnimatedNumber value={Math.round(v.averageMinutes * 60)} duration={1000} delay={i * 200} /> seg</>
                          }
                        </span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}

          {vehicleChart.length === 0 && !isLoading && (
            <div className="py-8 text-center text-muted-foreground">Nenhum dado de entrega disponível</div>
          )}
        </TabsContent>

        {/* ========================================
            AI INSIGHTS TAB
            ======================================== */}
        <TabsContent value="insights" className="space-y-6">
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Gere insights inteligentes sobre o período selecionado usando inteligência artificial (AWS Bedrock — Claude).
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