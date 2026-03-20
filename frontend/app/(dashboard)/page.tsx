'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/shared/stat-card'
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/skeleton-loader'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Order, DashboardMetrics } from '@/types'

// Mock data for demonstration
const mockMetrics: DashboardMetrics = {
  total_orders: 270,
  total_revenue: 1054.12,
  pending_orders: 12,
  average_delivery_time: 30,
  orders_today: 45,
  revenue_today: 892.5,
  orders_growth_percent: 12.5,
  revenue_growth_percent: 8.3,
}

const mockOrdersData = [
  { day: 'Seg', plan: 30, fact: 28 },
  { day: 'Ter', plan: 35, fact: 32 },
  { day: 'Qua', plan: 40, fact: 45 },
  { day: 'Qui', plan: 38, fact: 42 },
  { day: 'Sex', plan: 50, fact: 48 },
  { day: 'Sab', plan: 45, fact: 52 },
  { day: 'Dom', plan: 35, fact: 30 },
]

const mockRecentOrders: Order[] = [
  {
    id: '1',
    order_number: '#10245',
    customer_name: 'Joao Silva',
    customer_phone: '11999998888',
    delivery_address: 'Rua Principal, 123 - Apto 4B',
    items: [],
    subtotal: 45.5,
    delivery_fee: 5.0,
    total: 50.5,
    status: 'delivered',
    payment_method: 'pix',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    order_number: '#10244',
    customer_name: 'Maria Santos',
    customer_phone: '11988887777',
    delivery_address: 'Av. Brasil, 456 - Sala 12',
    items: [],
    subtotal: 32.0,
    delivery_fee: 8.0,
    total: 40.0,
    status: 'out_for_delivery',
    payment_method: 'credit_card',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    order_number: '#10243',
    customer_name: 'Pedro Costa',
    customer_phone: '11977776666',
    delivery_address: 'Rua das Flores, 789',
    items: [],
    subtotal: 67.9,
    delivery_fee: 5.0,
    total: 72.9,
    status: 'preparing',
    payment_method: 'debit_card',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    order_number: '#10242',
    customer_name: 'Ana Oliveira',
    customer_phone: '11966665555',
    delivery_address: 'Praca Central, 10',
    items: [],
    subtotal: 89.0,
    delivery_fee: 0,
    total: 89.0,
    status: 'pending',
    payment_method: 'cash',
    payment_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Activity heatmap data - simulating daily activity
const generateActivityData = () => {
  const data = []
  const today = new Date()
  
  for (let week = 0; week < 5; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (4 - week) * 7 - (6 - day))
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        dayOfWeek: day,
        week,
        count: Math.floor(Math.random() * 50) + 5,
        isWorkingDay: day < 5,
      })
    }
  }
  return data
}

const activityData = generateActivityData()

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setMetrics(mockMetrics)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Overview" />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
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
              <StatCard
                title="Total de Entregas"
                value={`${metrics?.total_orders || 0}`}
                subtitle="pedidos"
                change={metrics?.orders_growth_percent}
                icon={ShoppingBag}
                variant="gold"
                onClick={() => {}}
              />
              <StatCard
                title="Faturamento"
                value={formatCurrency(metrics?.total_revenue || 0)}
                change={metrics?.revenue_growth_percent}
                changeLabel="vs semana passada"
                icon={DollarSign}
              />
              <StatCard
                title="Tempo Medio de Entrega"
                value={`${metrics?.average_delivery_time || 0}`}
                subtitle="min"
                icon={Clock}
              />
              <StatCard
                title="Avaliacao Media"
                value="4.9"
                subtitle="pontos"
                icon={Star}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Chart */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Total de Pedidos</CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockOrdersData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 285)" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.16 0.005 285)',
                          border: '1px solid oklch(0.25 0.005 285)',
                          borderRadius: '8px',
                          color: 'oklch(0.95 0 0)',
                        }}
                      />
                      <Bar 
                        dataKey="plan" 
                        fill="oklch(0.35 0 0)" 
                        radius={[4, 4, 0, 0]}
                        name="Planejado"
                      />
                      <Bar 
                        dataKey="fact" 
                        fill="oklch(0.55 0.15 280)" 
                        radius={[4, 4, 0, 0]}
                        name="Realizado"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[oklch(0.35_0_0)]" />
                    <span className="text-sm text-muted-foreground">Planejado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[oklch(0.55_0.15_280)]" />
                    <span className="text-sm text-muted-foreground">Realizado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Calendar */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  Atividade em {format(new Date(), 'MMMM', { locale: ptBR })}
                </CardTitle>
                <Select defaultValue="month">
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="quarter">Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day) => (
                      <div key={day} className="text-xs text-muted-foreground py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {activityData.map((day, index) => {
                      const intensity = day.count / 50
                      const bgColor = day.isWorkingDay
                        ? `oklch(0.55 ${0.15 * intensity} 280 / ${0.3 + intensity * 0.7})`
                        : `oklch(0.45 0 0 / 0.3)`
                      
                      return (
                        <div
                          key={index}
                          className="aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors hover:ring-1 hover:ring-primary/50 cursor-pointer"
                          style={{ backgroundColor: bgColor }}
                          title={`${day.count} pedidos`}
                        >
                          {new Date(day.date).getDate()}
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[oklch(0.55_0.15_280)]" />
                      <span className="text-xs text-muted-foreground">Dia de trabalho</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[oklch(0.45_0_0_/_0.3)]" />
                      <span className="text-xs text-muted-foreground">Folga</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Orders */}
        {isLoading ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Historico de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={4} columns={6} />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Historico de Pedidos</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                Ver todos
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pedido</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Endereco</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tempo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRecentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">{order.order_number}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">{order.delivery_address}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">Comida</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-foreground">{formatCurrency(order.total)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">18 min</span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={order.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
