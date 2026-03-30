import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { Order, ReportFilters, ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('fastmeals_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('fastmeals_token')
        localStorage.removeItem('fastmeals_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ============================================
// ORDERS API (for fallback data)
// ============================================

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/api/orders')
    const result = response.data
    return Array.isArray(result) ? result : result.data || []
  },
}

// ============================================
// REPORTS API
// ============================================

export const reportsApi = {
  getRevenueByPeriod: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/revenue', { params: filters })
    return response.data
  },

  getOrdersByStatus: async () => {
    const response = await api.get('/api/reports/orders-by-status')
    return response.data
  },

  getTopProducts: async (filters?: ReportFilters) => {
    const response = await api.get('/api/reports/top-products', { params: filters })
    return response.data
  },

  getAverageDeliveryTime: async () => {
    const response = await api.get('/api/reports/average-delivery-time')
    return response.data
  },

  getAIInsights: async (filters: ReportFilters) => {
    const response = await api.get('/api/reports/ai-insights', { params: filters })
    return response.data
  },

  getDashboardMetrics: async () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    const endDate = now.toISOString().split('T')[0]

    const [revenue, ordersByStatus, topProducts, deliveryTime] = await Promise.all([
      reportsApi.getRevenueByPeriod({ startDate, endDate }).catch(() => ({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 })),
      reportsApi.getOrdersByStatus().catch(() => ({ data: [], total: 0 })),
      reportsApi.getTopProducts({ limit: 5 }).catch(() => ({ data: [] })),
      reportsApi.getAverageDeliveryTime().catch(() => ({ averageMinutes: 0, totalDelivered: 0 })),
    ])

    return { revenue, ordersByStatus, topProducts, deliveryTime }
  },
}

export default api