'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/skeleton-loader'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Truck,
  ArrowUpRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ordersApi, reportsApi } from '@/lib/api'
import { AnimatedNumber, AnimatedCurrency } from '@/hooks/use-animated-counter'
import type { Order } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [averageOrderValue, setAverageOrderValue] = useState(0)
  const [avgDeliveryTime, setAvgDeliveryTime] = useState(0)
  const [totalDelivered, setTotalDelivered] = useState(0)
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [deliveryByVehicle, setDeliveryByVehicle] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const calculateStatusFromOrders = (orders: any[]) => {
    const counts: Record<string, number> = {}
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [orders, deliveryTime] = await Promise.all([
        ordersApi.getAll().catch(() => []),
        reportsApi.getAverageDeliveryTime().catch(() => ({ averageMinutes: 0, totalDelivered: 0, byVehicleType: [] })),
      ])
  
      const ordersList = Array.isArray(orders) ? orders : []
      
      const delivered = ordersList.filter((o: any) => o.status === 'delivered')
      const revenue = delivered.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)
      const avgValue = delivered.length > 0 ? revenue / delivered.length : 0
  
      setRecentOrders(ordersList.slice(0, 5))
      setTotalRevenue(revenue)
      setTotalOrders(ordersList.length)
      setAverageOrderValue(avgValue)
      setAvgDeliveryTime(deliveryTime.averageMinutes || 0)
      setTotalDelivered(deliveryTime.totalDelivered || delivered.length)
      setDeliveryByVehicle(deliveryTime.byVehicleType || [])
  
      // Always calculate status from orders (not reports-service)
      setOrdersByStatus(calculateStatusFromOrders(ordersList))
  
      // Top products from order items
      const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {}
      ordersList.forEach((order: any) => {
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
      setTopProducts(
        Object.values(productCounts)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5)
          .map(p => ({ productName: p.name, totalQuantity: p.qty, totalRevenue: p.revenue }))
      )
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const pendingOrders = ordersByStatus.find(s => s.status === 'pending')?.count || 0

  // Chart data
  const statusChartData = ordersByStatus.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#6b7280',
  }))

  const topProductsChart = topProducts.map(p => ({
    name: (p.productName || '').slice(0, 18),
    quantidade: p.totalQuantity || 0,
    receita: p.totalRevenue || 0,
  }))

  const getOrderDate = (order: Order) => {
    const dateStr = order.createdAt || order.created_at
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), "dd MMM, HH:mm", { locale: ptBR })
    } catch {
      return '-'
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          {totalOrders} pedidos • {totalDelivered} entregues • Receita: {formatCurrency(totalRevenue)}
        </p>
      </div>
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards with Animated Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Total Orders */}
              <Card className="p-6 gold-gradient border-0 text-primary-foreground transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-primary-foreground/80">Total de Pedidos</span>
                  <div className="rounded-lg p-2 bg-primary-foreground/20">
                    <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tight text-primary-foreground">
                    <AnimatedNumber value={totalOrders} duration={1500} />
                  </h3>
                  <span className="text-sm text-primary-foreground/70">pedidos no sistema</span>
                </div>
              </Card>

              {/* Revenue */}
              <Card className="p-6 bg-card border-border transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Receita Total</span>
                  <div className="rounded-lg p-2 bg-muted">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedCurrency value={totalRevenue} duration={1800} delay={200} />
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    Ticket médio: <AnimatedCurrency value={averageOrderValue} duration={1200} delay={400} />
                  </span>
                </div>
              </Card>

              {/* Delivery Time */}
              <Card className="p-6 bg-card border-border transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Tempo Médio Entrega</span>
                  <div className="rounded-lg p-2 bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedNumber value={Math.round(avgDeliveryTime)} duration={1200} delay={300} /> <span className="text-lg font-normal">min</span>
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    <AnimatedNumber value={totalDelivered} duration={1000} delay={500} /> entregas realizadas
                  </span>
                </div>
              </Card>

              {/* Pending */}
              <Card className={cn(
                "p-6 border transition-all duration-200 hover:shadow-lg",
                pendingOrders > 5 ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Pedidos Pendentes</span>
                  <div className="rounded-lg p-2 bg-muted">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold tracking-tight text-foreground">
                    <AnimatedNumber value={pendingOrders} duration={800} delay={400} />
                  </h3>
                  <span className="text-sm text-muted-foreground">aguardando ação</span>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status - Column Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Pedidos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusChartData.length > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 11 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #333',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
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
                    {/* Legend */}
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
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Top Products - Horizontal Bar Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Top Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {topProductsChart.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsChart} layout="vertical" barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#a1a1aa', fontSize: 12 }}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#a1a1aa', fontSize: 11 }}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                        />
                        <Bar dataKey="quantidade" fill="#f97316" radius={[0, 6, 6, 0]} name="Quantidade" animationDuration={1500} animationBegin={500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delivery Time by Vehicle */}
        {!isLoading && deliveryByVehicle.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Tempo de Entrega por Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 mb-4">
                {deliveryByVehicle.map((v: any, i: number) => {
                  const icon = v.vehicleType === 'motorcycle' ? '🏍️' : v.vehicleType === 'bicycle' ? '🚲' : '🚗'
                  const name = v.vehicleType === 'motorcycle' ? 'Motocicleta' : v.vehicleType === 'bicycle' ? 'Bicicleta' : 'Carro'
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          <AnimatedNumber value={Math.round(v.averageMinutes)} duration={1000} delay={i * 200} /> min • {v.count} entregas
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        {isLoading ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Últimos Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={4} columns={5} />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Últimos Pedidos</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = '/orders'}>
                Ver todos
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pedido</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => window.location.href = '/orders'}>
                          <td className="py-3 px-4">
                            <span className="font-medium font-mono text-sm text-foreground">#{order.id.slice(0, 8)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-foreground">{order.customerName || order.customer_name || 'Cliente'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-foreground">{formatCurrency(order.totalAmount || order.total || 0)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{getOrderDate(order)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={order.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhum pedido encontrado
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}